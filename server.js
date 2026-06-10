const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const USERS_FILE = "./users.json";

// Получить всех пользователей
app.get("/users", (req, res) => {
    try {
        const users = JSON.parse(fs.readFileSync(USERS_FILE));
        res.json(users);
    } catch {
        res.json([]);
    }
});

// Создать профиль
app.post("/create-profile", (req, res) => {
    const { username, avatar, status } = req.body;

    if (!username) {
        return res.status(400).json({
            success: false,
            message: "Укажи ник"
        });
    }

    let users = [];

    try {
        users = JSON.parse(fs.readFileSync(USERS_FILE));
    } catch {}

    const exists = users.find(
        user => user.username.toLowerCase() === username.toLowerCase()
    );

    if (exists) {
        return res.json({
            success: false,
            message: "Ник уже занят"
        });
    }

    const newUser = {
        id: "frp_" + Date.now(),
        username,
        avatar,
        status: status || "",
        createdAt: new Date().toISOString()
    };

    users.push(newUser);

    fs.writeFileSync(
        USERS_FILE,
        JSON.stringify(users, null, 2)
    );

    res.json({
        success: true,
        user: newUser
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("FRAPPY SERVER STARTED");
});