import nodefetch from 'node-fetch';
// import querystring from 'querystring';
import debug from './debug';
import serviceLog from '../services/log';
import AbortController from 'abort-controller';
import FormData from 'form-data';
import {URLSearchParams} from 'url';

let errorHandle=(logDataOption,errorInfo,reject)=>{
  serviceLog.run({
    type: 'http',
    message: {
      request: logDataOption,
      response: null,
      error:errorInfo
    }
  });
  serviceLog.run({
    type: 'error_notice',
    message: {
      error:errorInfo
    }
  });
  reject(Object.assign({},errorInfo));
};

let requestWrap = opt => {
  let {
    body,
    bodyType,
    method = 'get',
    url,
    headers = {},
    query = {},
    timeout
  } = opt;
  return new Promise((resolve, reject) => {

    let newBody=body;
    if(bodyType==='formParameters'){
      newBody = new URLSearchParams();
      Object.keys(body).forEach((key)=>{
        newBody.append(key,body[key]);
      });
    }
    else if(bodyType==='formData'){
      newBody = new FormData();
      Object.keys(body).forEach((key)=>{
        newBody.append(key,body[key]);
      });
    }
    else if(typeof body==='object'){
      newBody=JSON.stringify(body);
    }
    
    let dataOption={
      method,
      headers,
      body:newBody
    };
    let timeoutResult=null;
    if(typeof timeout==='number'){
      const controller = new AbortController();
      timeoutResult=setTimeout(
        () => { controller.abort(); },
        timeout,
      );
    }

    if(typeof query==='object'){
      let urlObject=new URL(url);
      Object.keys(query).forEach((name)=>{
        urlObject.searchParams.set(name,query[name]);
      });
      url=urlObject.href;
    }

    let logDataOption=Object.assign({url},dataOption);
    debug('http')(logDataOption);


    let nodefeatchResult=nodefetch(url,dataOption)
    .then((res)=>{
      let status=res.status;
      let headers=res.headers;
      res.text().then((responseBody)=>{
        let responseText=responseBody;
        if(typeof responseBody==='string'){
          try{
            responseBody=JSON.parse(responseBody);
          }
          catch(e){
            responseBody=responseText;//can't parse
          }
          // catch(e){
          //   errorHandle(logDataOption,{
          //     type:'parseError',
          //     status,
          //     message:responseText
          //   },reject);
          //   return;
          // }
        }
        if (status >= 200 && status < 300){//success 
          serviceLog.run({
            type: 'http',
            message: {
              request: logDataOption,
              response: {
                status,
                body:responseBody
              },
              error:null
            }
          });
          resolve({status,body:responseBody,headers});
        } else {//success but status fail
          errorHandle(logDataOption,{
            status:status,
            message:responseBody
          },reject);
          return;
        }
      })
      .catch((e)=>{//promise all error
        errorHandle(logDataOption,{
          // type:'parseError',
          status,
          message:e
        },reject);
        return;
      });
    })
    .catch((e)=>{//request error
      errorHandle(logDataOption,e,reject);
    });
    if(timeoutResult!==null){
      nodefeatchResult.finally(()=>{
        clearTimeout(timeoutResult);
      });
    }
  });
};

export default requestWrap;
