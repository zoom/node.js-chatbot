"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

let callResource = (resource, callback) => {
  //callback返回false则 暂停剩下的
  let returnData;

  let setData = data => {
    returnData = data;
  };

  if (typeof resource === 'function') {
    callback(setData, resource);
    return returnData;
  } else if (Array.isArray(resource)) {
    let lg = resource.length,
        i = 0;
    let out = null;

    for (; i < lg; i += 1) {
      out = callback(setData, resource[i], i, lg);

      if (out === 'break') {
        return returnData;
      }
    }
  } else if (typeof resource === 'object') {
    let key = null,
        out = null;
    let keys = Object.keys(resource);
    let lg = keys.length;

    for (key of keys) {
      out = callback(resource[key], key, lg);

      if (out === 'break') {
        return returnData;
      }
    }
  }
};

let switchResource = (resource, callback) => {
  //callback返回true表示相关资源找到并且运行，结束
  let returnData;

  let setData = data => {
    returnData = data;
  };

  if (typeof resource === 'function') {
    callback(setData, resource);
    return returnData;
  } else if (Array.isArray(resource)) {
    let lg = resource.length,
        i = 0;
    let out = null;

    for (; i < lg; i += 1) {
      out = callback(setData, resource[i], i, lg);

      if (out === 'break') {
        return returnData;
      }
    }
  } else if (typeof resource === 'object') {
    let key = null,
        out = null;
    let keys = Object.keys(resource);
    let lg = keys.length;

    for (key of keys) {
      out = callback(setData, resource[key], key, lg);

      if (out === 'break') {
        return returnData;
      }
    }
  }
};

let nextArray = (name, arr) => {
  let ind = arr.indexOf(name);

  if (ind === -1) {
    return false;
  }

  let nextInd = ind + 1;

  if (nextInd >= arr.length) {
    return false;
  }

  return arr[nextInd];
};

class Branch {
  constructor() {
    this.storeFunction = {};
    this.map = [];
    this.state = {
      switchName: null,
      switchType: null,
      sn: 0,
      store: {},
      firstRun: null
    };
  }

  done(resolve) {
    this.done = lastData => {
      let store = this.state.store;
      this.map = [], this.storeFunction = {};
      this.state = {
        switchName: null,
        switchType: null,
        sn: 0,
        store: {},
        firstRun: null
      };
      resolve({
        store,
        data: lastData
      });
    };

    return this;
  }

  fail(reject) {
    this.fail = err => {
      this.map = [], this.storeFunction = {};
      this.state = {
        switchName: null,
        switchType: null,
        sn: 0,
        store: {},
        firstRun: null
      };
      reject(err);
    };

    return this;
  }

  jump(name, data) {
    let callback = this.storeFunction[name];
    callback(data);
  }

  switchNext(name, type = 'switch') {
    //分为loop,switch
    this.state.switchName = name;
    this.state.switchType = type;
  }

  process({
    callback,
    props = [],
    name
  }) {
    let ts = this;
    let state = this.state;

    if (!name || this.map.indexOf(name) !== -1) {
      name = state.sn += 1;
    }

    this.map.push(name);

    let newCallback = data => {
      let {
        store,
        switchName,
        switchType
      } = state;
      let multipleRun = null;

      if (switchType === 'loop') {
        multipleRun = callResource;
      } else {
        multipleRun = switchResource;
      }

      let fResult = multipleRun(callback, function (setData, run, key) {
        let res;

        if (key !== undefined) {
          if (key === switchName) {
            res = callback.call({
              done: ts.done.bind(ts),
              store,
              data: data,
              jump: ts.jump.bind(ts),
              switchNext: ts.switchNext.bind(ts)
            }, ...props);
            setData(res);
            return 'break';
          } else {
            return 'continue';
          }
        } else {
          res = callback.call({
            done: ts.done.bind(ts),
            store,
            data: data,
            jump: ts.jump.bind(ts),
            switchNext: ts.switchNext.bind(ts)
          }, ...props);
          setData(res);
          return 'break';
        }
      });

      if (typeof fResult === 'object' && typeof fResult.then === 'function') {
        fResult.then(function (data) {
          store[name] = data;
          let nextName = nextArray(name, ts.map);

          if (nextName === false) {
            //为最后一个函数
            ts.done(data);
          } else {
            ts.storeFunction[nextName](data);
          }
        }).catch(function (err) {
          ts.fail(err);
        });
      } else {
        store[name] = fResult;
        let nextName = nextArray(name, ts.map);

        if (nextName === false) {
          //为最后一个函数
          ts.done(fResult);
        } else {
          ts.storeFunction[nextName](fResult);
        }
      }
    };

    ts.storeFunction[name] = newCallback;
    return newCallback;
  }

  set({
    callback,
    props,
    name
  }) {
    let firstRun = this.state.firstRun;
    let run = this.process({
      callback,
      props,
      name
    });

    if (firstRun === null) {
      this.state.firstRun = run;
    }

    return this;
  }

  run() {
    // this.nowInstance.run();
    let firstRun = this.state.firstRun;

    if (typeof firstRun === 'function') {
      firstRun();
    }

    return this;
  }

}

let branch = function (funcList) {
  let loop = new Branch();
  return new Promise((resolve, reject) => {
    loop.done(resolve).fail(reject);
    funcList.forEach(obj => {
      let {
        props,
        callback,
        name
      } = obj;
      loop.set({
        callback,
        props,
        name
      });
    });
    loop.run();
  });
};

exports.default = branch; // module.exports = branch;

module.exports = exports.default;