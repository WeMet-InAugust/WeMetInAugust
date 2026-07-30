# Server integration and API contract

This document provides example server endpoints, nginx configuration, and ffmpeg recipes to integrate the admin uploader and movie miniplayer shipped in the repository.

## API contract

- POST /api/uploads/chunk
  - Accepts multipart/form-data
  - Fields: uploadId (string), part (string|number), fileName (string), chunk (File blob)
  - Stores chunks in a temporary directory keyed by uploadId and part. Returns 200 on success.

- POST /api/uploads/complete
  - Accepts JSON body: { uploadId, fileName }
  - Assembles chunks into final file and returns JSON:
    - If immediate assets are ready: { status: 'complete', mp4: '/media/abc.mp4', m3u8: '/media/abc.m3u8', captions: '/media/abc.vtt' }
    - If server is transcoding: { status: 'processing', statusUrl: '/api/uploads/status/{uploadId}' }

- GET /api/uploads/status/:uploadId
  - Returns JSON describing processing state: { status: 'processing' | 'complete' | 'failed', mp4?, m3u8?, captions? }

Notes:
- The uploader expects the finalize endpoint to either provide playback URLs immediately or return a statusUrl for polling.
- The player prefers m3u8 when available but will fall back to mp4.

---

## Express.js example (upload assembly + transcode kickoff)

Save as `server/upload-handler-express.js` and adapt to your environment. This is intentionally minimal — production systems should add authentication, validation, storage durability (S3/GCS), and background job queues (Bull/Sidekiq/etc.).

```javascript
// server/upload-handler-express.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const multer = require('multer');

const app = express();
app.use(express.json());

const UPLOAD_TMP = path.resolve(__dirname, '../tmp/uploads');
const MEDIA_OUT = path.resolve(__dirname, '../public/media');
if(!fs.existsSync(UPLOAD_TMP)) fs.mkdirSync(UPLOAD_TMP, { recursive: true });
if(!fs.existsSync(MEDIA_OUT)) fs.mkdirSync(MEDIA_OUT, { recursive: true });

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Chunk upload endpoint
app.post('/api/uploads/chunk', upload.single('chunk'), (req, res) => {
  try{
    const { uploadId, part, fileName } = req.body;
    if(!uploadId || part == null || !req.file) return res.status(400).send('Missing fields');
    const dir = path.join(UPLOAD_TMP, uploadId);
    if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const partPath = path.join(dir, String(part));
    fs.writeFileSync(partPath, req.file.buffer);
    return res.sendStatus(200);
  }catch(err){ console.error(err); return res.status(500).send('server error'); }
});

// Finalize: assemble chunks and start transcode (non-blocking)
app.post('/api/uploads/complete', async (req, res) => {
  try{
    const { uploadId, fileName } = req.body;
    if(!uploadId || !fileName) return res.status(400).json({ error: 'missing' });
    const dir = path.join(UPLOAD_TMP, uploadId);
    if(!fs.existsSync(dir)) return res.status(404).json({ error: 'no chunks' });

    const outTemp = path.join(MEDIA_OUT, uploadId + '_' + path.basename(fileName));
    const write = fs.createWriteStream(outTemp);
    const parts = fs.readdirSync(dir).sort((a,b)=>Number(a)-Number(b));
    for(const p of parts){ const buf = fs.readFileSync(path.join(dir,p)); write.write(buf); }
    write.end();

    // kick off transcode in background: create MP4 and HLS
    const baseName = path.basename(outTemp, path.extname(outTemp));
    const mp4Out = path.join(MEDIA_OUT, baseName + '.mp4');
    const m3u8Out = path.join(MEDIA_OUT, baseName + '.m3u8');

    // spawn a background ffmpeg job (fire-and-forget here). In production use job queue.
    const ffmpegCmd = `ffmpeg -y -i "${outTemp}" -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 128k "${mp4Out}" && ffmpeg -y -i "${mp4Out}" -c copy -hls_time 6 -hls_playlist_type vod -hls_segment_filename "${path.join(MEDIA_OUT, baseName)}_%03d.ts" "${m3u8Out}"`;
    exec(ffmpegCmd, (err, stdout, stderr)=>{
      if(err) console.error('transcode error', err, stderr);
      else console.log('transcode finished', stdout);
      // cleanup temp assembled file
      try{ fs.unlinkSync(outTemp); }catch(e){}
    });

    // respond immediately with processing state and statusUrl for polling
    return res.json({ status: 'processing', statusUrl: `/api/uploads/status/${uploadId}` });
  }catch(err){ console.error(err); return res.status(500).json({ error: 'server' }); }
});

// simple status poll (in production check real job status and S3 keys)
app.get('/api/uploads/status/:uploadId', (req,res)=>{
  const uploadId = req.params.uploadId;
  const files = fs.readdirSync(MEDIA_OUT).filter(f => f.startsWith(uploadId + '_'));
  const mp4 = files.find(f => f.endsWith('.mp4'));
  const m3u8 = files.find(f => f.endsWith('.m3u8'));
  if(mp4 || m3u8){ return res.json({ status: 'complete', mp4: mp4 ? `/media/${mp4}` : null, m3u8: m3u8 ? `/media/${m3u8}` : null }); }
  return res.json({ status: 'processing' });
});

app.use('/media', express.static(MEDIA_OUT, { setHeaders: (res, path)=>{
  if(path.endsWith('.m3u8')) res.setHeader('Content-Type','application/vnd.apple.mpegurl');
  if(path.endsWith('.ts')) res.setHeader('Content-Type','video/MP2T');
  if(path.endsWith('.mp4')) res.setHeader('Content-Type','video/mp4');
  if(path.endsWith('.vtt')) res.setHeader('Content-Type','text/vtt');
  res.setHeader('Access-Control-Allow-Origin','*');
}}));

app.listen(3000, ()=>console.log('Upload server listening on :3000'));
```

Notes:
- This example uses local FS to simplify testing. Replace with S3 / GCS for production. Use a background queue (Redis/Bull) to run ffmpeg and update a DB or object storage entry when complete.

---

## nginx example: media location and MIME/CORS

Save as `server/nginx-media.conf` and include into your nginx server block.

```
location /media/ {
  root /var/www/your-site/public; # adjust
  add_header Access-Control-Allow-Origin "*";
  types {
    application/vnd.apple.mpegurl m3u8;
    video/mp2t ts;
    video/mp4 mp4;
    text/vtt vtt;
  }
  # optional caching
  expires 1d;
}
```

---

## ffmpeg recipes

- Create an MP4 (faststart):

  ffmpeg -i input.mp4 -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 128k -movflags +faststart output.mp4

- Create HLS VOD from an MP4:

  ffmpeg -i output.mp4 -c copy -hls_time 6 -hls_playlist_type vod -hls_segment_filename 'segment_%03d.ts' out.m3u8

- Convert SRT -> VTT:

  ffmpeg -i subs.srt subs.vtt

---

If you want, I can also add a small Dockerfile to run the express example and a sample test asset tarball to help reproduce the end-to-end verification locally. Tell me if you prefer a branch/PR for server files or commit to main.