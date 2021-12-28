/**
 * Items class
 */
class Items {
    /**
     * @param {App} app - App or derivative classes
     */
    constructor(app) {
        /**
         * @type {app}
         * @name Items#app
         * @readonly
         */
        Object.defineProperty(this, "app", { value: app });

        /**
         * Items cache
         * @type {Map}
         */
        this.cache = new Map();
    }
}

export default Items;
