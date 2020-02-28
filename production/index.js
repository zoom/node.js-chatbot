"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.request = exports.log = exports.setting = exports.client = exports.oauth2 = undefined;

var _index = require("./oauth2/index");

var _index2 = _interopRequireDefault(_index);

var _index3 = require("./client/index");

var _index4 = _interopRequireDefault(_index3);

var _config = require("./services/config");

var _config2 = _interopRequireDefault(_config);

var _log = require("./services/log");

var _log2 = _interopRequireDefault(_log);

var _request = require("./utils/request");

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let oauth2 = function (appKey, appSecret, redirect_uri, baseUrl) {
  return new _index2.default(appKey, appSecret, redirect_uri, baseUrl);
};

let setting = {
  retry(opt) {
    if (typeof opt === 'object') {
      let retryObj = _config2.default.retry;

      for (let key in opt) {
        let item = opt[key];

        if (typeof item.no === 'number' && typeof item.condition === 'function') {
          retryObj[key] = item;
        }
      }
    }
  },

  caseSensitive(tf = true) {
    _config2.default.ifCase = tf;
  },

  debug(tf = false) {
    _config2.default.debug = tf;
  },

  setUrl(url) {
    let reg = /https:\/\//;

    if (reg.test(url)) {
      _config2.default.url = url;
    }
  }

};

let client = function (...props) {
  return new _index4.default(...props);
};

let log = function (func) {
  _log2.default.decorate(func);
};

exports.oauth2 = oauth2;
exports.client = client;
exports.setting = setting;
exports.log = log;
exports.request = _request2.default;