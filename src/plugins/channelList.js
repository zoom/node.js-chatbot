import utils from '../utils/index';
import api from '../services/api';

let channelList = function(access_token, userId) {
  return new Promise((resolve, reject) => {
    let url = api.channelList.get('url', { userId });
    let method = api.channelList.get('method');
    utils
      .request({
        url,
        method,
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      })
      .then(response => {
        resolve(response.body);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export default channelList;
