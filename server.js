const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const YOUTUBE_API_KEY = 'AIzaSyDW1cbsx1G-w6ogFtBI_tEvjpvk5bRuwzU';

// Поиск треков
app.get('/search', async (req, res) => {
    const q = req.query.q;
    if (!q) return res.json([]);
    
    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: q + ' music',
                type: 'video',
                maxResults: 10,
                key: YOUTUBE_API_KEY
            },
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

// Прокси для YouTube (отдаёт страницу как есть)
app.get('/video/:id', (req, res) => {
    res.redirect(`https://www.youtube.com/embed/${req.params.id}?autoplay=1`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Сервер на порту ' + PORT));