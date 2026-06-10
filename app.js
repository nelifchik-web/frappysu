console.log("FRAPPY STARTED");

const tabs = document.querySelectorAll(".server-icon");

tabs.forEach(tab => {
    tab.addEventListener("click", () => {

        tabs.forEach(btn => {
            btn.classList.remove("active");
        });

        tab.classList.add("active");

    });
});