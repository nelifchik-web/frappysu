const express = require('express');
const cors = require('cors');
const axios = require('axios');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

const YOUTUBE_API_KEY = 'AIzaSyDW1cbsx1G-w6ogFtBI_tEvjpvk5bRuwzU';
const CACHE_DIR = '/tmp/frappy-cache';

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

let activeStreams = 0;
const MAX_STREAMS = 3;

setInterval(() => {
    fs.readdir(CACHE_DIR, (err, files) => {
        if (err) return;
        files.forEach(file => {
            const filePath = path.join(CACHE_DIR, file);
            const stat = fs.statSync(filePath);
            if (Date.now() - stat.mtimeMs > 3600000) fs.unlinkSync(filePath);
        });
    });
}, 3600000);

app.get('/search', async (req, res) => {
    const q = req.query.q;
    if (!q) return res.json([]);
    
    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: { part: 'snippet', q: q + ' music', type: 'video', maxResults: 10, key: YOUTUBE_API_KEY },
            timeout: 5000
        });
        
        const tracks = response.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            thumb: item.snippet.thumbnails.default.url
        }));
        
        res.json(tracks);
    } catch(e) {
        res.json([]);
    }
});

app.get('/stream/:id', async (req, res) => {
    const videoId = req.params.id;
    const cacheFile = path.join(CACHE_DIR, videoId + '.mp3');
    
    if (activeStreams >= MAX_STREAMS) {
        return res.status(503).json({ error: 'busy' });
    }
    
    if (fs.existsSync(cacheFile)) {
        res.setHeader('Content-Type', 'audio/mp3');
        return fs.createReadStream(cacheFile).pipe(res);
    }
    
    try {
        activeStreams++;
        const stream = ytdl(videoId, {
            filter: 'audioonly',
            quality: 'lowestaudio',
            highWaterMark: 1024 * 1024
        });
        
        res.setHeader('Content-Type', 'audio/mp3');
        
        const writeStream = fs.createWriteStream(cacheFile);
        stream.pipe(writeStream);
        stream.pipe(res);
        
        stream.on('end', () => { activeStreams--; });
        stream.on('error', () => { activeStreams--; });
    } catch(e) {
        activeStreams--;
        res.status(500).json({ error: 'Ошибка загрузки' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Сервер на порту ' + PORT));