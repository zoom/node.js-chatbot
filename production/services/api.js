"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let url = {
  request: {
    get(type, path) {
      if (!path) {
        path = '';
      }

      if (path[0] !== '/') {
        path = '/' + path;
      }

      if (type === 'url') {
        let url = `${_config2.default.url}${path}`;
        return url;
      } else if (type in this) {
        return this[type];
      }
    }

  },
  oauth2: {
    get(type, option) {
      if (type === 'url') {
        let {
          redirect_uri,
          code,
          baseUrl
        } = option;
        let url = baseUrl || `${_config2.default.url}/oauth/token`;
        return `${url}?grant_type=authorization_code&code=${code}&redirect_uri=${redirect_uri}`;
      } else if (type in this) {
        return this[type];
      }
    },

    method: 'post'
  },
  refreshToken: {
    get(type, option) {
      if (type === 'url') {
        let {
          appKey,
          appSecret,
          refresh_token
        } = option;
        let url = `${_config2.default.url}/oauth/token`;
        return `${url}?grant_type=refresh_token&client_id=${appKey}&client_secret=${appSecret}&refresh_token=${refresh_token}`;
      } else {
        return this[type];
      }
    },

    method: 'post'
  },
  user: {
    get(type, option) {
      if (type === 'url') {
        let {
          email
        } = option;
        let url;

        if (!email) {
          url = `${_config2.default.url}/v2/users/me`;
        } else {
          url = `${_config2.default.url}/v2/users/${email}`;
        }

        return url;
      } else {
        return this[type];
      }
    },

    method: 'get'
  },
  channelList: {
    get(type, option) {
      //authoriz:access_token
      if (type === 'url') {
        let url = `${_config2.default.url}/v2/im/users`;
        let {
          userId
        } = option;
        return `${url}/${userId}/channels`;
      } else if (type in this) {
        return this[type];
      }
    },

    method: 'get'
  },
  clientVerify: {
    get(type, option) {
      if (type === 'url') {
        // let url=this.url[config.env];
        let url = `${_config2.default.url}/oauth/token`;
        let {
          appKey,
          appSecret
        } = option;
        return `${url}?grant_type=client_credentials&client_id=${appKey}&client_secret=${appSecret}`;
      } else if (type in this) {
        return this[type];
      }
    },

    method: 'post'
  },
  sendMessage: {
    get(type) {
      if (type === 'url') {
        let url = `${_config2.default.url}/v2/im/chat/messages`;
        return url;
      } else {
        return this[type];
      }
    },

    method: 'post'
  }
};
exports.default = url;
module.exports = exports.default;