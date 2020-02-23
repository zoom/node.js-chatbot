"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
let log = {
  store: null,

  decorate(func) {
    if (typeof func === 'function') {
      this.store = func;
    }
  },

  parse(opt) {
    if (typeof opt === 'object') {
      let {
        type,
        message
      } = opt;

      if (type === 'http') {
        return {
          type,
          message: Object.assign({}, message)
        };
      } else {
        return opt;
      }
    } else {
      return opt;
    }
  },

  run(opt) {
    let func = this.store;

    if (typeof func === 'function') {
      func(this.parse(opt));
    }
  }

};
exports.default = log;
module.exports = exports.default;