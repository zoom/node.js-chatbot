import utils from '../utils/index';
import api from '../services/api';

let getUser = function(access_token, email) {
  return new Promise((resolve, reject) => {
    let url = api.user.get('url', { email });
    let method = api.user.get('method');
    utils
      .request({
        url,
        method,
        headers: {
          Authorization: `Bearer ${access_token}`
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

export default getUser;
