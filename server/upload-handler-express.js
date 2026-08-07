// server/upload-handler-express.js
// Lightweight express server example for chunked uploads and background transcode (for testing only).

const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const multer = require('multer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());
app.use(helmet());

// simple rate limiter for API endpoints
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false });
app.use('/api/', apiLimiter);

const UPLOAD_TMP = path.resolve(__dirname, '../tmp/uploads');
const MEDIA_OUT = path.resolve(__dirname, '../public/media');
const MOD_LOG = path.resolve(__dirname, '../tmp/moderation.log');
if(!fs.existsSync(UPLOAD_TMP)) fs.mkdirSync(UPLOAD_TMP, { recursive: true });
if(!fs.existsSync(MEDIA_OUT)) fs.mkdirSync(MEDIA_OUT, { recursive: true });
if(!fs.existsSync(path.dirname(MOD_LOG))) fs.mkdirSync(path.dirname(MOD_LOG), { recursive: true });

const storage = multer.memoryStorage();
const upload = multer({ storage });

// very small, local moderation/blocklist example — extend as needed
const BLOCKLIST = [ /\b(?:eval\(|child_process|require\(|process\.env)\b/i ];
const SENSITIVE = [/suicide/i, /kill myself/i, /end my life/i, /hurt myself/i];

function logModeration(event){
  try{
    const line = JSON.stringify(Object.assign({ ts: new Date().toISOString() }, event)) + '\n';
    fs.appendFileSync(MOD_LOG, line);
  }catch(e){ console.error('mod log failed', e); }
}

function isBlockedText(text){
  if(!text) return false;
  for(const r of BLOCKLIST){ if(r.test(text)) return true; }
  return false;
}

function localResponder(message){
  const m = (message||'').toLowerCase();
  if(SENSITIVE.some(r=>r.test(m))){
    return "I'm sorry you're feeling this way. I can't help with instructions for self-harm. If you are at immediate risk, please contact local emergency services or a crisis hotline.";
  }
  if(m.includes('star')||m.includes('astron')) return 'Stars are like stories — both are ancient lights we learn to read.';
  if(m.includes('art')) return 'Art is a conversation between maker and time.';
  if(m.includes('history')||m.includes('war')||m.includes('atrocity')) return 'Content warning: this discusses historical violence — here is a factual, non-graphic summary. Please ask for details if you want them.';
  if(m.includes('hello')||m.includes('hi')) return "Hmph. Hello. Don't get used to it.";
  if(m.includes('recommend')) return 'Try reading about Romanticism and its relationship to early astronomy — surprising connections.';
  return "I'm not sure — could you say a bit more? I can discuss science, art, history, and culture.";
}

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

    // sanitize filename
    const safeName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const outTemp = path.join(MEDIA_OUT, uploadId + '_' + safeName);
    const write = fs.createWriteStream(outTemp);
    const parts = fs.readdirSync(dir).sort((a,b)=>Number(a)-Number(b));
    for(const p of parts){ const buf = fs.readFileSync(path.join(dir,p)); write.write(buf); }
    write.end();

    const baseName = path.basename(outTemp, path.extname(outTemp));
    const mp4Out = path.join(MEDIA_OUT, baseName + '.mp4');
    const m3u8Out = path.join(MEDIA_OUT, baseName + '.m3u8');

    // background transcode (best-effort for test envs only)
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

// simple AI query endpoint (local fallback + small moderation/logging)
app.post('/api/aoi/query', (req, res) => {
  try{
    const message = req.body && req.body.message ? String(req.body.message) : '';
    if(!message) return res.status(400).json({ error: 'missing message' });

    if(isBlockedText(message)){
      logModeration({ type: 'blocked', ip: req.ip, message: message.slice(0,200) });
      return res.status(400).json({ error: 'message blocked' });
    }

    // simple sensitive checks
    if(SENSITIVE.some(r=>r.test(message))){
      logModeration({ type: 'sensitive', ip: req.ip, message: message.slice(0,200) });
      return res.json({ reply: localResponder(message) });
    }

    // provider mode is disabled by default for safety — use localResponder until LLM_API_KEY is set
    if(process.env.LLM_API_KEY){
      // Provider integration placeholder: do moderation -> call provider -> post-filter -> return
      // For safety in this repository we do not call any provider automatically.
      logModeration({ type: 'provider-skip', ip: req.ip, message: message.slice(0,200) });
      return res.json({ reply: localResponder(message) });
    }

    const reply = localResponder(message);
    return res.json({ reply });
  }catch(err){ console.error(err); return res.status(500).json({ error: 'server' }); }
});

app.use('/media', express.static(MEDIA_OUT, { setHeaders: (res, path)=>{
  if(path.endsWith('.m3u8')) res.setHeader('Content-Type','application/vnd.apple.mpegurl');
  if(path.endsWith('.ts')) res.setHeader('Content-Type','video/MP2T');
  if(path.endsWith('.mp4')) res.setHeader('Content-Type','video/mp4');
  if(path.endsWith('.vtt')) res.setHeader('Content-Type','text/vtt');
  res.setHeader('Access-Control-Allow-Origin','*');
}}));

// basic health
app.get('/health', (req,res)=>res.json({ ok: true }));

app.listen(process.env.PORT || 3000, ()=>console.log('Upload server listening on :' + (process.env.PORT || 3000)));
