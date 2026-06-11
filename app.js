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

            <div
                class="nav-btn active"
                onclick="showMusic()"
            >
                🎵
            </div>

            <div
                class="nav-btn"
                onclick="showVideo()"
            >
                🎬
            </div>

            <div
                class="nav-btn"
                onclick="showChats()"
            >
                💬
            </div>

            <div
                class="nav-btn"
                onclick="showProfile()"
            >
                👤
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

        <h2>🎵 Музыка</h2>

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
                    ▶ Смотреть
                </button>

            </div>

            `).join("");

    } catch {

        results.innerHTML =
            "Ошибка поиска";

    }
}

function openTrack(id) {

    document.getElementById(
        "content"
    ).innerHTML = `

        <h2>🎵 Плеер</h2>

        <iframe
            width="100%"
            height="260"
            src="https://www.youtube.com/embed/${id}?autoplay=1"
            allowfullscreen
        ></iframe>

        <button
            class="create-btn"
            style="margin-top:15px;"
            onclick="showMusic()"
        >
            Назад
        </button>

    `;
}

function showVideo() {

    document.getElementById(
        "content"
    ).innerHTML = `

        <h2>🎬 Видео</h2>

        <p>
            Раздел в разработке
        </p>

    `;
}

function showChats() {

    document.getElementById(
        "content"
    ).innerHTML = `

        <h2>💬 Чаты</h2>

        <p>
            Скоро будут
        </p>

    `;
}

function showProfile() {

    const user = JSON.parse(
        localStorage.getItem(
            "frappy_user"
        )
    );

    document.getElementById(
        "content"
    ).innerHTML = `

        <h2>
            ${user.username}
        </h2>

        <p>
            ${user.status || "Без статуса"}
        </p>

        <button
            class="create-btn"
            style="margin-top:20px;"
            onclick="logout()"
        >
            Выйти
        </button>

    `;
}

function logout() {

    localStorage.removeItem(
        "frappy_user"
    );

    location.reload();
}