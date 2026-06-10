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
                Привет, ${user.username} 👋
            </h2>

            <p style="
                text-align:center;
                color:#8b6ba0;
                margin-top:10px;
                margin-bottom:25px;
            ">
                ${user.status || "Без статуса"}
            </p>

            <button
                class="create-btn"
                onclick="alert('Музыка скоро будет 🔥')"
            >
                🎵 Музыка
            </button>

            <button
                class="create-btn"
                style="margin-top:10px;"
                onclick="alert('Видео скоро будет 🔥')"
            >
                🎬 Видео
            </button>

            <button
                class="create-btn"
                style="margin-top:10px;"
                onclick="alert('Чаты скоро будут 🔥')"
            >
                💬 Чаты
            </button>

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

function logout() {

    localStorage.removeItem(
        "frappy_user"
    );

    location.reload();
}