const SERVER = "https://frappy-server.onrender.com";

const createBtn = document.getElementById("createBtn");

checkLogin();

if (createBtn) {
    createBtn.addEventListener("click", createProfile);
}

function checkLogin() {

    const user = localStorage.getItem("frappy_user");

    if (!user) return;

    openApp(JSON.parse(user));
}

async function createProfile() {

    const username =
        document.getElementById("username")
        .value
        .trim();

    const status =
        document.getElementById("status")
        .value
        .trim();

    const message =
        document.getElementById("message");

    if (!username) {

        message.textContent =
            "Введи ник";

        return;
    }

    try {

        message.textContent =
            "Создаю профиль...";

        const response =
            await fetch(
                `${SERVER}/create-profile`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        status
                    })
                }
            );

        const data =
            await response.json();

        if (!data.success) {

            message.textContent =
                data.message;

            return;
        }

        localStorage.setItem(
            "frappy_user",
            JSON.stringify(data.user)
        );

        openApp(data.user);

    } catch {

        message.textContent =
            "Ошибка подключения";

    }
}

function openApp(user) {

    document.body.innerHTML = `

    <div class="app">

        <div class="sidebar">

            <div class="server-logo">
                F
            </div>

            <div class="nav-btn" onclick="showMusic()">
                🎵
            </div>

            <div class="nav-btn" onclick="showVideo()">
                🎬
            </div>

            <div class="nav-btn" onclick="showChats()">
                💬
            </div>

            <div class="nav-btn" onclick="showProfile()">
                👤
            </div>

        </div>

        <div class="channels">

            <div class="channels-header">
                FRAPPY
            </div>

            <div
                class="channel"
                onclick="showMusic()"
            >
                🎵 Музыка
            </div>

            <div
                class="channel"
                onclick="showVideo()"
            >
                🎬 Видео
            </div>

            <div
                class="channel"
                onclick="showChats()"
            >
                💬 Чаты
            </div>

            <div
                class="channel"
                onclick="showProfile()"
            >
                👤 Профиль
            </div>

            <div class="profile-panel">

                <div class="avatar">
                    ${user.username
                        .charAt(0)
                        .toUpperCase()}
                </div>

                <div>

                    <div class="user-name">
                        ${user.username}
                    </div>

                    <div class="user-status">
                        ${user.status || "Online"}
                    </div>

                </div>

            </div>

        </div>

        <div
            class="content"
            id="content"
        ></div>

    </div>

    `;

    showMusic();
}

function showMusic() {

    document.getElementById(
        "content"
    ).innerHTML = `

        <div class="page-title">
            🎵 Музыка
        </div>

        <input
            id="musicSearch"
            class="input"
            placeholder="Найти трек..."
        >

        <button
            class="create-btn"
            onclick="searchMusic()"
        >
            Искать
        </button>

        <div id="musicResults"></div>

    `;
}

async function searchMusic() {

    const q =
        document.getElementById(
            "musicSearch"
        ).value.trim();

    if (!q) return;

    const results =
        document.getElementById(
            "musicResults"
        );

    results.innerHTML =
        "Поиск...";

    try {

        const response =
            await fetch(
                `${SERVER}/search?q=` +
                encodeURIComponent(q)
            );

        const tracks =
            await response.json();

        results.innerHTML =
            tracks.map(track => `

                <div class="track">

                    <div class="track-title">
                        ${track.title}
                    </div>

                    <div class="track-artist">
                        ${track.artist}
                    </div>

                    <button
                        class="create-btn"
                        onclick="openTrack('${track.id}')"
                    >
                        ▶ Открыть
                    </button>

                </div>

            `).join("");

    } catch {

        results.innerHTML =
            "Ошибка поиска";

    }
}

function openTrack(id) {

    window.open(
        `https://www.youtube.com/watch?v=${id}`,
        "_blank"
    );

}

function showVideo() {

    document.getElementById(
        "content"
    ).innerHTML = `

        <div class="page-title">
            🎬 Видео
        </div>

        <div class="track">
            Раздел находится в разработке
        </div>

    `;
}

function showChats() {

    document.getElementById(
        "content"
    ).innerHTML = `

        <div class="page-title">
            💬 Чаты
        </div>

        <div class="track">
            Скоро появятся личные сообщения
        </div>

    `;
}

function showProfile() {

    const user =
        JSON.parse(
            localStorage.getItem(
                "frappy_user"
            )
        );

    document.getElementById(
        "content"
    ).innerHTML = `

        <div class="page-title">
            👤 Профиль
        </div>

        <div class="track">

            <div
                style="
                    font-size:24px;
                    font-weight:700;
                    margin-bottom:10px;
                "
            >
                ${user.username}
            </div>

            <div
                style="
                    color:#b5bac1;
                    margin-bottom:20px;
                "
            >
                ${user.status || "Без статуса"}
            </div>

            <button
                class="create-btn"
                onclick="logout()"
            >
                Выйти
            </button>

        </div>

    `;
}

function logout() {

    localStorage.removeItem(
        "frappy_user"
    );

    location.reload();
}