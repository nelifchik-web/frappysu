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
                <div id="message" style="margin-top:15px; color:#ff6666;"></div>
            </div>
        </div>
    `;

    document.getElementById("createBtn").addEventListener("click", createProfile);
}

async function createProfile() {
    const username = document.getElementById("username").value.trim();
    const status = document.getElementById("status").value.trim();
    const msg = document.getElementById("message");

    if (!username) {
        msg.textContent = "Ник обязателен!";
        return;
    }

    msg.textContent = "Создаём...";

    try {
        const res = await fetch(`${SERVER}/create-profile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, status })
        });
        const data = await res.json();

        if (!data.success) {
            msg.textContent = data.message || "Ошибка";
            return;
        }

        localStorage.setItem("frappy_user", JSON.stringify(data.user));
        currentUser = data.user;
        openApp();
    } catch (e) {
        msg.textContent = "Ошибка подключения к серверу";
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

                <div onclick="showProfile()" style="margin-top: auto; cursor: pointer; padding: 12px; text-align: center;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #b86cff, #7b2cff); margin: 0 auto 6px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px;">
                        ${currentUser.username[0].toUpperCase()}
                    </div>
                    <div style="font-size: 13px;">${currentUser.username}</div>
                </div>
            </div>

            <div class="content" id="content"></div>
        </div>
    `;

    showMusic();
}

function switchTab(tab) {
    document.querySelectorAll('.nav-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === tab);
    });
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
        
        <div id="musicResults" style="margin-top: 20px;"></div>
        <div id="playerContainer" style="margin-top: 30px; display: none;"></div>
    `;
}

async function searchMusic() {
    const query = document.getElementById("musicSearch").value.trim();
    if (!query) return;

    const container = document.getElementById("musicResults");
    container.innerHTML = `<p style="color:#b86cff; padding: 20px;">Ищем треки...</p>`;

    try {
        const res = await fetch(`${SERVER}/search?q=` + encodeURIComponent(query));
        const tracks = await res.json();

        if (!tracks || tracks.length === 0) {
            container.innerHTML = `<p>Ничего не найдено</p>`;
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
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<p style="color:#ff6666">Ошибка поиска. Попробуй позже.</p>`;
    }
}

function playTrack(videoId, title, artist) {
    const container = document.getElementById("playerContainer");
    container.style.display = "block";
    container.innerHTML = `
        <h3 style="margin-bottom: 12px; color: #b86cff;">Сейчас играет</h3>
        <div style="position: relative; padding-top: 56.25%; background: #000; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(184, 108, 255, 0.3);">
            <iframe 
                width="100%" 
                height="100%" 
                style="position: absolute; top: 0; left: 0;"
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
            </iframe>
        </div>
        <div style="margin-top: 12px; font-weight: 700; font-size: 17px;">${title}</div>
        <div style="color: #999;">${artist}</div>
    `;
    container.scrollIntoView({ behavior: "smooth" });
}

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
            <button class="create-btn" onclick="logout()" style="margin-top:20px;">Выйти</button>
        </div>
    `;
}

function logout() {
    localStorage.removeItem("frappy_user");
    location.reload();
}