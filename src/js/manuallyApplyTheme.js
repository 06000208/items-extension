const manuallyApplyTheme = function(event) {
    if (!event || !event.detail) return;
    if (event.detail.darkTheme === undefined) return; // Supposed to be a boolean
    console.log(`Manually applying ${event.detail.darkTheme ? "dark" : "light"} theme css`);
    document.getElementById("theme").href = event.detail.darkTheme ? "css/dark.css" : "css/light.css";
};

window.addEventListener("appReady", (event) => {
    const app = event.detail;
    manuallyApplyTheme({ detail: app.settings });
    app.addEventListener("settingsUpdate", manuallyApplyTheme);
});
