import App from "./App.js";
import Items from "./Items.js";

/**
 * Front end application class used in content scripts, popups, etc. that directly interacts with items
 * @todo Support for connection based messaging between the InternalApp and WebApp is desirable if it allows for quicker on-demand requesting of item data https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#connection-based_messaging
 * @extends App
 */
class WebApp extends App {
    constructor() {
        super();

        /**
         * @type {Items}
         */
        this.items = new Items(this);
    }

    toString() { return "WebApp"; }
}

export default WebApp;
