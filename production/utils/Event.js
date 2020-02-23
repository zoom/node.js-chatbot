"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

class Event {
  constructor() {
    this.eventStore = {//not set valid 
    };
  }

  off(eventType) {
    //only support single callback
    let {
      eventStore
    } = this;

    if (eventType in eventStore) {
      eventStore[eventType] = {};
    }
  }

  on(eventType, callback) {
    if (typeof callback !== 'function') {
      return;
    }

    let {
      eventStore
    } = this;

    if (eventType in eventStore) {
      eventStore[eventType].push({
        callback
      });
    } else {
      eventStore[eventType] = [{
        callback
      }];
    }

    return this;
  }

  async trigger(eventType, data) {
    //loop multiple callback
    let {
      eventStore
    } = this; // return new Promise((resolve, reject) => {

    if (eventType in eventStore) {
      let actions = eventStore[eventType];
      let lg = actions.length;

      if (lg === 1) {
        try {
          await actions[0].callback(data);
        } catch (e) {//
        }
      } else if (lg > 1) {
        try {
          for (let ac of actions) {
            await ac.callback(data);
          }
        } catch (e) {//
        }
      }
    } else {} // reject(`not bind ${eventType} event`);
      // });

  }

}

;
exports.default = Event;
module.exports = exports.default;