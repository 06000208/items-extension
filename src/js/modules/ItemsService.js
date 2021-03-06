import Items from "./Items.js";

/**
 * Items class
 * @extends Items
 */
class ItemsService extends Items {
    /**
     * @param {App} app - App or derivative classes
     */
    constructor(app) {
        super(app);
    }
}

export default ItemsService;
