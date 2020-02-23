// import store from './store';
import config from './config';
let transform = {
  keyword: '@conference.',
  checkType(str) {
    let kw = this.keyword;
    if (str.indexOf(kw) !== -1) {
      return 'channel';
    }
    return 'bot';
  },
  getConfigCmd(cmd) {
    if(!config.ifCase){
      cmd=cmd.toLowerCase();
    }
    if (typeof cmd === 'string' && cmd.trim() === 'help') {
      return 'help';
    }
    return null;
  },
  splitCmd(cmd) {
    if (typeof cmd === 'string') {
      let cmdArr = cmd.split(' ');
      let out = [];
      cmdArr.forEach(val => {
        if (val.trim()) {
          out.push(val);
        }
      });
      return {
        command: out[0],
        hint: out.slice(1)
      };
      // return out;
    } else {
      return {};
    }
  },
  get({ body, headers, appKey, verification_token }) {
    let { authorization, clientid } = headers;
    if (!(authorization === verification_token && appKey === clientid)) {
      return {
        status: false,
        errorMessage: `verification_token or client_id check failure`
      };
    }
    let { map } = this;
    let { payload, event } = body;
    if (typeof payload !== 'object') {
      return { status: false, errorMessage: 'payload format error' };
    }
    let { toJid, cmd } = payload;
    // let { Authorization } = headers;
    //let all event put in
    // if (!(event in map)) {
    //   return {
    //     status: false,
    //     errorMessage: `server data error,${event} is not in our events map`
    //   };
    // }

    //not trigger specific name.
    let eventType = map[event];
    // if (bot_name) {
    //     eventType = eventType + '_' + bot_name;
    // }
    let type = this.checkType(toJid);
    if (eventType === 'notification') {
      let innerCmd = this.getConfigCmd(cmd);
      return {
        status: true,
        result: {
          cmdOption: this.splitCmd(cmd),
          type,
          message: cmd,
          innerCmd,
          eventFullName: event,
          eventName: eventType,
          data: payload
        }
      };
    } else {
      let actionInfo = this.switchAction(payload, eventType);
      return {
        status: true,
        result: {
          type,
          eventName: eventType,
          data: payload,
          eventFullName: event,
          info: actionInfo
        }
      };
    }
  },
  switchAction(payload, eventType) {
    if (eventType === 'edit') {
      return {
        original: payload.original,
        current: payload.editItem
      };
    } else if (eventType === 'field_edit') {
      return {
        original: payload.original,
        current: payload.fieldEditItem
      };
    } else if (eventType === 'button') {
      return {
        original: payload.original,
        current: payload.actionItem
      };
    } else if (eventType === 'dropdown') {
      return {
        original: payload.original,
        current: payload.selectedItems
      };
    } else {
      //for undefined and others
      return {};
    }
  },
  map: {
    interactive_message_fields_editable: 'field_edit',
    interactive_message_editable: 'edit',
    interactive_message_actions: 'button',
    interactive_message_select: 'dropdown',
    bot_notification: 'notification'
  }
};

export default transform;
