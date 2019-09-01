"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// import debug from 'debug';
exports.default = {
  error(msg) {
    console.log('nodebots:error', msg);
  },

  warn(msg) {
    console.log('nodebots:warn', msg);
  },

  info(msg) {
    console.log('nodebots:warn', msg);
  }

};
module.exports = exports.default;