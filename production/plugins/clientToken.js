"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require("../utils/index");

var _index2 = _interopRequireDefault(_index);

var _api = require("../services/api");

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let requestClient = function (appKey, appSecret) {
  return new Promise((resolve, reject) => {
    // let { appKey, appSecret, access_token } = store.get(['appKey', 'appSecret', 'access_token']);
    let url = _api2.default.clientVerify.get('url', {
      appKey,
      appSecret
    });

    let method = _api2.default.clientVerify.get('method');

    _index2.default.request({
      url,
      method
    }).then(response => {
      resolve(response.body);
    }).catch(error => {
      reject(error);
    });
  });
};

exports.default = requestClient;
module.exports = exports.default;