window.addEventListener("appReady", (event) => {
  if (event.detail.settings.darkTheme !== undefined) {
    console.log(`Manually applying ${event.detail.settings.darkTheme ? "dark" : "light"} theme css`);
    document.getElementById("theme").href = event.detail.settings.darkTheme ? "css/dark.css" : "css/light.css";
  }
});
