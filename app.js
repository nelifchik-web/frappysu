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
        showProfileSetup();
    }
}

function showProfileSetup() {
    document.getElementById("root").innerHTML = `
        <div class="profile-setup">
            <div class="setup-card">
                <div class="logo">FRAPPY</div>
                <h2>Создай профиль</h2>
                <input type="text" id="username" class="input" placeholder="Уникальный ник">
                <input type="text" id="status" class="input" placeholder="Статус (необязательно)">
                <button id="createBtn" class="create-btn">Создать профиль</button>
                <div id="message" style="margin-top:15px;color:#ff6666;"></div>
            </div>
        </div>
    `;
    document.getElementById("createBtn").addEventListener("click", createProfile);
}

async function createProfile() {
    const username = document.getElementById("username").value.trim();
    const status = document.getElementById("status").value.trim();
    const msg = document.getElementById("message");

    if (!username) return msg.textContent = "Ник обязателен!";

    msg.textContent = "Создаём...";

    try {
        const res = await fetch(`${SERVER}/create-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, status })
        });
        const data = await res.json();
        if (!data.success) return msg.textContent = data.message || "Ошибка";

        localStorage.setItem("frappy_user", JSON.stringify(data.user));
        currentUser = data.user;
        openApp();
    } catch (e) {
        msg.textContent = "Ошибка сервера";
    }
}

function openApp() {
    document.getElementById("root").innerHTML = `
        <div class="app">
            <div class="sidebar">
                <div class="server-logo">F</div>
                <div onclick="switchTab(0)" class="nav-btn active">♫</div>
                <div onclick="switchTab(1)" class="nav-btn">💬</div>
                <div onclick="switchTab(2)" class="nav-btn">▶</div>
                <div onclick="showProfile()" style="margin-top:auto;cursor:pointer;padding:12px;text-align:center;">
                    <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#b86cff,#7b2cff);margin:0 auto 6px;display:flex;align-items:center;justify-content:center;font-weight:700;">${currentUser.username[0].toUpperCase()}</div>
                </div>
            </div>
            <div class="content" id="content"></div>
        </div>
    `;
    showMusic();
}

function switchTab(tab) {
    document.querySelectorAll('.nav-btn').forEach((b, i) => b.classList.toggle('active', i === tab));
    if (tab === 0) showMusic();
    if (tab === 1) showChats();
    if (tab === 2) showVideo();
}

function showMusic() {
    document.getElementById("content").innerHTML = `
        <div class="page-title">Музыка</div>
        <div class="search-container">
            <input type="text" id="musicSearch" class="search" placeholder="Найти трек...">
            <button class="create-btn" onclick="searchMusic()">Искать</button>
        </div>
        <div id="musicResults"></div>
        <div id="playerContainer" style="margin-top:30px;display:none;"></div>
    `;
}

async function searchMusic() {
    const query = document.getElementById("musicSearch").value.trim();
    if (!query) return;

    const container = document.getElementById("musicResults");
    container.innerHTML = `<p style="color:#b86cff">Поиск...</p>`;

    try {
        const res = await fetch(`${SERVER}/search?q=` + encodeURIComponent(query));
        const tracks = await res.json();

        let html = "";
        tracks.forEach(track => {
            html += `
                <div class="track" onclick="playTrack('\( {track.id}', ' \){track.title.replace(/'/g, "\\'")}', '${track.artist.replace(/'/g, "\\'")}')">
                    <div class="track-info">
                        <div class="track-title">${track.title}</div>
                        <div class="track-artist">${track.artist}</div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html || "<p>Ничего не найдено</p>";
    } catch (e) {
        container.innerHTML = `<p style="color:#ff6666">Ошибка, но вот демо:</p>`;
    }
}

function playTrack(videoId, title, artist) {
    const container = document.getElementById("playerContainer");
    container.style.display = "block";
    container.innerHTML = `
        <h3 style="margin-bottom:12px;color:#b86cff">Сейчас играет</h3>
        <div style="position:relative;padding-top:56.25%;background:#000;border-radius:16px;overflow:hidden;">
            <iframe width="100%" height="100%" style="position:absolute;top:0;left:0;" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                frameborder="0" allowfullscreen></iframe>
        </div>
        <div style="margin-top:12px;font-weight:700;">${title}</div>
        <div style="color:#999;">${artist}</div>
    `;
    container.scrollIntoView({ behavior: "smooth" });
}

function showChats() {
    document.getElementById("content").innerHTML = `<div class="page-title">Чаты</div><div class="track">Скоро...</div>`;
}

function showVideo() {
    document.getElementById("content").innerHTML = `<div class="page-title">Видео</div><div class="track">Скоро...</div>`;
}

function showProfile() {
    document.getElementById("content").innerHTML = `
        <div class="page-title">Профиль</div>
        <div class="track">
            <h3>${currentUser.username}</h3>
            <button class="create-btn" onclick="logout()">Выйти</button>
        </div>
    `;
}

function logout() {
    localStorage.removeItem("frappy_user");
    location.reload();
}