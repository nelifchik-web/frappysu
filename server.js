const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Хранилище профилей в оперативной памяти сервера (пока без БД)
const users = {};

// Главная страница для проверки работы сервера
app.get("/", (req, res) => {
    res.send("FRAPPY SERVER OK");
});

// Создание профиля
app.post("/create-profile", (req, res) => {
    const { username, status } = req.body;
    if (!username) {
        return res.json({ success: false, message: "Никнейм обязателен" });
    }

    const lowerName = username.toLowerCase();
    if (users[lowerName]) {
        return res.json({ success: false, message: "Этот ник уже занят!" });
    }

    const newUser = {
        username: username,
        status: status || "",
        createdAt: new Date()
    };

    users[lowerName] = newUser;
    res.json({ success: true, user: newUser });
});

// ПОИСК МУЗЫКИ ЧЕРЕЗ YOUTUBE API
app.get("/search", async (req, res) => {
    const q = req.query.q;
    if (!q) return res.json([]);

    // Берем ключ из настроек Render, если его там нет — берем твой спец-ключ
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "AIzaSyDW1cbsx1G-w6ogFtBI_tEvjpvk5bRuwzU"; 

    // Чистая, рабочая ссылка без лишних символов
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q + " music")}&type=video&maxResults=12&key=${YOUTUBE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Если YouTube ругнулся на лимиты или сам ключ
        if (data.error) {
            console.error("YouTube Error:", data.error.message);
            return res.json([
                { id: "dQw4w9WgXcQ", title: "Ошибка YouTube API: " + data.error.message, artist: "Система" }
            ]);
        }

        // Если всё ок — форматируем треки для фронтенда
        const tracks = data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle
        }));

        res.json(tracks);
    } catch (err) {
        console.error("Server Error:", err);
        res.json([
            { id: "dQw4w9WgXcQ", title: "Критическая ошибка сервера", artist: "Система" }
        ]);
    }
});

// Запуск сервера на порту, который выдаст Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
