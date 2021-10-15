/**
 * Default extension settings
 * @type {object}
 * @todo Update default settings based on theme? Better method than manualTheme.js
 */
const defaultSettings = {
    darkTheme: false,
    browserActionPopup: false,
    focusEngine: true,
    itemEngineTag: false,
    itemEngineTagName: "item",
    itemTagLinking: false,
    itemEngineLimitFolder: "",
    itemEngineDefaultFolder: "Other Bookmarks",
};

/**
 * Descriptions describing each setting's purpose
 * @type {object}
 */
const settingDescriptions = {
    "darkTheme": "Enable dark theme",
    "browserActionPopup": "Use the toolbar button's left click for the Quick Menu popup instead of opening Item Engine",
    "focusEngine": "Automatically switch to Item Engine when opening it from the toolbar button",
    "itemEngineTag": "Distinguish bookmarks created/modified through item engine with a tag",
    "itemEngineTagName": "Tag for distinguishing bookmarks created/modified through item engine",
    "itemTagLinking": "Enable tags linking items of the same name",
    "itemEngineLimitFolder": "Limit item engine to a specific folder",
    "itemEngineDefaultFolder": "Default folder for new items",
};

/**
 * List of valid messages for App's onMessageListener
 * @type {string[]}
 */
const appMessages = ["settingsUpdate"];

/**
 * List of valid messages for InternalApp's onMessageListener
 * @type {string[]}
 */
const internalAppMessages = ["backgroundSettingsUpdate"];

/**
 * List of valid messages for WebApp's onMessageListener
 * @type {string[]}
 */
const webAppMessages = appMessages.concat(["nyanMode"]);

export { defaultSettings, settingDescriptions, appMessages, internalAppMessages, webAppMessages };
