"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require("../utils/index");

var _index2 = _interopRequireDefault(_index);

var _api = require("../services/api");

var _api2 = _interopRequireDefault(_api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let getUser = function (access_token, email) {
  return new Promise((resolve, reject) => {
    let url = _api2.default.user.get('url', {
      email
    });

    let method = _api2.default.user.get('method');

    _index2.default.request({
      url,
      method,
      headers: {
        Authorization: `Bearer ${access_token}`
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

exports.default = getUser;
module.exports = exports.default;