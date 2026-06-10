const SERVER = "https://frappy-server.onrender.com";

const createBtn = document.getElementById("createBtn");

createBtn.addEventListener("click", createProfile);

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

        message.textContent =
            "Профиль создан 🔥";

    } catch (err) {

        message.textContent =
            "Ошибка подключения к серверу";

    }

}