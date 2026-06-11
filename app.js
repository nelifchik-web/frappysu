const SERVER = "https://frappy-server.onrender.com";

const createBtn = document.getElementById("createBtn");

checkLogin();

if (createBtn) {
    createBtn.addEventListener("click", createProfile);
}

function checkLogin() {

    const user = localStorage.getItem("frappy_user");

    if (!user) return;

    showHome(JSON.parse(user));
}

async function createProfile() {

    const username = document
        .getElementById("username")
        .value
        .trim();

    const status = document
        .getElementById("status")
        .value
        .trim();

    const message = document.getElementById("message");

    if (!username) {
        message.textContent = "Введи ник";
        return;
    }

    message.textContent = "Создаю профиль...";

    try {

        const response = await fetch(
            `${SERVER}/create-profile`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    status
                })
            }
        );

        const data = await response.json();

        if (!data.success) {
            message.textContent = data.message;
            return;
        }

        localStorage.setItem(
            "frappy_user",
            JSON.stringify(data.user)
        );

        showHome(data.user);

    } catch {

        message.textContent =
            "Ошибка подключения";

    }
}

function showHome(user) {

    document.body.innerHTML = `

    <div class="profile-setup">

        <div class="logo">
            FRAPPY
        </div>

        <div class="setup-card">

            <h2 style="text-align:center;">
                ${user.username}
            </h2>

            <p style="
                text-align:center;
                color:#8b6ba0;
                margin-top:10px;
                margin-bottom:20px;
            ">
                ${user.status || "Без статуса"}
            </p>

            <input
                id="musicSearch"
                class="input"
                placeholder="Поиск музыки..."
            >

            <button
                class="create-btn"
                onclick="searchMusic()"
            >
                🎵 Найти
            </button>

            <div
                id="musicResults"
                style="margin-top:15px;"
            ></div>

            <button
                class="create-btn"
                style="
                    margin-top:20px;
                    background:#2b1838;
                "
                onclick="logout()"
            >
                Выйти
            </button>

        </div>

    </div>

    `;
}

async function searchMusic() {

    const q = document
        .getElementById("musicSearch")
        .value
        .trim();

    if (!q) return;

    const results =
        document.getElementById("musicResults");

    results.innerHTML = "Ищу...";

    try {

        const response = await fetch(
            `${SERVER}/search?q=` +
            encodeURIComponent(q)
        );

        const tracks =
            await response.json();

        if (!tracks.length) {

            results.innerHTML =
                "Ничего не найдено";

            return;
        }

        results.innerHTML =
            tracks.map(track => `

            <div
                style="
                    background:rgba(255,255,255,.05);
                    border-radius:12px;
                    padding:12px;
                    margin-top:10px;
                "
            >

                <div style="
                    font-weight:700;
                    margin-bottom:5px;
                ">
                    ${track.title}
                </div>

                <div style="
                    color:#8b6ba0;
                    font-size:14px;
                    margin-bottom:10px;
                ">
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

function logout() {

    localStorage.removeItem(
        "frappy_user"
    );

    location.reload();
}