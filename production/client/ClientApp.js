"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sendMessage = require("../plugins/sendMessage");

var _sendMessage2 = _interopRequireDefault(_sendMessage);

var _getUser = require("../plugins/getUser");

var _getUser2 = _interopRequireDefault(_getUser);

var _request = require("../plugins/request");

var _request2 = _interopRequireDefault(_request);

var _error = require("../services/error");

var _error2 = _interopRequireDefault(_error);

var _config = require("../services/config");

var _config2 = _interopRequireDefault(_config);

var _index = require("../utils/index");

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import channelList from '../plugins/channelList';
class ClientApp {
  constructor(robot_jid, auth) {
    this.robot_jid = robot_jid;
    this.auth = auth;
  }

  getToken(func, fail, refresh = false) {
    let {
      auth
    } = this;
    let expired = auth.expired();
    let tokens = auth.getTokens();

    if (tokens === false) {
      let msg = `don't get tokens before use action`;

      _error2.default.code({
        type: 'code',
        message: msg
      });

      fail(msg);
      return;
    }

    let {
      refresh_token,
      access_token
    } = tokens;

    if (expired === true || refresh === true) {
      auth.requestTokensByRefresh(refresh_token).then(newTokens => {
        func(newTokens.access_token);
      }).catch(err => {
        fail(err);
      });
    } else {
      func(access_token);
    }
  }

  getClientToken(func, fail, refresh = false) {
    let {
      auth
    } = this;
    let expired = auth.expiredClient();
    let clientTokens = auth.getClientTokens();

    if (clientTokens === false || refresh === true) {
      auth.requestClientTokens().then(newClientTokens => {
        func(newClientTokens.access_token);
      }).catch(err => {
        fail(err);
      });
      return;
    }

    let {
      access_token
    } = clientTokens;

    if (expired === true) {
      auth.requestClientTokens().then(newClientTokens => {
        func(newClientTokens.access_token);
      }).catch(err => {
        fail(err);
      });
    } else {
      func(access_token);
    }
  }

  request(option, type) {
    return this._action([option, type], 'request');
  }

  _request(opt, type = 'access', refresh = false) {
    if (typeof opt !== 'object') {
      throw new _error2.default.ParamError(`${opt} must be object`); // return;
    }

    return new Promise((resolve, reject) => {
      if (type === 'access') {
        type = 'getToken';
      } else if (type === 'credential') {
        type = 'getClientToken';
      } else {
        reject(`param type must be access or credential`);
        return;
      }

      this[type](access_token => {
        (0, _request2.default)(access_token, opt).then(data => {
          resolve(data);
        }).catch(err => {
          reject(err);
        });
      }, err => {
        _error2.default.action({
          type: 'action',
          message: err
        });

        reject(err);
      }, refresh);
    });
  }

  getUser(email) {
    return this._action([email], 'getUser');
  }

  _getUser(email, refresh = false) {
    return new Promise((resolve, reject) => {
      this.getToken(access_token => {
        (0, _getUser2.default)(access_token, email).then(data => {
          resolve(data);
        }).catch(err => {
          reject(err);
        });
      }, err => {
        _error2.default.action({
          type: 'action',
          message: err
        });

        reject(err);
      }, refresh);
    });
  }

  ifRetry(functionName) {
    if (!functionName) {
      return false;
    }

    let retry = _config2.default.retry;

    if (typeof retry === 'object' && functionName in retry) {
      let info = retry[functionName];

      if (typeof info === 'object' && typeof info.no === 'number' && typeof info.condition === 'function') {
        if (info.no > 0) {
          return true;
        }
      }
    }

    return false;
  }

  sendMessage(option) {
    return this._action([option], 'sendMessage');
  }

  _sendMessage(option, refresh = false) {
    //user_id will more speed
    return new Promise((resolve, reject) => {
      this.getClientToken(access_token => {
        let {
          robot_jid
        } = this; // let { body, header, account_id, to_jid,settings,content} = option;

        (0, _sendMessage2.default)(access_token, robot_jid, option).then(data => {
          resolve(data);
        }).catch(err => {
          reject(err);
        });
      }, err => {
        _error2.default.action({
          type: 'action',
          message: err
        });

        reject(err);
      }, refresh);
    }); // return sendMessage(userId,to_jid,body,header)
  }

  _action(args, functionName) {
    let ifRetry = this.ifRetry(functionName);

    if (ifRetry === true) {
      //go retry
      let retryInfo = _config2.default.retry[functionName];
      let {
        no,
        condition,
        timeout
      } = retryInfo;
      return _index2.default.loop((...newArgs) => {
        return this['_' + functionName](...newArgs);
      }, [...args], [...args, true], condition, no, timeout);
    } else {
      return this['_' + functionName](...args);
    }
  } // channelList(userId){
  //     return this._action([userId],'channelList');
  // }
  // _channelList(userId,refresh=false) {
  //     return new Promise((resolve, reject) => {
  //         this.getToken(
  //             access_token => {
  //                 channelList(access_token, userId)
  //                     .then(data => {
  //                         resolve(data);
  //                     })
  //                     .catch(err => {
  //                         reject(err);
  //                     });
  //             },
  //             err => {
  //                 error.action({ type: 'action', message: err });
  //                 reject(err);
  //             },
  //             refresh
  //         );
  //     });
  // }


  clear() {
    this.auth = null;
  }

}

exports.default = ClientApp;
module.exports = exports.default;