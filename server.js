const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const USERS_FILE = "./users.json";

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("FRAPPY SERVER STARTED");
});