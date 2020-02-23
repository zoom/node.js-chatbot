"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _debug = require("debug");

var _debug2 = _interopRequireDefault(_debug);

var _config = require("../services/config");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let debugUtils = (type = 'work') => msg => {
  if (_config2.default.debug === true) {
    let newMsg = msg;

    try {
      if (typeof msg === 'object') {
        newMsg = JSON.stringify(msg);
      }
    } catch (e) {
      newMsg = `can't change debug msg to string`;
    }

    (0, _debug2.default)(type)(newMsg);
  }
};

exports.default = debugUtils;
module.exports = exports.default;