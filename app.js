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
        <div id="miniPlayer" style="display:none;position:fixed;bottom:0;left:0;right:0;background:rgba(10,10,10,0.98);border-top:2px solid #b86cff;padding:12px 16px;z-index:1000;"></div>
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
            <input type="text" id="musicSearch" class="search" placeholder="Найти трек или артиста...">
            <button class="create-btn" onclick="searchMusic()">Искать</button>
        </div>
        <div id="musicResults" style="margin-top:20px;"></div>
    `;
}

async function searchMusic() {
    const query = document.getElementById("musicSearch").value.trim();
    if (!query) return;

    const container = document.getElementById("musicResults");
    container.innerHTML = `<p style="color:#b86cff">Поиск треков...</p>`;

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
        container.innerHTML = html || "<p>Ничего не найдено :(</p>";
    } catch (e) {
        container.innerHTML = `<p style="color:#ff6666">Ошибка поиска</p>`;
    }
}

function playTrack(videoId, title, artist) {
    const mini = document.getElementById("miniPlayer");
    mini.style.display = "block";
    mini.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;">
            <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${title}</div>
                <div style="color:#aaa;font-size:14px;">${artist}</div>
            </div>
            <button onclick="togglePlay(this)" style="background:#b86cff;color:white;border:none;width:56px;height:56px;border-radius:50%;font-size:24px;flex-shrink:0;">▶</button>
        </div>
        <iframe id="ytPlayer" width="100%" height="0" style="margin-top:12px;border-radius:12px;display:none;" 
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1" 
            frameborder="0" allowfullscreen></iframe>
    `;
}

function togglePlay(btn) {
    const iframe = document.getElementById("ytPlayer");
    if (iframe.style.display === "none") {
        iframe.style.display = "block";
        iframe.height = "220";
        btn.textContent = "❚❚";
    } else {
        iframe.style.display = "none";
        iframe.height = "0";
        btn.textContent = "▶";
    }
}

function showChats() {
    document.getElementById("content").innerHTML = `<div class="page-title">Чаты</div><div class="track">Скоро будет</div>`;
}

function showVideo() {
    document.getElementById("content").innerHTML = `<div class="page-title">Видео</div><div class="track">Скоро будет</div>`;
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