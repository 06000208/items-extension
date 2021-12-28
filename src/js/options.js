/* eslint-disable no-unused-vars */

import { defaultSettings, settingDescriptions } from "./modules/constants.js";
// import simpleStorage from "./simpleStorage.js";

let app = null;
const options = {
    progress: 0,
    entries: [],
    pendingSettings: {},
    changed: [],
    buttons: false,
};


const falsyCache = {};

const updateButtons = function(toggle) {
    options.buttons = toggle;
    document.getElementById("apply").disabled = !toggle;
    document.getElementById("cancel").disabled = !toggle;
};

const handleKeyUpdate = function(key, value) {
    console.log("Updating", key, "to", value);
    options.pendingSettings[key] = value;
    if (value === app.settings[key]) {
        options.changed = options.changed.filter(element => element !== key);
        if (options.buttons && !options.changed.length) updateButtons(false);
    } else {
        options.changed.push(key);
        if (!options.buttons && options.changed.length) updateButtons(true);
    }
};

const handleFalsy = function(key, value) {
    if (!disableOnFalsy[key]) return;
    const keys = disableOnFalsy[key];
    if (value && falsyCache[key]) {
        console.log(`Enabling options associated with ${key}`);
        keys.forEach((targetKey) => {
            const element = document.getElementById(`option-${targetKey}`);
            if (element) element.disabled = false;
        });
        falsyCache[key] = false;
    } else if (!value && !falsyCache[key]) {
        console.log(`Disabling options associated with ${key}`);
        keys.forEach((targetKey) => {
            const element = document.getElementById(`option-${targetKey}`);
            if (element) element.disabled = true;
        });
        falsyCache[key] = true;
    }
};

const buttonChange = function(event) {
    const key = event.target.getAttribute("data-key");
    handleKeyUpdate(key, event.target.checked);
    handleFalsy(key, event.target.checked);
};

const stringInput = function(event) {
    const key = event.target.getAttribute("data-key");
    handleKeyUpdate(key, event.target.value);
    handleFalsy(key, event.target.value);
};

const numberInput = function(event) {
    const key = event.target.getAttribute("data-key");
    const value = Number(event.target.value);
    handleKeyUpdate(key, value);
    handleFalsy(key, value);
};

window.addEventListener("appReady", (event) => {
    app = event.detail;
    options.entries = Object.entries(app.settings);
    options.pendingSettings = { ...app.settings }; // { ... } is used here to create a new object/avoid changing the original
    options.progress = 0;
    options.increaseBy = Math.trunc(100 * (1 / options.entries.length));
    console.log("Increasing progress by", options.increaseBy, "% each time");
    const progressBar = document.getElementById("progress");
    const optionsContainer = document.getElementById("options");
    const boolTemplate = document.getElementById("boolTemplate");
    const textTemplate = document.getElementById("textTemplate");
    // optionsContainer.innerHTML = "";
    options.entries.forEach(function([key, value]) {
        console.log(`Adding options control for ${key}`);
        const boolean = typeof value === "boolean";
        const element = (boolean ? boolTemplate : textTemplate).content.cloneNode(true);
        element.querySelector(boolean ? "span" : "p").textContent = settingDescriptions[key] || key;
        const input = element.querySelector("input");
        input.id = `option-${key}`;
        input.setAttribute("data-key", key);
        if (boolean) {
            // Boolean
            if (value) input.checked = true;
            input.addEventListener("change", buttonChange);
        } else {
            // String & Number
            input.value = value;
            if (!isNaN(value)) {
                // Number
                input.addEventListener("input", numberInput);
            } else if (typeof value === "string") {
                // String
                input.addEventListener("input", stringInput);
            }
        }
        optionsContainer.appendChild(element);
        options.progress += options.increaseBy;
        progressBar.style.width = options.progress + "%";
    });
    options.entries.forEach(([key, value]) => handleFalsy(key, value));
    // app already has a settingsUpdate listener that handles setting it on app
    // this should handle it if the change is applicable to this options code and stuff
    app.addEventListener("settingsUpdate", function(nestedEvent) {
        alert("Applied settings");
    });
    document.getElementById("apply").addEventListener("click", async function(nestedEvent) {
        // This doesn't need to happen because the message sent to the background script will cause it to be set
        // app.settings = { ...options.pendingSettings };
        options.changed = [];
        updateButtons(false);
        await browser.runtime.sendMessage({
            "content": "backgroundSettingsUpdate",
            "detail": options.pendingSettings,
        });
        console.log("Sent message containing updated settings to background script");
    });
    document.getElementById("cancel").addEventListener("click", (nestedEvent) => {
        options.changed.forEach(key => {
            const input = document.getElementById(`option-${key}`);
            input[input.getAttribute("type") === "checkbox" ? "checked" : "value"] = app.settings[key];
        });
        options.changed = [];
        options.pendingSettings = { ...app.settings };
        updateButtons(false);
    });
    progressBar.style.width = "100%";
});
