import simpleStorage from "./simpleStorage.js";
import { defaultSettings, appMessages } from "./constants.js";

/**
 * Basic application class with settings and relevant methods/events for content/background messaging
 * @extends EventTarget
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
 * @see https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events
 */
class App extends EventTarget {
    constructor() {
        super();

        /**
         * Extension settings
         * @note Kept up to date via extension messaging
         * @todo Implement browser.runtime.openOptionsPage(); in various places throughout the extension
         * @type {?object}
         */
        this.settings = null;
    }

    toString() { return "App"; }

    /**
     * Listener used for runtime.onMessage
     * @param {object} message;
     * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage
     */
    async onMessageListener(message) {
        if (!message || !message.content) return;
        if (!appMessages.includes(message.content)) return;
        if (message.content === "settingsUpdate") {
            this.dispatchEvent(new CustomEvent("settingsUpdate", {
                detail: message.detail, // Settings
            }));
        }
    }

    /**
     * Listener used for App's settingsUpdate event
     * @param {*} event - event.detail is the new settings object
     */
    settingsUpdateListener(event) {
        console.log("Updated settings received by", window.location.origin, event.detail);
        // const storedSettings = await simpleStorage.get("settings") || {};
        this.settings = {
            ...defaultSettings,
            ...this.settings, // This allows for partial setting updates, although nothing does that yet
            ...event.detail || {},
        };
    }

    /**
     * Async initialization to handle things that can't be done in the constructor
     */
    async initialize() {
        // Settings
        this.settings = {
            ...defaultSettings,
            ...await simpleStorage.get("settings") || {},
        };
        console.log("Loaded settings", this.settings);

        // Message Listener
        browser.runtime.onMessage.addListener(this.onMessageListener.bind(this));

        // App Events
        this.addEventListener("settingsUpdate", this.settingsUpdateListener.bind(this));
    }
}

// doSomething() {
//   this.dispatchEvent(new Event("something"));
// }

// new CustomEvent("settingsUpdate", {
//     detail: "test",
// }

export default App;
