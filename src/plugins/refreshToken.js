import utils from '../utils/index';
import api from '../services/api';

let createAppString = (appKey, appSecret) => {
  return 'Basic ' + Buffer.from(`${appKey}:${appSecret}`).toString('base64');
};

let refreshToken = function(appKey, appSecret, refresh_token) {
  // let { appKey, appSecret, redirect_uri, code: storeCode } = store.get(['appKey', 'appSecret', 'code', 'redirect_uri']);

  return new Promise((resolve, reject) => {
    if (!appKey || !appSecret) {
      reject({ code: 400, error: `must config appKey and appSecret` });
      return;
    }

    let appString = createAppString(appKey, appSecret);
    let url = api.refreshToken.get('url', { appKey, appSecret, refresh_token });
    let method = api.refreshToken.get('method');

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

export default refreshToken;
