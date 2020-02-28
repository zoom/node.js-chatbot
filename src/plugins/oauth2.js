import utils from '../utils/index';
import api from '../services/api';

let createAppString = (appKey, appSecret) => {
  return 'Basic ' + Buffer.from(`${appKey}:${appSecret}`).toString('base64');
};

let oauth2 = function(appKey, appSecret, redirect_uri, code,baseUrl) {
  // let { appKey, appSecret, redirect_uri, code: storeCode } = store.get(["appKey", "appSecret", "code", "redirect_uri"]);

  return new Promise((resolve, reject) => {
    // if (!appKey || !appSecret) {
    //     reject(`must config appKey and appSecret`);
    //     return;
    // }
    // if (!code) {
    //     reject({code:400,errorMessage:`must input code from oauth`});
    //     return;
    // }

    let appString = createAppString(appKey, appSecret);
    let url = api.oauth2.get('url', { code, redirect_uri,baseUrl });
    let method = api.oauth2.get('method');

    utils
      .request({
        url,
        method,
        headers: {
          Authorization: appString
        }
      })
      .then(response => {
        let { body } = response;
        resolve(body);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export default oauth2;
