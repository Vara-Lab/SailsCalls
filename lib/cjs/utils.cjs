var api = require('@gear-js/api');

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

Object.defineProperty(exports, "decodeAddress", {
  enumerable: true,
  get: function () { return api.decodeAddress; }
});
exports.generateUUID = generateUUID;
