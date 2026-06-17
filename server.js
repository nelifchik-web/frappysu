const express = require("express");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const USERS_FILE = "./users.json";
const YOUTUBE_API_KEY = "AIzaSyDW1cbsx1G-w6ogFtBI_tEvjpvk5bRuwzU";

// ==================== USERS ====================
function getUsers() {
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    } catch {
        return [];
    }
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.post("/create-profile", (req, res) => {
    const { username, status } = req.body || {};
    if (!username) return res.json({ success: false, message: "Введи ник" });

    const users = getUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return res.json({ success: false, message: "Ник занят" });
    }

    const user = {
        id: "frp_" + Date.now(),
        username,
        status: status || "",
        createdAt: new Date().toISOString()
    };

    users.push(user);
    saveUsers(users);
    res.json({ success: true, user });
});

// ==================== MUSIC SEARCH ====================
app.get("/search", async (req, res) => {
    const q = req.query.q;
    if (!q) return res.json([]);

    try {
        const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
            params: {
                part: "snippet",
                q: q + " music",
                type: "video",
                maxResults: 12,
                key: YOUTUBE_API_KEY
            },
            timeout: 8000
        });

        const tracks = response.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle || "Unknown"
        }));

        res.json(tracks);
    } catch (err) {
        console.error("YouTube Error:", err.message);
        // Хороший fallback
        res.json([
            { id: "JGwWNGJdvx8", title: "The Weeknd - Blinding Lights", artist: "The Weeknd" },
            { id: "dQw4w9wgxcq", title: "Rick Astley - Never Gonna Give You Up", artist: "Rick Astley" },
            { id: "kXYiU_JCYtU", title: "Travis Scott - FE!N", artist: "Travis Scott" }
        ]);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FRAPPY SERVER RUNNING ON ${PORT}`));