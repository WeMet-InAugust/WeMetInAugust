// server/upload-handler-express.js
// Lightweight express server example for chunked uploads and background transcode (for testing only).

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

    const baseName = path.basename(outTemp, path.extname(outTemp));
    const mp4Out = path.join(MEDIA_OUT, baseName + '.mp4');
    const m3u8Out = path.join(MEDIA_OUT, baseName + '.m3u8');

    const ffmpegCmd = `ffmpeg -y -i "${outTemp}" -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 128k "${mp4Out}" && ffmpeg -y -i "${mp4Out}" -c copy -hls_time 6 -hls_playlist_type vod -hls_segment_filename "${path.join(MEDIA_OUT, baseName)}_%03d.ts" "${m3u8Out}"`;
    exec(ffmpegCmd, (err, stdout, stderr)=>{
      if(err) console.error('transcode error', err, stderr);
      else console.log('transcode finished', stdout);
      try{ fs.unlinkSync(outTemp); }catch(e){}
    });

    return res.json({ status: 'processing', statusUrl: `/api/uploads/status/${uploadId}` });
  }catch(err){ console.error(err); return res.status(500).json({ error: 'server' }); }
});

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
