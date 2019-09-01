"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class Store {
  constructor(valid) {
    this.valid = valid;
    this.store = {};
  }

  get(key) {
    if (key === undefined) {
      return this.store;
    }

    let {
      store
    } = this;

    if (typeof key === 'string') {
      return store[key];
    } else if (Array.isArray(key)) {
      let out = {};
      key.forEach(k => {
        if (k in store) {
          out[k] = store[k];
        }
      });
      return out;
    }
  }

  set(key_object, value) {
    //only support one set
    let {
      store
    } = this;

    if (typeof key_object === 'string') {
      store[key_object] = value;
    } else if (typeof key_object === 'object') {
      Object.assign(store, key_object);
    }
  }

}

exports.default = Store;
module.exports = exports.default;