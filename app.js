const SERVER = "https://frappy-server.onrender.com";

let currentUser = null;

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
    checkLogin();
});

function checkLogin() {
    const userData = localStorage.getItem("frappy_user");
    if (userData) {
        currentUser = JSON.parse(userData);
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
                <div id="message"></div>
            </div>
        </div>
    `;

    document.getElementById("createBtn").addEventListener("click", createProfile);
}

async function createProfile() {
    const username = document.getElementById("username").value.trim();
    const status = document.getElementById("status").value.trim();
    const messageEl = document.getElementById("message");

    if (!username) {
        messageEl.textContent = "Введи ник!";
        return;
    }

    messageEl.textContent = "Создаём...";

    try {
        const res = await fetch(`${SERVER}/create-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, status })
        });

        const data = await res.json();

        if (!data.success) {
            messageEl.textContent = data.message || "Ошибка";
            return;
        }

        localStorage.setItem("frappy_user", JSON.stringify(data.user));
        currentUser = data.user;
        openApp();
    } catch (e) {
        messageEl.textContent = "Ошибка сервера";
    }
}

function openApp() {
    document.getElementById("root").innerHTML = `
        <div class="app">
            <div class="sidebar">
                <div class="server-logo">F</div>
                
                <div class="nav-group">
                    <div class="nav-btn active" onclick="switchTab(0)">♫</div>
                    <div class="nav-btn" onclick="switchTab(1)">💬</div>
                    <div class="nav-btn" onclick="switchTab(2)">▶</div>
                </div>

                <div class="profile-box" onclick="showProfile()">
                    <div class="avatar">${currentUser.username[0].toUpperCase()}</div>
                    <div class="profile-name">${currentUser.username}</div>
                </div>
            </div>

            <div class="content" id="content"></div>
        </div>
    `;

    showMusic();
}

// Переключение вкладок
function switchTab(tab) {
    if (tab === 0) showMusic();
    else if (tab === 1) showChats();
    else if (tab === 2) showVideo();
}

function showMusic() {
    document.getElementById("content").innerHTML = `
        <div class="page-title">Музыка</div>
        
        <div class="search-container">
            <input type="text" id="musicSearch" class="search" placeholder="Найти трек...">
            <button class="create-btn" onclick="searchMusic()">Искать</button>
        </div>
        
        <div id="musicResults"></div>
        <div id="playerContainer" style="margin-top: 30px; display: none;"></div>
    `;
}

async function searchMusic() {
    const query = document.getElementById("musicSearch").value.trim();
    if (!query) return;

    const resultsContainer = document.getElementById("musicResults");
    resultsContainer.innerHTML = "<p>Ищем...</p>";

    try {
        const res = await fetch(`\( {SERVER}/search?q= \){encodeURIComponent(query)}`);
        const tracks = await res.json();

        if (tracks.length === 0) {
            resultsContainer.innerHTML = "<p>Ничего не найдено</p>";
            return;
        }

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

        resultsContainer.innerHTML = html;
    } catch (e) {
        resultsContainer.innerHTML = "<p>Ошибка поиска</p>";
    }
}

function playTrack(videoId, title, artist) {
    const playerContainer = document.getElementById("playerContainer");
    
    playerContainer.style.display = "block";
    playerContainer.innerHTML = `
        <h3 style="margin-bottom: 12px;">Сейчас играет</h3>
        <div style="position: relative; padding-top: 56.25%; background: #000; border-radius: 16px; overflow: hidden;">
            <iframe 
                width="100%" 
                height="100%" 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        </div>
        <div style="margin-top: 12px; font-weight: 700;">${title}</div>
        <div style="color: #999;">${artist}</div>
    `;

    // Скролл к плееру
    playerContainer.scrollIntoView({ behavior: "smooth" });
}

// Заглушки для других разделов
function showChats() {
    document.getElementById("content").innerHTML = `
        <div class="page-title">Чаты</div>
        <div class="track">Личные сообщения и групповые чаты — скоро</div>
    `;
}

function showVideo() {
    document.getElementById("content").innerHTML = `
        <div class="page-title">Видео</div>
        <div class="track">Видеокомнаты и лента — в разработке</div>
    `;
}

function showProfile() {
    document.getElementById("content").innerHTML = `
        <div class="page-title">Профиль</div>
        <div class="track">
            <h3>${currentUser.username}</h3>
            <p>${currentUser.status || "Без статуса"}</p>
            <button class="create-btn" onclick="logout()" style="margin-top: 20px;">Выйти</button>
        </div>
    `;
}

function logout() {
    localStorage.removeItem("frappy_user");
    location.reload();
}