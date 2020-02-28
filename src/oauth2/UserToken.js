

import utils from '../utils/index';
import oauth2 from '../plugins/oauth2';
import refreshTokenFunc from '../plugins/refreshToken';
import clientTokenFunc from '../plugins/clientToken';
// import  from 'fs';
import addSeconds from 'date-fns/add_seconds';
import isAfter from 'date-fns/is_after';
import error from '../services/error';


class UserToken extends utils.Event{
    constructor(...props){
        super(...props);
    }
    requestTokensByRefresh(refreshToken){//refreshToken is optional
      if(!refreshToken){
        let tokens=this.getTokens();
        if(typeof tokens==='object'){
          refreshToken = tokens.refresh_token;
        }
      }
    //   let { connect } = this;
    //   if (!connect || !refreshToken) {
    //     return;
    //   }
      let { appKey, appSecret ,refreshTokenCallback} = this;
      return new Promise((resolve, reject) => {
        refreshTokenFunc(appKey, appSecret, refreshToken)
          .then(async (tokens) => {
            let out = this.setTokens(tokens);
            try{
              if((typeof refreshTokenCallback==='function')&&(typeof out==='object')){
                await refreshTokenCallback(Object.assign({},out));
              }
              await this.trigger('tokens', out);
            }
            catch(e){
              //
            }
            resolve(out);
          })
          .catch(async (err) => {
            try{
              if(typeof refreshTokenCallback==='function'){
                await refreshTokenCallback(null,err);
              }
              await this.trigger('error', error.token(err));
            }
            catch(e){
              //
            }
            reject(err);
          });
      });
    }
    // parseCode(code){
    //     if(typeof code!=='string'){return;}
    //     let userIdIndex=code.indexOf('_');
    //     if(userIdIndex!==-1){
    //         let userId=code.slice(userIdIndex+1);
    //         this.userId=userId;
    //     }
    //     return;
    // }
    requestTokens(code) {
    //   let { connect } = this;
    //   if (!connect || !code) {
    //     return;
    //   }
      let { appKey, appSecret, redirect_uri,tokenCallback,baseUrl } = this;
      return new Promise((resolve, reject) => {
        // this.parseCode(code);
        oauth2(appKey, appSecret, redirect_uri, code,baseUrl)
          .then(async (tokens) => {
            let out = this.setTokens(tokens);
            try{
              if((typeof tokenCallback==='function')&&(typeof out==='object')){
                await tokenCallback(Object.assign({},out));
              }
              await this.trigger('tokens', out);
            }
            catch(e){
              //
            }
            
            resolve(out);
          })
          .catch(async (err) => {
            try{
              await this.trigger('error', error.token(err));
            }
            catch(e){
              //
            }
            
            reject(err);
          });
      });
    }
    requestClientTokens() {
    //   let { connect } = this;
    //   if (!connect) {
    //     return;
    //   } //unbind connect

      let { appKey, appSecret } = this;
      return new Promise((resolve, reject) => {
        clientTokenFunc(appKey, appSecret)
          .then(async (tokens) => {
            // let out = (this.clientTokens = Object.assign(
            //   this.clientTokens,
            //   tokens
            // ));
            let out=this.setClientTokens(tokens);
            try{
              await this.trigger('clientTokens', out);
            }
            catch(e){
              //
            }
            
            resolve(out);
          })
          .catch(async (err) => {
            try{
              await this.trigger('error', error.token(err));
            }
            catch(e){
              //
            }
            
            reject(err);
          });
      });
    }
    expiredClient() {
      let date = new Date();
      let {clientTokensExpire}=this;
      if (clientTokensExpire.end) {
        return isAfter(date, clientTokensExpire.end);
      } else {
        return false; //if not expire_end, also return false
      }
    }
    expired(expiredDate) {
      let date = new Date();
      let {tokensExpire}=this;
      let tokenEnd=expiredDate||tokensExpire.end;
      if (tokenEnd) {
        let judge;
        try{
          judge=isAfter(date, tokenEnd);
        }
        catch(e){
          return false;
        }
        return judge;
      } else {
        return false; //if not expire_end, also return false
      }
    }
    setClientTokens(clientTokens) {
      // this.clientTokens = Object.assign(this.clientTokens, tokens);
      // clientTokens=this.clientTokens = Object.assign(this.clientTokens, clientTokens);
      for(let key in clientTokens){
        this.clientTokens[key]=clientTokens[key];
      }
      let { expires_in } = clientTokens;
      let {clientTokensExpire}=this;
      if (expires_in) {
        let da = (clientTokensExpire.start = new Date());
        clientTokensExpire.end = addSeconds(da, Math.floor((expires_in*2)/3));
      }
      return clientTokens;
    }
    setTokens(tokens) {
      /* 
      Interface Tokens{
        access_token?:string;
        refresh_token?:string;
        expi
      }
      */
      tokens=this.tokens = Object.assign(this.tokens, tokens);
      let { expires_in,expires_date } = tokens;
      let {tokensExpire}=this;
      if(expires_date){
        tokensExpire.start = new Date();
        tokensExpire.end=expires_date;
      }
      else if (expires_in) {
        let da = (tokensExpire.start = new Date());
        tokensExpire.end = addSeconds(da,  Math.floor((expires_in*3)/4));
      }
      return tokens;
    }
    callbackNewTokens(callback){
      if(typeof callback==='function'){
        this.tokenCallback=callback;
      }
      return this;
    }
    callbackRefreshTokens(callback){
      if(typeof callback==='function'){
        this.refreshTokenCallback=callback;
      }
      return this;
    }
    getClientTokens() {
      //not to others
      let clientTokens = this.clientTokens;
      if (clientTokens&&clientTokens.access_token) {
        return clientTokens;
      } else {
        return false;
      }
    }
    getTokens() {
      //not to others
      let tokens = this.tokens;
      if (tokens&&tokens.access_token) {
        return tokens;
      }
      return false;
    }
    clear() {
      this.connect = null;//keep for old version
    }
  }
  

export default UserToken;