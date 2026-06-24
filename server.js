const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const users = {};

// Главная страница
app.get("/", (req, res) => {
    res.send("FRAPPY SERVER OK - AUDIUS STREAMING ACTIVE");
});

// Создание профиля
app.post("/create-profile", (req, res) => {
    const { username, status } = req.body;
    if (!username) return res.json({ success: false, message: "Никнейм обязателен" });

    const lowerName = username.toLowerCase();
    if (users[lowerName]) return res.json({ success: false, message: "Этот ник уже занят!" });

    const newUser = { username, status: status || "", createdAt: new Date() };
    users[lowerName] = newUser;
    res.json({ success: true, user: newUser });
});

// ПОИСК ПО ВСЕЙ БАЗЕ AUDIUS (БЕЗ VPN, БЕЗ КЛЮЧЕЙ, ПОЛНЫЕ ТРЕКИ)
app.get("/search", async (req, res) => {
    const q = req.query.q;
    if (!q) return res.json([]);

    try {
        // 1. Получаем список живых серверов Audius, чтобы запрос точно не отвалился
        const hostResponse = await fetch("https://api.audius.co");
        const hostData = await hostResponse.json();
        const hosts = hostData.data;
        
        // Берем случайный рабочий сервер из списка для надежности
        const randomHost = hosts[Math.floor(Math.random() * hosts.length)];

        // 2. Делаем поиск треков на этом сервере
        const searchUrl = `${randomHost}/v1/tracks/search?query=${encodeURIComponent(q)}&app_name=FRAPPY_MUSIC_APP`;
        const response = await fetch(searchUrl);
        const searchData = await response.json();

        if (!searchData.data || searchData.data.length === 0) {
            return res.json([]);
        }

        // 3. Форматируем массив треков с ссылками на ПОЛНЫЕ аудиопотоки
        const tracks = searchData.data.map(item => ({
            id: item.id,
            title: item.title,
            artist: item.user.name,
            // Прямая ссылка на стриминг полного трека без ограничений времени
            url: `${randomHost}/v1/tracks/${item.id}/stream?app_name=FRAPPY_MUSIC_APP`
        }));

        res.json(tracks);
    } catch (err) {
        console.error("Ошибка Audius API:", err);
        // Запасной оффлайн-пак на случай полного сбоя сети
        res.json([
            { id: "off1", title: "Запрос не удался", artist: "Проверьте сеть", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }
        ]);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
