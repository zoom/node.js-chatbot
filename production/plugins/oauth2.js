"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require("../utils/index");

var _index2 = _interopRequireDefault(_index);

var _api = require("../services/api");

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let createAppString = (appKey, appSecret) => {
  return 'Basic ' + Buffer.from(`${appKey}:${appSecret}`).toString('base64');
};

let oauth2 = function (appKey, appSecret, redirect_uri, code, baseUrl) {
  // let { appKey, appSecret, redirect_uri, code: storeCode } = store.get(["appKey", "appSecret", "code", "redirect_uri"]);
  return new Promise((resolve, reject) => {
    // if (!appKey || !appSecret) {
    //     reject(`must config appKey and appSecret`);
    //     return;
    // }
    // if (!code) {
    //     reject({code:400,errorMessage:`must input code from oauth`});
    //     return;
    // }
    let appString = createAppString(appKey, appSecret);

    let url = _api2.default.oauth2.get('url', {
      code,
      redirect_uri,
      baseUrl
    });

    let method = _api2.default.oauth2.get('method');

    _index2.default.request({
      url,
      method,
      headers: {
        Authorization: appString
      }
    }).then(response => {
      let {
        body
      } = response;
      resolve(body);
    }).catch(error => {
      reject(error);
    });
  });
};

exports.default = oauth2;
module.exports = exports.default;