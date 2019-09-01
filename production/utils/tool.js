"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

let isTrue = tf => {
  if (tf === true || tf === 'true') {
    return true;
  } else {
    return false;
  }
}; //judge whether just like a.b.c in obj


let getValue = (obj, attr) => {
  let attrArray = attr.split('.');
  let out = obj;
  let last = attrArray.pop();

  for (let attr of attrArray) {
    out = out[attr];

    if (typeof out !== 'object') {
      return false;
    }
  }

  if (last in out) {
    return out[last];
  } else {
    return false;
  }
}; //


let hasAttrs = (obj, attrs) => {
  //{a:1,b:1,c:1},attr:['a','b']
  for (let key in obj) {
    if (attrs.indexOf(key) !== -1) {
      return true;
    }
  }

  return false;
};

let hasAllAttrs = (obj, attrs) => {
  let keys = Object.keys(obj);

  for (let key of attrs) {
    if (keys.indexOf(key) === -1) {
      return false;
    }
  }

  return true;
};

let objectArrayHasValue = (arr, attr, value) => {
  //[{a:1}] have a and 1
  for (let item of arr) {
    if (item[attr] === value) {
      return true;
    }
  }

  return false;
};

let parseKeys = str => {
  //parse justlike a.b.c[0].k, to object
  if (!(typeof str === 'string')) {
    return [str];
  }

  let start = 0,
      temp,
      inNo = 0,
      collect = '';
  let lg = str.length;
  let i = 0;
  let out = [];

  for (; i < lg; i += 1) {
    temp = str[i];

    if (temp === '.') {
      if (collect !== '') {
        out.push(collect);
        collect = '';
        start = i + 1;
        inNo = 0;
      }
    } else if (temp === '[') {
      inNo += 1;

      if (collect !== '') {
        out.push(collect);
        collect = '';
        start = i + 1;
      }
    } else if (temp === ']') {
      inNo -= 1;

      if (inNo !== 0) {
        throw `${str} format error`; // return;
      }

      if (collect !== '') {
        out.push(+collect);
        collect = '';
        start = i + 1;
      }
    } else {
      collect += temp;
    }
  }

  if (start < lg) {
    out.push(collect);
  }

  return out;
};

let removeArrayEmpty = arr => {
  let newArr = [];
  arr.forEach(str => {
    if (str !== undefined && str !== '') {
      newArr.push(str);
    }
  });
  return newArr;
};

let getArrayKeyValue = function (arr, key) {
  //if array is object array,and [{a:1},{a:3}],out=>[1,2];
  let out = [];
  arr.forEach(obj => {
    if (typeof obj === 'object') {
      if (key in obj) {
        out.push(obj[key]);
      }
    }
  });
  return out;
};

let valid = (content, validTool, type = 'string') => {
  //content ,validTool maybe string,//g,'array',type like string,type,regexp
  if (type === 'string') {
    if (content.indexOf(validTool) !== -1) {
      return true;
    }
  } else if (type === 'type') {
    if (validTool === 'array') {
      if (Array.isArray(content)) {
        return true;
      }
    } else if (validTool === 'object') {
      if (typeof content === 'object') {
        return true;
      }
    } else if (typeof content === validTool) {
      return true;
    }
  } else if (type === 'regexp') {
    if (validTool.test(content)) {
      return true;
    }
  }

  return true;
};

function isURL(str) {
  // a simple check
  var reg = new RegExp('^(?:[a-z]+:)?//', 'i');
  return reg.test(str);
}

let createObjectExclude = (obj, excludeKeys) => {
  let out = {};
  let keys = Object.keys(obj);

  for (let key of keys) {
    if (excludeKeys.indexOf(key) === -1) {
      //if no key in exclude
      out[key] = obj[key];
    }
  }

  return out;
};

exports.default = {
  createObjectExclude,
  isURL,
  objectArrayHasValue,
  isTrue,
  removeArrayEmpty,
  hasAttrs,
  valid,
  hasAllAttrs,
  parseKeys,
  getArrayKeyValue,
  getValue
};
module.exports = exports.default;