const SERVER = "https://frappy-server.onrender.com";

let currentUser = null;
let currentPlaylist = [];
let currentTrackIndex = -1;
let audioPlayer = new Audio(); 

document.addEventListener("DOMContentLoaded", () => {
    checkLogin();
    
    // Когда трек доиграл до конца, автоматически включается следующий
    audioPlayer.addEventListener("ended", () => {
        nextTrack();
    });
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
    const firstLetter = currentUser && currentUser.username ? currentUser.username[0].toUpperCase() : "U";

    document.getElementById("root").innerHTML = `
        <div class="app">
            <div class="sidebar">
                <div class="server-logo">F</div>
                <div onclick="switchTab(0)" class="nav-btn active">♫</div>
                <div onclick="switchTab(1)" class="nav-btn">💬</div>
                <div onclick="switchTab(2)" class="nav-btn">▶</div>
                <div onclick="showProfile()" style="margin-top:auto;cursor:pointer;padding:12px;text-align:center;">
                    <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#b86cff,#7b2cff);margin:0 auto 6px;display:flex;align-items:center;justify-content:center;font-weight:700;">${firstLetter}</div>
                </div>
            </div>
            <div class="content" id="content"></div>
        </div>
        <div id="miniPlayer" style="display:none;"></div>
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
            <input type="text" id="musicSearch" class="search" placeholder="Введите трек (например: ACIDTEKK)">
            <button class="create-btn" id="searchBtn">Искать</button>
        </div>
        <div id="musicResults" style="margin-top:20px;"></div>
    `;

    document.getElementById("searchBtn").addEventListener("click", searchMusic);
    document.getElementById("musicSearch").addEventListener("keydown", (event) => {
        if (event.key === "Enter") searchMusic();
    });
}

async function searchMusic() {
    const query = document.getElementById("musicSearch").value.trim();
    if (!query) return;

    const container = document.getElementById("musicResults");
    container.innerHTML = `<p style="color:#b86cff">Глобальный поиск по базе...</p>`;

    try {
        const res = await fetch(`${SERVER}/search?q=` + encodeURIComponent(query));
        const tracks = await res.json();

        currentPlaylist = tracks;

        let html = "";
        tracks.forEach((track, index) => {
            html += `
                <div class="track" onclick="playTrackFromPlaylist(${index})">
                    <div class="track-info">
                        <div class="track-title">${track.title}</div>
                        <div class="track-artist">${track.artist}</div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html || "<p>Ничего не найдено по этому запросу :(</p>";
    } catch (e) {
        container.innerHTML = `<p style="color:#ff6666">Ошибка поиска</p>`;
    }
}

function playTrackFromPlaylist(index) {
    if (index < 0 || index >= currentPlaylist.length) return;
    
    currentTrackIndex = index;
    const track = currentPlaylist[index];
    
    playTrack(track.url, track.title, track.artist);
}

function playTrack(audioUrl, title, artist) {
    const mini = document.getElementById("miniPlayer");
    mini.style.display = "block";
    
    mini.innerHTML = `
        <div class="spotify-player-inner">
            <div class="spotify-track-info">
                <div class="spotify-title">${title}</div>
                <div class="spotify-artist">${artist}</div>
            </div>
            <div class="spotify-controls">
                <button onclick="prevTrack()" class="spotify-ctrl-btn">◀◀</button>
                <button onclick="togglePlay(this)" class="spotify-play-btn" id="globalPlayBtn">❚❚</button>
                <button onclick="nextTrack()" class="spotify-ctrl-btn">▶▶</button>
            </div>
        </div>
    `;

    audioPlayer.src = audioUrl;
    audioPlayer.play().catch(e => console.log("Ошибка автоплея: ", e));
}

function togglePlay(btn) {
    if (audioPlayer.paused) {
        audioPlayer.play();
        btn.textContent = "❚❚";
    } else {
        audioPlayer.pause();
        btn.textContent = "▶";
    }
}

function nextTrack() {
    if (currentPlaylist.length === 0) return;
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= currentPlaylist.length) nextIndex = 0; 
    playTrackFromPlaylist(nextIndex);
}

function prevTrack() {
    if (currentPlaylist.length === 0) return;
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = currentPlaylist.length - 1;
    playTrackFromPlaylist(prevIndex);
}

function showChats() {
    document.getElementById("content").innerHTML = `<div class="page-title">Чаты</div><div class="track">Раздел чатов готовится</div>`;
}

function showVideo() {
    document.getElementById("content").innerHTML = `<div class="page-title">Видео</div><div class="track">Раздел видео готовится</div>`;
}

function showProfile() {
    document.getElementById("content").innerHTML = `
        <div class="page-title">Профиль</div>
        <div class="track">
            <h3>${currentUser ? currentUser.username : "Пользователь"}</h3>
            <button class="create-btn" onclick="logout()">Выйти</button>
        </div>
    `;
}

function logout() {
    localStorage.removeItem("frappy_user");
    location.reload();
}
