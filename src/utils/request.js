import request from 'request';
import querystring from 'querystring';
import debug from './debug';


let requestWrap=(opt)=>{
    let { body, formData, form, method = 'get', url, headers = {}, query = {}, cookie, timeout}=opt;

    return new Promise((resolve,reject)=>{
      let type,data;
      if(typeof body==='object'){
          type = 'body', data = body;
      }  
      else if (typeof formData==='object'){
          type='formData',data=formData;
      }
      else if(typeof form==='object'){
        type='form',data=form;
      }
      let dataOption={qs:query,headers,url,method};
      if(type){
        dataOption[type]=data;
      }
 
      if(type==='body'){
          dataOption.json=true;
      }
        if (typeof cookie==='object') {
            let j=request.jar();
            let cookieRequest = request.cookie(querystring.stringify(cookie));
            j.setCookie(cookieRequest,url);
            dataOption.jar=j;
        }
        
        debug('http')(dataOption);
        if (typeof timeout==='number'){
            dataOption.timeout=timeout;
        }
        request(dataOption,function(error,response){
            
          
            if(error){
                reject(error);
            }
            else{
                let code = response.statusCode;
                let oldBody=response.body;
                let newBody;
                try{
                    newBody = JSON.parse(oldBody);
                }
                catch(e){
                    newBody=oldBody;
                }
                if(code>=300){
                    reject(newBody);
                }
                else{
                    response.body=newBody;
                    resolve(response);
                }
                // response.body=newBody;
                // resolve(response);
            }


        });

    });
};


export default requestWrap;
