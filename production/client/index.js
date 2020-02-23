"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require("../utils/index");

var _index2 = _interopRequireDefault(_index);

var _transform = require("../services/transform");

var _transform2 = _interopRequireDefault(_transform);

var _ClientApp = require("./ClientApp");

var _ClientApp2 = _interopRequireDefault(_ClientApp);

var _config = require("../services/config");

var _config2 = _interopRequireDefault(_config);

var _log = require("../services/log");

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let createInfo = {
  help(commandStore, name) {
    if (!Array.isArray(commandStore)) {
      return false;
    }

    let msg = [{
      type: 'message',
      text: 'Here are some quick tips to get started!'
    }];

    if (commandStore.length === 0) {
      msg.push({
        type: 'message',
        text: 'No Command Now'
      });
    } else {
      commandStore.forEach(obj => {
        let {
          command,
          description,
          hint
        } = obj;
        let commandTitle = command;

        if (hint) {
          commandTitle = `${commandTitle} ${hint}`;
        }

        let commandInfo = [{
          type: 'message',
          text: commandTitle,
          style: {
            bold: true
          }
        }];
        let valueInfo = [{
          type: 'message',
          text: description
        }];
        msg = msg.concat(commandInfo);
        msg = msg.concat(valueInfo);
      });
    }

    let title = `Hi this is bot commands`;

    if (name) {
      title = `Hi there - I'm ${name} bot`;
    }

    let header = {
      text: title,
      style: {
        bold: true
      }
    };
    return {
      body: msg,
      header
    };
  },

  noCommand(commandStore, name) {
    if (!Array.isArray(commandStore)) {
      return false;
    }

    let msg = [{
      type: 'message',
      text: `I'm sorry, I don't recognize your command. Here are some quick tips to get started!`
    }];

    if (commandStore.length === 0) {
      msg.push({
        type: 'message',
        text: 'No Command Now'
      });
    } else {
      commandStore.forEach(obj => {
        let {
          command,
          description,
          hint
        } = obj;
        let commandTitle = command;

        if (hint) {
          commandTitle = `${commandTitle} ${hint}`;
        }

        let commandInfo = [{
          type: 'message',
          text: commandTitle,
          style: {
            bold: true
          }
        }];
        let valueInfo = [{
          type: 'message',
          text: description
        }];
        msg = msg.concat(commandInfo);
        msg = msg.concat(valueInfo);
      });
    }

    let title = `Unknown command`;

    if (name) {
      title = `Unknown command - I'm ${name} bot`;
    }

    let header = {
      text: title,
      style: {
        bold: true
      }
    };
    return {
      body: msg,
      header
    };
  }

};

class Client extends _index2.default.Event {
  constructor(appKey, verification_token, robot_jid, name = '') {
    super();
    this.appKey = appKey;
    this.robot_jid = robot_jid;
    this.verification_token = verification_token;
    this.commandStore = []; // this.commandNameStore=[];

    this.focusApp = null;
    this.name = name;
    this.config = {
      help: false,
      errorHelp: false
    };
    this.v = '';
  }

  configurate(opt) {
    if (typeof opt !== 'object') {
      return this;
    }

    this.config = Object.assign(this.config, opt);
    return this;
  }

  equalCommand(originCmd, cmd) {
    if (_config2.default.ifCase === true) {
      return originCmd === cmd;
    } else {
      if (typeof originCmd === 'string' && typeof cmd === 'string') {
        return originCmd.toLowerCase() === cmd.toLowerCase();
      } else {
        return false;
      }
    }
  }

  checkCommands(command) {
    if (typeof command !== 'string') {
      return false;
    }

    let {
      commandStore
    } = this;

    for (let obj of commandStore) {
      if (typeof obj.command !== 'string') {
        continue;
      }

      if (_config2.default.ifCase === true) {
        if (command === obj.command) {
          return true;
        }
      } else {
        if (command.toLowerCase() === obj.command.toLowerCase()) {
          return true;
        }
      }
    }

    return false;
  }

  defaultAuth(connection) {
    if (connection) {
      let {
        robot_jid
      } = this;
      this.focusApp = new _ClientApp2.default(robot_jid, connection);
    }

    return this;
  }

  create(opt) {
    let newApp = null;
    let {
      robot_jid
    } = this;

    if (typeof opt === 'object') {
      //this create new app
      let {
        auth
      } = opt;
      newApp = new _ClientApp2.default(robot_jid, auth);
      this.focusApp = newApp;
    } else {
      //no create auth,
      newApp = this.focusApp;
    }

    return newApp;
  }

  command(opts) {
    //abandon method
    if (Array.isArray(opts)) {
      opts.forEach(obj => {
        this._commandObj(obj);
      });
    } else if (typeof opts === 'object') {
      this._commandObj(opts);
    }

    return this;
  }

  _commandObj(obj) {
    //aband
    if (typeof obj === 'object') {
      //['command','description'] hint?
      if (_index2.default.hasAllAttrs(obj, ['command', 'description'])) {
        this.commandStore.push(obj);
      }
    }
  }

  _commandsObj(obj) {
    if (typeof obj === 'object') {
      //['command','description'] hint?
      if (_index2.default.hasAllAttrs(obj, ['command', 'description'])) {
        this.commandStore.push(obj);
      }
    }
  }

  commands(opts) {
    if (Array.isArray(opts)) {
      opts.forEach(obj => {
        this._commandsObj(obj);
      });
    } else if (typeof opts === 'object') {
      this._commandsObj(opts);
    }

    return this;
  }

  version(v) {
    this.v = v;
    return this;
  }

  parse({
    body,
    headers
  }) {
    let out = this.route({
      body,
      headers
    });
    let {
      status,
      result
    } = out;

    if (status === false) {
      return out;
    } else if (status === true) {
      let {
        cmdOption,
        type,
        message,
        eventName,
        eventFullName,
        data
      } = result;

      if (eventName === 'notification') {
        return {
          status,
          data: {
            command: cmdOption.command,
            hint: cmdOption.hint,
            message,
            type,
            payload: data,
            event: eventName
          }
        };
      } else {
        return {
          status,
          data: {
            type,
            payload: data,
            event: eventName,
            actionFullName: eventFullName,
            action: eventName,
            info: result.info
          }
        };
      }
    }
  }

  route({
    body,
    headers
  }) {
    let {
      appKey,
      verification_token
    } = this;

    let out = _transform2.default.get({
      body,
      headers,
      store: this.store,
      appKey,
      verification_token
    });

    if (out.status === false) {
      _log2.default.run({
        type: 'error_notice',
        message: {
          error: out.errorMessage
        }
      });
    }

    return out;
  }

  triggerHelp(accountId, toJid) {
    return new Promise((resolve, reject) => {
      this._triggerHelp({
        accountId,
        toJid
      }).then(data => {
        resolve(data);
      }).catch(err => {
        reject(err);
      });
    });
  }

  triggerNoCommand(accountId, toJid) {
    return this._triggerNoMatchCommand({
      accountId,
      toJid
    });
  }

  _autoBackMsg(data, type) {
    let {
      accountId: account_id,
      toJid: to_jid
    } = data;
    let {
      focusApp,
      commandStore,
      name
    } = this;
    let helpInfo = createInfo[type](commandStore, name);
    return new Promise((resolve, reject) => {
      if (helpInfo === false) {
        resolve();
      } //not trigger error in this


      focusApp.sendMessage({
        to_jid,
        account_id,
        body: helpInfo.body,
        header: helpInfo.header
      }).then(da => {
        resolve(da);
      }).catch(e => {
        reject(e);
      });
    });
  }

  _triggerNoMatchCommand(data) {
    return this._autoBackMsg(data, 'noCommand');
  }

  _triggerHelp(data) {
    return this._autoBackMsg(data, 'help');
  }

  async handleNotification(result, allCallback) {
    let {
      type,
      innerCmd,
      eventName,
      data,
      cmdOption = {},
      message,
      eventFullName
    } = result;

    if (!_config2.default.ifCase && typeof cmdOption.command === 'string') {
      cmdOption.command = cmdOption.command.toLowerCase();
    }

    let {
      focusApp,
      config
    } = this;

    if (config.help === true && eventName === 'notification' && this.equalCommand(innerCmd, 'help') && focusApp !== null) {
      try {
        await this._triggerHelp(data);
        allCallback(null, {
          event: eventFullName,
          payload: data,
          type,
          command: cmdOption.command,
          message
        });
      } catch (e) {
        allCallback({
          type: 'triggerHelp',
          errorMessage: e
        });
      }
    } else {
      let sendData = {
        event: eventFullName,
        payload: data,
        data: cmdOption.hint,
        type,
        message,
        command: cmdOption.command
      };
      let ifCommand = this.checkCommands(cmdOption.command);
      let err = null;

      if (ifCommand === false) {
        if (config.errorHelp === true) {
          //auto trigger error help
          try {
            await this._triggerNoMatchCommand(data);
          } catch (e) {
            err = e; // allCallback({ type:'triggerNoMatchCommand',errorMessage:e});
          } // return this;

        } else {
          // allCallback(null, sendData);
          this.trigger('messages', sendData); // return this;
        }
      }

      try {
        await this.trigger('command', {
          data,
          type,
          command: eventName
        }); //old trigger
        //change data->commands

        await this.trigger('commands', sendData);
      } catch (e) {
        err = e;
      }

      if (err) {
        allCallback(err);
      } else {
        allCallback(null, sendData);
      }
    }
  }

  async handleAction(result, allCallback) {
    let {
      type,
      eventName,
      eventFullName,
      data,
      info
    } = result;
    let sendData = {
      event: eventFullName,
      payload: data,
      type,
      info,
      actionFullName: eventFullName,
      action: eventName
    };

    try {
      await this.trigger('actions', sendData);
      allCallback(null, sendData);
    } catch (e) {
      allCallback(e);
    }
  }

  handleCallback(result, allCallback) {
    //run the help split,and normal command split,and parse one to one and group,and commandName
    if (result.eventName === 'notification') {
      return this.handleNotification(result, allCallback);
    } else {
      return this.handleAction(result, allCallback);
    }
  }

  handle({
    body,
    headers
  }, allCallback) {
    if (typeof allCallback === 'function') {
      return this.handleCompatibility({
        body,
        headers
      }, allCallback);
    } else {
      return new Promise((resolve, reject) => {
        allCallback = function (error, msg) {
          if (error) {
            reject(error);
          } else {
            resolve(msg);
          }
        };

        if (typeof body !== 'object') {
          reject(`no body and query data`);
          return;
        }

        let routeEntity = this.route({
          body,
          headers
        });

        if (routeEntity.status === false) {
          reject(routeEntity.errorMessage);
        } else {
          this.handleCallback(routeEntity.result, allCallback);
        }
      });
    }
  }

  handleCompatibility({
    body,
    headers
  }, allCallback) {
    if (typeof body !== 'object') {
      //only check body
      if (typeof allCallback === 'function') {
        allCallback({
          type: 'format',
          errorMessage: 'body format error'
        });
      }

      return this;
    } //get transform message


    let routeEntity = this.route({
      body,
      headers
    });

    if (routeEntity.status === false) {
      if (routeEntity.errorMessage && typeof allCallback === 'function') {
        allCallback({
          type: 'verify',
          errorMessage: routeEntity.errorMessage
        });
      }

      return this;
    } //value is which route to route
    //split help and command


    this.handleCallback(routeEntity.result, allCallback);
    return this;
  }

}

exports.default = Client;
module.exports = exports.default;