import utils from '../utils/index';
import api from '../services/api';

let combineBody = function(body, header) {
  // header = header || {
  //   text: 'text',
  //   style: {
  //     color: '#000000',
  //     bold: true,
  //     itatic: false
  //   }
  // };

  if (!Array.isArray(body) && typeof body === 'object') {
    body = [body];
  }

  let out = { head: header, body };
  return out;
};

let sendMessage = function(
  access_token,
  robot_jid,
  option
) {

  return new Promise((resolve, reject) => {
    if (typeof option !== 'object') {
      throw new Error('option must be object type');
    }
    let { body, header } = option;
    let url = api.sendMessage.get('url');
    let obj = Object.assign({ robot_jid }, option);
    if (body && typeof body === 'string') {
      body = JSON.parse(body);
    }
    if (header && typeof header === 'string') {
      header = JSON.parse(header);
    }

    let sendBody = obj;

    //compat with old version
    if (body || header) {
      sendBody = Object.assign(obj, { content: combineBody(body, header) });
    }
    //create new object of option and exclude body,header
    sendBody = utils.createObjectExclude(sendBody, ['body', 'header']);
    
    let method = api.sendMessage.get('method');
    utils
      .request({
        url,
        method,
        body: sendBody,
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

export default sendMessage;
