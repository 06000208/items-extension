/* eslint-disable no-unused-vars */
import App from "./App.js";
import ItemsService from "./ItemsService.js";
import { defaultSettings, internalAppMessages } from "./constants.js";
import simpleStorage from "./simpleStorage.js";

/**
 * Internal application class used in the background script
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/contentScripts
 * @extends App
 */
class InternalApp extends App {
    constructor() {
        super();

        /**
         * @type {ItemsService}
         */
        this.items = new ItemsService(this);
    }

    toString() { return "InternalApp"; }

    /**
     * Listener used for runtime.onMessage
     * @param {object} message;
     * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage
     */
    async onMessageListener(message) {
        // await super.onMessageListener(message);
        if (!message || !message.content) return;
        if (!internalAppMessages.includes(message.content)) return;
        if (message.content === "backgroundSettingsUpdate") {
            this.dispatchEvent(new CustomEvent("settingsUpdate", {
                detail: message.detail, // Settings
            }));
        }
    }

    /**
     * Listener used for InternalApp's settingsUpdate event
     * @note This overrides the original function in App
     * @param {*} event - event.detail is the new settings object
     */
    async settingsUpdateListener(event) {
        if (this.settings.darkTheme !== event.detail.darkTheme) {
            await this.pageActionUpdateAllTabs();
        }
        super.settingsUpdateListener(event); // Updates this.settings and prints to console
        await simpleStorage.set("settings", this.settings);
        await browser.runtime.sendMessage({
            "content": "settingsUpdate",
            "detail": this.settings, // Settings
        });
    }

    /**
     * Opens the extension's web application, supports new tab and detached panel
     * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/windows/create
     * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/create
     * @param {boolean} detached Whether or not to open the page as a detached panel
     */
    openWebApp(detached = false) {
        if (detached) {
            browser.windows.create({
                type: "detached_panel",
                url: this.settings.darkTheme ? "indexDetached-dark.html" : "indexDetached-light.html",
                width: 700,
                height: 500,
            });
        } else {
            browser.tabs.create({
                active: this.settings.focusEngine,
                url: this.settings.darkTheme ? "/index-dark.html" : "/index-light.html",
            });
        }
    }

    /**
     * Listener that handles interactions with the browser action button defined in manifest.json
     * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browserAction/onClicked
     * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/browserAction/setPopup
     */
    browserActionListener(tabs, onClickData) {
        if (!this.settings.browserActionPopup || onClickData.button === 1) {
            this.openWebApp();
        } else {
            // This is a workaround to retain the ability for browserAction.onClicked to be called
            // When a popup is defined, the event won't fire
            browser.browserAction.setPopup({ "popup": this.settings.darkTheme ? "quickMenu-dark.html" : "quickMenu-light.html" });
            browser.browserAction.openPopup().then(() => browser.browserAction.setPopup({ "popup": "" }));
        }
    }

    /**
     * Sets/updates a specific tab's page action's popup
     * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/pageAction/setPopup
     * @todo Should update the page action's icon to the blue version if url is bookmarked or stored in any field
     * @param {*} tabId - The id of the tab to be updated
     * @param {?string} [url] - Optionally included page url, used for debugging
     */
    updatePageAction(tabId, url = null) {
        console.log("updatePageAction updating:", tabId, url);
        browser.pageAction.setPopup({
            tabId,
            popup: this.settings.darkTheme ? "add-dark.html" : "add-light.html",
        });
    }

    /**
     * Updates page action popups for every tab, used to support light and dark themes
     * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/query
     */
    async pageActionUpdateAllTabs() {
        // const currentTabs = await browser.tabs.query({ currentWindow: true });
        const allTabs = await browser.tabs.query({});
        console.log("pageActionUpdateAllTabs queried tabs:", allTabs);
        allTabs.forEach(tab => {
            if (tab.id && (tab.id !== browser.tabs.TAB_ID_NONE)) this.updatePageAction(tab.id, tab.url);
        });
    }

    /**
     * Listener used for tabs.onUpdated to keep the page action's popup in sync
     * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated
     */
    tabsOnUpdatedListener(tabId, changeInfo, tab) {
        // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/pageAction/setPopup#examples
        // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onUpdated
        if (changeInfo.status && changeInfo.status === "loading") this.updatePageAction(tabId, tab.url);
    }

    /**
     * Async initialization to handle things that can't be done in the constructor
     * @note This calls the original function on App via the super keyword
     */
    async initialize() {
        // Initialize parent App
        await super.initialize();

        // Handle browser theme matching
        /** @todo if this.settings.theme==="browser" handle browser theme matching */
        /** @todo push a settings update event */

        // Store settings in storage
        await simpleStorage.set("settings", this.settings);

        // Browser action
        browser.browserAction.onClicked.addListener(this.browserActionListener.bind(this));

        // Page action theme support
        browser.tabs.onUpdated.addListener(this.tabsOnUpdatedListener.bind(this));
    }
}

export default InternalApp;
