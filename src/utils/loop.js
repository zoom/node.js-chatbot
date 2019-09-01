import delay from 'delay';
// const timeoutFunc = ms => new Promise(res => setTimeout(res, ms));

let loop = async (func, firstArg, nextArg, endCondition, no = 1, timeout = 500) => {
  return new Promise(async (resolve, reject) => {
    let ifNext;
    let out = null;
    // let type;
    try {
      out = await func(...firstArg);
      ifNext = endCondition(out, 'success');
      if (ifNext !== true) {
        // do not have next step
        //   return out;
        resolve(out);
        return;
      }
    } catch (e) {
      ifNext = endCondition(e, 'fail');
      if (ifNext !== true) {
        reject(e);
        return;
      }
    }

    for (let i = 0; i < no; i += 1) {
      let time = 500;
      if (typeof timeout === 'function') {
        time = timeout(i+1,no);
      } else if (typeof timeout === 'number') {
        time = timeout;
      }
      try {
        // await timeoutFunc(time);
        await delay(time);
        out = await func(...nextArg);
        ifNext = endCondition(out);
        // type = 'success';
        if (ifNext !== true) {
          resolve(out);
          return; // return out;
        }
        if (i === no - 1) {
          resolve(out);
        }
      } catch (e) {
        ifNext = endCondition(e, 'fail');
        if (ifNext !== true) {
          reject(e);
          return;
        }
        if (i === no - 1) {
          reject(e);
        }
      }
    }
  });
};

export default loop;