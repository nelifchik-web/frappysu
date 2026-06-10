const express = require("express");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

const USERS_FILE = "./users.json";

const YOUTUBE_API_KEY = "AIzaSyDW1cbsx1G-w6ogFtBI_tEvjpvk5bRuwzU";

// ==================== USERS ====================

function getUsers() {
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE));
    } catch {
        return [];
    }
}

function saveUsers(users) {
    fs.writeFileSync(
        USERS_FILE,
        JSON.stringify(users, null, 2)
    );
}

app.get("/users", (req, res) => {
    res.json(getUsers());
});

app.get("/user/:id", (req, res) => {

    const users = getUsers();

    const user = users.find(
        u => u.id === req.params.id
    );

    if (!user) {
        return res.status(404).json({
            success: false
        });
    }

    res.json(user);
});

app.post("/create-profile", (req, res) => {

    const { username, status } = req.body;

    if (!username) {
        return res.json({
            success: false,
            message: "Введи ник"
        });
    }

    const users = getUsers();

    const exists = users.find(
        u =>
            u.username.toLowerCase() ===
            username.toLowerCase()
    );

    if (exists) {
        return res.json({
            success: false,
            message: "Ник занят"
        });
    }

    const user = {
        id: "frp_" + Date.now(),
        username,
        status: status || "",
        createdAt: new Date().toISOString()
    };

    users.push(user);

    saveUsers(users);

    res.json({
        success: true,
        user
    });
});

// ==================== MUSIC ====================

app.get("/search", async (req, res) => {

    const q = req.query.q;

    if (!q) {
        return res.json([]);
    }

    try {

        const response = await axios.get(
            "https://www.googleapis.com/youtube/v3/search",
            {
                params: {
                    part: "snippet",
                    q: q + " music",
                    type: "video",
                    maxResults: 15,
                    key: YOUTUBE_API_KEY
                },
                timeout: 5000
            }
        );

        const tracks = response.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            thumb:
                item.snippet.thumbnails?.medium?.url ||
                item.snippet.thumbnails?.default?.url
        }));

        res.json(tracks);

    } catch (err) {

        console.log(err.message);

        res.json([]);
    }
});

// ==================== VIDEO ====================

app.get("/video/:id", (req, res) => {

    res.redirect(
        `https://www.youtube.com/embed/${req.params.id}?autoplay=1`
    );

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("FRAPPY SERVER STARTED");

});