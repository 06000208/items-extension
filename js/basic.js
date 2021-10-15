import App from "./App.js";
window.addEventListener("appReady", (event) => {
    console.log("App ready on", window.location.origin, event.detail);
});
document.addEventListener("DOMContentLoaded", async function() {
    const app = new App();
    await app.initialize();
    window.dispatchEvent(new CustomEvent("appReady", {
        detail: app,
    }));
});
