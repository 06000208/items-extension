/**
 * v2, Async helper functions that wrap browser.storage.local for simpler usage similar to [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)'s methods
 * @type {object}
 */
const simpleStorage = {
  set: async function(key, value) {
    return await browser.storage.local.set({ [key]: value });
  },
  get: async function(key) {
    return (await browser.storage.local.get(key))[key];
  },
  delete: async function(key) {
    return await browser.storage.local.remove(key);
  },
};

const initialize = async function() {
  // Settings
  const settings = await simpleStorage.get("settings") || {};
  console.log("Loaded settings inside shared.js", settings);
  // Ready for page specific js
  window.dispatchEvent(new CustomEvent("appReady", { detail: { settings: settings } }));
};

// initialize();
document.addEventListener("DOMContentLoaded", initialize);
