/**
 * Async helper functions that wrap browser.storage.local for simpler usage similar to [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)'s methods
 * @note This lacks has() because its redundant
 * @note Doesn't use arrow functions because they cause strange and unexpected issues
 * @type {object}
 */
const simpleStorage = {
    /**
     * @param {string} key
     * @param {*} value
     */
    set: async function(key, value) {
        return await browser.storage.local.set({ [key]: value });
    },
    /**
     * @param {string} key
     */
    get: async function(key) {
        return (await browser.storage.local.get(key))[key];
    },
    /**
     * @param {string} key
     */
    delete: async function(key) {
        return await browser.storage.local.remove(key);
    },
};

export default simpleStorage;
