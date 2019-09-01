"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require("../utils/index");

var _index2 = _interopRequireDefault(_index);

var _api = require("../services/api");

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let request = function (access_token, opt) {
  return new Promise((resolve, reject) => {
    let {
      url,
      path,
      body,
      headers = {},
      query,
      method,
      form,
      formData,
      timeout
    } = opt;

    if (path) {
      url = path;
    }

    if (!_index2.default.isURL(url)) {
      url = _api2.default.request.get('url', url);
    }

    let defaultHeaders = {
      Authorization: `Bearer ${access_token}`
    };
    headers = Object.assign(defaultHeaders, headers);
    let sendOpt = {
      headers,
      url,
      method,
      body,
      query,
      form,
      formData,
      timeout
    };

    _index2.default.request(sendOpt).then(response => {
      resolve(response.body);
    }).catch(error => {
      reject(error);
    });
  });
};

exports.default = request;
module.exports = exports.default;