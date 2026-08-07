// server/upload-handler-express.js
// Lightweight express server example for chunked uploads, background transcode, and a safe AI gateway (for testing only).

require('dotenv').config();
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

// Optional AI Gateway settings
const LLM_API_KEY = process.env.LLM_API_KEY || null; // set this to enable provider-backed responses
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai';

// Basic local safety blocklist (conservative). Expand as needed in production.
const LOCAL_BLOCKLIST = [
  'nigger','faggot','cunt','motherfucker','bitch','kike','chink'
];
function containsBlocked(text){ const t = (text||'').toLowerCase(); return LOCAL_BLOCKLIST.some(w => t.includes(w)); }

// Simple local responder as a safe fallback when no LLM key is provided.
function localRespond(message){ const m = (message||'').toLowerCase();
  if(/suicide|kill myself|end my life|hurt myself/.test(m)){
    return "I'm sorry you're feeling this way. I can't help with instructions, but if you're at immediate risk please contact local emergency services. Consider reaching out to a trusted person or a crisis hotline in your country.";
  }
  if(m.includes('star')||m.includes('astron')) return 'Stars are like stories — both are ancient lights we learn to read.';
  if(m.includes('art')) return 'Art is a conversation between maker and time.';
  if(m.includes('history')||m.includes('war')||m.includes('atrocity')) return 'I can provide a factual, non-graphic summary of historical events and their causes and consequences. Would you like that?';
  if(m.includes('hello')||m.includes('hi')) return 'Hmph. Hello. Don\'t get used to it.';
  if(m.includes('recommend')) return 'Try reading about Romanticism and its relationship to early astronomy — there are surprising connections.';
  return "I\'m not sure — could you say a bit more? I can discuss science, art, history, and culture.";
}

// AI moderation helper using OpenAI Moderation API (if key is provided and provider is openai)
async function remoteModerationOpenAI(text){
  if(!LLM_API_KEY) return { ok: true };
  if(typeof globalThis.fetch !== 'function') return { ok: true };
  try{
    const resp = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LLM_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: text })
    });
    const j = await resp.json();
    const flagged = j && j.results && j.results[0] && j.results[0].flagged;
    return { ok: !flagged, raw: j };
  }catch(e){ console.error('moderation error', e); return { ok: true, error: e }; }
}

// AI chat via OpenAI Chat Completions v1 (if key is provided)
async function remoteChatOpenAI(systemPrompt, userMessage){
  if(!LLM_API_KEY) throw new Error('no key');
  if(typeof globalThis.fetch !== 'function') throw new Error('fetch not available in runtime');
  const payload = {
    model: process.env.LLM_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.6,
    max_tokens: 500
  };
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${LLM_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const j = await resp.json();
  const reply = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
  return { reply, raw: j };
}

// System prompt for France Aoi (concise, enforces safety templates)
const FRANCE_AOI_SYSTEM = `You are France Aoi, an educational, polite, and slightly tsundere virtual companion for a cultural museum website. Your tone is slightly aloof but helpful. Keep replies concise and kind.
Safety constraints (must follow exactly):
- NEVER produce slurs, hate speech, harassment, or insults targeting protected classes or individuals.
- DO NOT produce explicit sexual content, or instructions for illegal or harmful actions.
- For requests about violent or disturbing historical events, provide a factual, non-graphic summary and prepend a brief content warning, e.g. "Content warning: this discusses historical violence — non-graphic summary follows.".
- For self-harm or suicidal expressions, refuse to provide instructions and respond with supportive phrasing and recommend professional help.
- If a user asks for disallowed content, refuse briefly and offer a safe alternative using one of these templates: "I'm sorry — I can't help with that. I can provide a factual summary or discuss the ethical context instead." or "I can't assist with that request. I can, however, discuss related safe topics or provide resources."
Behaviors:
- Offer citations or suggest where to look for authoritative sources when discussing history and science.
- Prioritize user safety, privacy, and non-graphic explanations.
`;

// API endpoint: AI assistant for France Aoi
app.post('/api/aoi/query', async (req, res) => {
  try{
    const { message } = req.body;
    if(!message || typeof message !== 'string') return res.status(400).json({ error: 'missing message' });

    // quick local blocklist
    if(containsBlocked(message)) return res.json({ reply: "I'm sorry — I can't assist with that request." });

    // If we have an LLM key and fetch available, run remote moderation first
    if(LLM_API_KEY && typeof globalThis.fetch === 'function'){
      const mod = await remoteModerationOpenAI(message);
      if(!mod.ok) {
        // optional: log mod.raw for admin review (don't expose to client)
        console.warn('moderation flagged', mod.raw);
        return res.json({ reply: "I\'m sorry — I can\'t assist with that request. I can provide a factual, non-graphic summary instead." });
      }
      // safe to call LLM
      try{
        const chat = await remoteChatOpenAI(FRANCE_AOI_SYSTEM, message);
        let reply = chat.reply || '';
        // defensive post-filter (local blocklist)
        if(containsBlocked(reply)) reply = "I'm sorry — I can't assist with that request.";
        return res.json({ reply, meta: { provider: 'openai', raw: chat.raw } });
      }catch(err){ console.error('remote chat error', err); /* fallthrough to local fallback */ }
    }

    // No provider configured or fallback: use local safe responder
    const safe = localRespond(message);
    return res.json({ reply: safe, meta: { provider: 'local' } });
  }catch(err){ console.error(err); return res.status(500).json({ error: 'server' }); }
});

// --- existing upload handler code (kept and integrated) ---

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

    // ffmpeg command: transcode and generate HLS
    const ffmpegCmd = `ffmpeg -y -i "${outTemp}" -c:v libx264 -crf 20 -preset medium -c:a aac -b:a 128k "${mp4Out}" && ffmpeg -y -i "${mp4Out}" -c copy -hls_time 6 -hls_playlist_type vod "${m3u8Out}"`;
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

app.listen(process.env.PORT || 3000, ()=>console.log('Upload & AI gateway listening on', process.env.PORT || 3000));
