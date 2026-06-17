const SERVER = "https://frappy-server.onrender.com";

let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
    checkLogin();
});

function checkLogin() {
    const saved = localStorage.getItem("frappy_user");
    if (saved) {
        currentUser = JSON.parse(saved);
        openApp();
    } else {
        showSetup();
    }
}

function showSetup() {
    document.getElementById("root").innerHTML = `
        <div class="profile-setup">
            <div class="setup-card">
                <div class="logo">FRAPPY</div>
                <h2>Создай профиль</h2>
                <input type="text" id="username" class="input" placeholder="Уникальный ник">
                <input type="text" id="status" class="input" placeholder="Статус">
                <button id="createBtn" class="create-btn">Создать</button>
                <div id="msg"></div>
            </div>
        </div>
    `;
    document.getElementById("createBtn").onclick = createProfile;
}

async function createProfile() {
    const username = document.getElementById("username").value.trim();
    if (!username) return;

    try {
        const res = await fetch(`${SERVER}/create-profile`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username})
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem("frappy_user", JSON.stringify(data.user));
            currentUser = data.user;
            openApp();
        }
    } catch(e) {}
}

function openApp() {
    document.getElementById("root").innerHTML = `
        <div class="app">
            <div class="sidebar">
                <div class="server-logo">F</div>
                <div onclick="showMusic()" class="nav-btn active">♫</div>
                <div onclick="showChats()" class="nav-btn">💬</div>
                <div onclick="showVideo()" class="nav-btn">▶</div>
            </div>
            <div class="content" id="content"></div>
        </div>
    `;
    showMusic();
}

function showMusic() {
    document.getElementById("content").innerHTML = `
        <div class="page-title">Музыка</div>
        <input type="text" id="q" class="search" placeholder="Что послушать?">
        <button class="create-btn" onclick="search()">Искать</button>
        <div id="results" style="margin-top:20px;"></div>
    `;
}

async function search() {
    const q = document.getElementById("q").value.trim();
    if (!q) return;
    const results = document.getElementById("results");
    results.innerHTML = "Поиск...";

    try {
        const res = await fetch(`${SERVER}/search?q=` + encodeURIComponent(q));
        const tracks = await res.json();

        let html = "";
        tracks.forEach(t => {
            html += `<div class="track" onclick="play('\( {t.id}',' \){t.title}','${t.artist}')">
                <div class="track-title">${t.title}</div>
                <div class="track-artist">${t.artist}</div>
            </div>`;
        });
        results.innerHTML = html;
    } catch(e) {
        results.innerHTML = "Ошибка";
    }
}

function play(id, title, artist) {
    document.getElementById("results").innerHTML += `
        <div style="margin:20px 0;padding:15px;background:#111;border-radius:16px;">
            <h3>${title}</h3>
            <p>${artist}</p>
            <iframe width="100%" height="300" src="https://www.youtube.com/embed/${id}?autoplay=1" frameborder="0" allowfullscreen></iframe>
        </div>
    `;
}

function showChats() {
    document.getElementById("content").innerHTML = `<div class="page-title">Чаты</div><div class="track">Скоро</div>`;
}

function showVideo() {
    document.getElementById("content").innerHTML = `<div class="page-title">Видео</div><div class="track">Скоро</div>`;
}

function showProfile() {
    // later
}