import utils from '../utils/index';
import api from '../services/api';

let requestClient = function(appKey, appSecret) {
  return new Promise((resolve, reject) => {
    // let { appKey, appSecret, access_token } = store.get(['appKey', 'appSecret', 'access_token']);
    let url = api.clientVerify.get('url', { appKey, appSecret });
    let method = api.clientVerify.get('method');
    utils
      .request({
        url,
        method
      })
      .then(response => {
        resolve(response.body);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export default requestClient;
