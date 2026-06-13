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
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
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

function openApp(user){

document.body.innerHTML = `

<div class="app">

    <div class="sidebar">

        <div class="server-logo">
            ⚡
        </div>

        <div class="nav-group">

            <div
                class="nav-indicator"
                id="navIndicator"
            ></div>

            <div
                class="nav-btn active"
                onclick="showMusic(this,0)"
            >
                ♪
            </div>

            <div
                class="nav-btn"
                onclick="showChats(this,1)"
            >
                💬
            </div>

            <div
                class="nav-btn"
                onclick="showVideo(this,2)"
            >
                ▶
            </div>

        </div>

        <div
            class="profile-box"
            onclick="showProfile()"
        >

            <div class="avatar">
                ${user.username
                    .charAt(0)
                    .toUpperCase()}
            </div>

            <div class="profile-name">
                ${user.username}
            </div>

            <div class="profile-status">
                ● Online
            </div>

        </div>

    </div>

    <div
        class="content"
        id="content"
    ></div>

</div>

`;

showMusic(
    document.querySelector(".nav-btn"),
    0
);

}

function moveIndicator(index){

const indicator =
    document.getElementById(
        "navIndicator"
    );

if(!indicator) return;

indicator.style.transform =
    `translateY(${index * 56}px)`;

}

function setActive(btn,index){

document
    .querySelectorAll(".nav-btn")
    .forEach(el =>
        el.classList.remove("active")
    );

if(btn){

    btn.classList.add("active");

    moveIndicator(index);
}

}

function showMusic(btn,index){

setActive(btn,index);

document.getElementById(
    "content"
).innerHTML = `

    <div class="page-title">
        Музыка
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

async function searchMusic(){

const q =
    document.getElementById(
        "musicSearch"
    ).value.trim();

if(!q) return;

const results =
    document.getElementById(
        "musicResults"
    );

results.innerHTML =
    "Поиск...";

try{

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
                Открыть
            </button>

        </div>

        `).join("");

}catch{

    results.innerHTML =
        "Ошибка поиска";
}

}

function openTrack(id){

window.open(
    "https://www.youtube.com/watch?v=" + id,
    "_blank"
);

}

function showChats(btn,index){

setActive(btn,index);

document.getElementById(
    "content"
).innerHTML = `

    <div class="page-title">
        Чаты
    </div>

    <div class="track">
        Личные сообщения скоро появятся
    </div>

    <div class="track">
        Групповые чаты в разработке
    </div>

`;

}

function showVideo(btn,index){

setActive(btn,index);

document.getElementById(
    "content"
).innerHTML = `

    <div class="page-title">
        Видео
    </div>

    <div class="track">
        Видео-раздел находится в разработке
    </div>

`;

}

function showProfile(){

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
        Профиль
    </div>

    <div class="track">

        <div style="
            font-size:28px;
            font-weight:800;
            margin-bottom:10px;
        ">
            ${user.username}
        </div>

        <div style="
            color:#999;
            margin-bottom:20px;
        ">
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

function logout(){

localStorage.removeItem(
    "frappy_user"
);

location.reload();

}