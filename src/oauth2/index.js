import utils from '../utils/index';
import UserToken from './UserToken';

let createUser=function(f,proto){
  let F=function(...props){
    f.call(this,...props);
  };
  F.prototype=proto;
  return function(...props){
    return new F(...props);
  };
};


let configNewUser=function(){
      // let { refresh_token, code } = opt;
      // this.tokens = { refresh_token };
      // this.code = code;
      // this.connect = connect;
      // this.clientTokens = {};
      // this.isNewToken=false;
      this.userId=null;
      this.tokens = {};
      this.tokensExpire={start:null,end:null};
      this.tokenCallback=null;
      this.refreshTokenCallback=null;
      // this.expire_start = null;
      // this.expire_end = null;
      // this.expire_client_start = null;
      // this.expire_client_end = null;
};



class Oauth2 extends UserToken {
  constructor(appKey, appSecret, redirect_uri,baseUrl) {
    super(appKey, appSecret, redirect_uri);
    this.appKey = appKey;
    this.appSecret = appSecret;
    this.redirect_uri = redirect_uri;
    this.baseUrl=baseUrl;
    // this.store = {};
    this.clientTokens={};
    this.clientTokensExpire={start:null,end:null};
  }
  on(eventType, callback) {
    if (!eventType || typeof callback !== 'function') {
      return;
    }
    if (Oauth2.supportEvents.indexOf(eventType) !== -1) {
      //is supported event;
      super.on(eventType, callback);
    } else {
      utils.debug('event')(`${eventType} is not supported event`);
    }
  }
  connectByRefresh(refreshToken) {
    /* 
        (refreshToken:string):Promise
    */
    return new Promise((resolve, reject) => {
      // let newConnection = new UserToken(this);
      let newConnection = createUser(configNewUser,this)();

      newConnection
        .requestTokensByRefresh(refreshToken)
        .then(() => {
          resolve(newConnection);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  connectByCode(code) {
    return new Promise((resolve, reject) => {
      // let newConnection = new UserToken(this);
      let newConnection=createUser(configNewUser,this)();
      newConnection
        .requestTokens(code)
        .then(() => {
          resolve(newConnection);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  connectByTokens(tokens) {
    // let newConnection = new UserToken(this);
    let newConnection=createUser(configNewUser,this)();
    newConnection.setTokens(tokens);
    return newConnection;
  }
  connect() {
    /* 
    ():UserToken
    */
    return createUser(configNewUser,this)();
    // return new UserToken(this);
  }
}



Oauth2.supportEvents = ['tokens', 'clientTokens', 'error'];

export default Oauth2;
