"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

var _querystring = require("querystring");

var _querystring2 = _interopRequireDefault(_querystring);

var _debug = require("./debug");

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let requestWrap = opt => {
  let {
    body,
    formData,
    form,
    method = 'get',
    url,
    headers = {},
    query = {},
    cookie,
    timeout
  } = opt;
  return new Promise((resolve, reject) => {
    let type, data;

    if (typeof body === 'object') {
      type = 'body', data = body;
    } else if (typeof formData === 'object') {
      type = 'formData', data = formData;
    } else if (typeof form === 'object') {
      type = 'form', data = form;
    }

    let dataOption = {
      qs: query,
      headers,
      url,
      method
    };

    if (type) {
      dataOption[type] = data;
    }

    if (type === 'body') {
      dataOption.json = true;
    }

    if (typeof cookie === 'object') {
      let j = _request2.default.jar();

      let cookieRequest = _request2.default.cookie(_querystring2.default.stringify(cookie));

      j.setCookie(cookieRequest, url);
      dataOption.jar = j;
    }

    (0, _debug2.default)('http')(dataOption);

    if (typeof timeout === 'number') {
      dataOption.timeout = timeout;
    }

    (0, _request2.default)(dataOption, function (error, response) {
      if (error) {
        reject(error);
      } else {
        let code = response.statusCode;
        let oldBody = response.body;
        let newBody;

        try {
          newBody = JSON.parse(oldBody);
        } catch (e) {
          newBody = oldBody;
        }

        if (code >= 300) {
          reject(newBody);
        } else {
          response.body = newBody;
          resolve(response);
        } // response.body=newBody;
        // resolve(response);

      }
    });
  });
};

exports.default = requestWrap;
module.exports = exports.default;