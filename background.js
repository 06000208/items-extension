/* eslint-disable no-unused-vars */

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/contentScripts
// https://discourse.mozilla.org/t/modify-a-web-page-before-displaying-it-webextensions/16002/4
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Options_pages
// browser.runtime.openOptionsPage();

// v1
// const simpleStorage = {
//   set: async (key, value) => await browser.storage.local.set({ [key]: value }),
//   get: async (key) => (await browser.storage.local.get(key))[key],
//   delete: async (key) => await browser.storage.local.remove(key),
//   // has: async (key) => Boolean(await simpleStorage.get(key)),
// };

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

const memoryStorage = new Map();

const defaultSettings = {
  darkTheme: false,
  browserActionPopup: false,
  focusEngine: true,
  itemEngineTag: false,
  itemEngineTagName: "item",
  itemEngineLimitFolder: "",
  itemEngineDefaultFolder: "Other Bookmarks",
};
let settings = {};

const openEngineDialog = function(detached = false) {
  if (detached) {
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/create
    browser.windows.create({
      type: "detached_panel",
      url: settings.darkTheme ? "indexDetached-dark.html" : "indexDetached-light.html",
      width: 700,
      height: 500,
    });
    // document.getElementById("close").addEventListener("click", function() {
    //   browser.windows.remove(browser.windows.WINDOW_ID_CURRENT);
    // });
  } else {
    browser.tabs.create({
      active: settings.focusEngine,
      url: settings.darkTheme ? "/index-dark.html" : "/index-light.html",
    });
  }
};

const browserActionListener = function(tabs, onClickData) {
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browserAction/onClicked
  if (!settings.browserActionPopup || onClickData.button === 1) {
    openEngineDialog();
  } else {
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browserAction/setPopup
    browser.browserAction.setPopup({ "popup": settings.darkTheme ? "quickMenu-dark.html" : "quickMenu-light.html" });
    browser.browserAction.openPopup().then(() => browser.browserAction.setPopup({ "popup": "" }));
  }
};

const updatePageAction = function(tabId) {
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/pageAction/setPopup
  browser.pageAction.setPopup({
    tabId,
    popup: settings.darkTheme ? "add-dark.html" : "add-light.html",
  });
};

const tabsOnUpdatedListener = function(tabId, changeInfo, tabInfo) {
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/pageAction/setPopup#examples
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated
  if (changeInfo.status && changeInfo.status === "loading") updatePageAction(tabId);
};

const pageActionUpdateAllTabs = async function() {
  const currentTabs = await browser.tabs.query({ currentWindow: true });
  currentTabs.forEach(tab => {
    if (tab.id && tab.id !== browser.tabs.TAB_ID_NONE) updatePageAction(tab.id);
  });
};

const messageHandler = async function(message) {
  if (!message.event) return;
  if (message.event === "backgroundSettingsUpdate") {
    const storedSettings = await simpleStorage.get("settings") || {};
    settings = {
      ...defaultSettings,
      ...storedSettings,
    };
    await browser.runtime.sendMessage({
      "event": "settingsUpdate",
      "settings": settings,
    });
  }
};

const initialize = async function() {
  // @TODO Update default settings based on theme
  // (await browser.windows.getCurrent()).id

  // Settings
  const storedSettings = await simpleStorage.get("settings") || {};
  settings = {
    ...defaultSettings,
    ...storedSettings,
  };
  await simpleStorage.set("settings", settings);
  await simpleStorage.set("defaultSettings", defaultSettings);
  console.log("Loaded settings", settings, storedSettings);

  // Browser action
  browser.browserAction.onClicked.addListener(browserActionListener);
  // Page action theme support
  browser.tabs.onUpdated.addListener(tabsOnUpdatedListener);
  // Add message handler
  browser.runtime.onMessage.addListener(messageHandler);
};

initialize();
