/* eslint-disable no-unused-vars */
/* global simpleStorage */

const descriptions = {
  "darkTheme": "Enable dark theme",
  "browserActionPopup": "Use the toolbar button's left click for the Quick Menu popup instead of opening Item Engine",
  "focusEngine": "Automatically switch to Item Engine when opening it from the toolbar button",
  "itemEngineTag": "Distinguish bookmarks created/modified through item engine with a tag",
  "itemEngineTagName": "Tag for distinguishing bookmarks created/modified through item engine",
  "itemTagLinking": "Enable tags linking items of the same name",
  "itemEngineLimitFolder": "Limit item engine to a specific folder",
  "itemEngineDefaultFolder": "Default folder for new items",
};

const disableOnFalsy = {
  "itemEngineTag": ["itemEngineTagName"],
};

const falsyCache = {};

const options = {
  progress: 0,
  increaseBy: 0,
  buttons: false,
  entries: [],
  settings: {},
  pendingSettings: {},
  defaultSettings: {},
  changed: [],
};

const updateButtons = function(toggle) {
  options.buttons = toggle;
  document.getElementById("apply").disabled = !toggle;
  document.getElementById("cancel").disabled = !toggle;
};

const handleKeyUpdate = function(key, value) {
  console.log("Updating", key, "to", value);
  options.pendingSettings[key] = value;
  if (value === options.settings[key]) {
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

const generateOptions = function() {
  const progressBar = document.getElementById("progress");
  const optionsContainer = document.getElementById("options");
  const boolTemplate = document.getElementById("boolTemplate");
  const textTemplate = document.getElementById("textTemplate");
  // optionsContainer.innerHTML = "";
  options.entries.forEach(function([key, value]) {
    console.log(`Adding options control for ${key}`);
    const boolean = typeof value === "boolean";
    const element = (boolean ? boolTemplate : textTemplate).content.cloneNode(true);
    element.querySelector(boolean ? "span" : "p").textContent = descriptions[key] || key;
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
  document.getElementById("apply").addEventListener("click", async function(event) {
    options.settings = { ...options.pendingSettings };
    options.changed = [];
    updateButtons(false);
    await simpleStorage.set("settings", options.settings);
    await browser.runtime.sendMessage({ "event": "backgroundSettingsUpdate" });
    alert("Applied settings");
  });
  document.getElementById("cancel").addEventListener("click", (event) => {
    options.changed.forEach(key => {
      // options.changed = options.changed.filter(element => element !== key);
      // options.pendingSettings[key] = options.settings[key];
      const input = document.getElementById(`option-${key}`);
      input[input.getAttribute("type") === "checkbox" ? "checked" : "value"] = options.settings[key];
    });
    options.pendingSettings = { ...options.settings };
    options.changed = [];
    updateButtons(false);
  });
  progressBar.style.width = "100%";
};

window.addEventListener("appReady", (event) => {
  // Setup data
  // { ... } is used to create new objects and avoid changing the same reference
  options.entries = Object.entries(event.detail.settings);
  options.settings = { ...event.detail.settings } ;
  options.pendingSettings = { ...event.detail.settings };
  options.defaultSettings = { ...event.detail.defaultSettings };
  options.progress = 0;
  options.increaseBy = Math.trunc(100 * (1 / options.entries.length));
  console.log("Increasing progress by", options.increaseBy, "% each time");
  // Add option controls to the page
  generateOptions();
});
