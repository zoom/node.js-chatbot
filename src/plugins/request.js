import utils from '../utils/index';
import api from '../services/api';

let request = function (access_token, opt) {
    return new Promise((resolve, reject) => {
        let {url,path,body,headers={},query,method,form,formData,timeout}=opt;
        
        if(path){url=path;}
        if (!utils.isURL(url)){
            url = api.request.get('url',url);
        }
        let defaultHeaders = {
            Authorization: `Bearer ${access_token}`
        };
        headers=Object.assign(defaultHeaders,headers);
        let sendOpt = {
          headers,
          url,
          method,
          body,
          query,
          form,
          formData,
          timeout
        };
        utils
          .request(sendOpt)
          .then(response => {
            resolve(response.body);
          })
          .catch(error => {
            reject(error);
          });
    });
};

export default request;