/**
 * Extension details
 */
const extension = {
    "name": "Item Engine",
    "version": "0.0.1",
};

/**
 * An array of valid theme files, for valid theme settings see settingsData.theme
 * @type {string[]}
 */
const themes = [
    "system",
    "light",
    "dark",
    // "alpenglow",
];

/**
 * Default extension settings
 * @todo Update default settings based on theme? Better method than manuallyApplyTheme.js
 */
const defaultSettings = {
    theme: "browser",
    browserActionPopup: false,
    focusEngine: true,
    // itemEngineTag: false,
    // itemEngineTagName: "item",
    // itemTagLinking: false,
    // itemEngineLimitFolder: "",
    // itemEngineDefaultFolder: "Other Bookmarks",
};

/**
 * Descriptions describing each setting's purpose
 */
const settingDescriptions = {
    "theme": "Theme",
    "browserActionPopup": "Use the toolbar button's left click for the Quick Menu popup instead of opening Item Engine",
    "focusEngine": "Automatically switch to Item Engine when opening it from the toolbar button",
    // "itemEngineTag": "Distinguish bookmarks created/modified through item engine with a tag",
    // "itemEngineTagName": "Tag for distinguishing bookmarks created/modified through item engine",
    // "itemTagLinking": "Enable tags linking items of the same name",
    // "itemEngineLimitFolder": "Limit item engine to a specific folder",
    // "itemEngineDefaultFolder": "Default folder for new items",
};

/**
 * Extra data for settings to generate things like select menus
 */
const settingData = {
    theme: ["browser"].concat(themes),
};

/**
 * Settings which depend upon others
 */
const settingDependencies = {
    "itemEngineTag": {
        "state": true,
        "settings": ["itemEngineTagName"],
    },
};


/**
 * Array of valid messages for App's onMessageListener
 * @type {string[]}
 */
const appMessages = ["settingsUpdate"];

/**
 * Array of valid messages for InternalApp's onMessageListener
 * @type {string[]}
 */
const internalAppMessages = ["backgroundSettingsUpdate"];

/**
 * Array of valid messages for WebApp's onMessageListener
 * @type {string[]}
 */
const webAppMessages = appMessages.concat(["nyanMode"]);

export {
    extension,
    themes,
    defaultSettings,
    settingDescriptions,
    settingData,
    settingDependencies,
    appMessages,
    internalAppMessages,
    webAppMessages,
};
