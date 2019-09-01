// import channelList from '../plugins/channelList';
import sendMessage from '../plugins/sendMessage';
import getUser from '../plugins/getUser';
import request from '../plugins/request';
import error from '../services/error';
import config from '../services/config';
import utils from '../utils/index';


class ClientApp {
    constructor(robot_jid, auth) {
        this.robot_jid = robot_jid;
        this.auth = auth;
    }
    getToken(func, fail,refresh=false) {
        let { auth } = this;
        let expired = auth.expired();
        let tokens = auth.getTokens();
        if (tokens === false) {
            let msg = `don't get tokens before use action`;
            error.code({ type: 'code', message: msg });
            fail(msg);
            return;
        }
        let { refresh_token, access_token } = tokens;
        if (expired === true||refresh===true) {
            auth
                .requestTokensByRefresh(refresh_token)
                .then(newTokens => {
                    func(newTokens.access_token);
                })
                .catch(err => {
                    fail(err);
                });
        } else {
            func(access_token);
        }
    }
    getClientToken(func, fail,refresh=false) {
        let { auth } = this;
        let expired = auth.expiredClient();
        let clientTokens = auth.getClientTokens();
        if (clientTokens === false||refresh===true) {
            auth
                .requestClientTokens()
                .then(newClientTokens => {
                    func(newClientTokens.access_token);
                })
                .catch(err => {
                    fail(err);
                });
            return;
        }
        let { access_token } = clientTokens;
        if (expired === true) {
            auth
                .requestClientTokens()
                .then(newClientTokens => {
                    func(newClientTokens.access_token);
                })
                .catch(err => {
                    fail(err);
                });
        } else {
            func(access_token);
        }
    }
    request(option,type){
        return this._action([option,type],'request');
    }
    _request(opt,type='access',refresh=false) {
        
        if(typeof opt!=='object'){
            throw new error.ParamError(`${opt} must be object`);
            // return;
        }
        return new Promise((resolve, reject) => {
            if (type === 'access') {
                type = 'getToken';
            }
            else if (type === 'credential') {
                type = 'getClientToken';
            }
            else {
                reject(`param type must be access or credential`);
                return;
            }
            this[type](
              access_token => {
                request(access_token, opt)
                  .then(data => {
                    resolve(data);
                  })
                  .catch(err => {
                    reject(err);
                  });
              },
              err => {
                error.action({ type: 'action', message: err });
                reject(err);
              },
              refresh
            );
        });
    }
    getUser(email){
        return this._action([email],'getUser');
    }
    _getUser(email,refresh=false) {
        return new Promise((resolve, reject) => {
            this.getToken(
                access_token => {
                    getUser(access_token, email)
                        .then(data => {
                            resolve(data);
                        })
                        .catch(err => {
                            reject(err);
                        });
                },
                err => {
                    error.action({ type: 'action', message: err });
                    reject(err);
                },
                refresh
            );
        });
    }
    ifRetry(functionName){
        if(!functionName){return false;}
        let retry=config.retry;
        if((typeof retry==='object')&&(functionName in retry)){
            let info=retry[functionName];
            if(typeof info==='object'&&typeof info.no==='number'&&typeof info.condition==='function'){
                if(info.no>0){
                    return true;
                }
            }
        }
        return false;
    }
    sendMessage(option){
      return this._action([option],'sendMessage');
    }
    _sendMessage(option,refresh=false) {//user_id will more speed
        return new Promise((resolve, reject) => {
            this.getClientToken(
                access_token => {
                    let { robot_jid } = this;
                    // let { body, header, account_id, to_jid,settings,content} = option;

                    sendMessage(access_token,robot_jid,option)
                        .then(data => {
                            resolve(data);
                        })
                        .catch(err => {
                            reject(err);
                        });
                },
                err => {
                    error.action({ type: 'action', message: err });
                    reject(err);
                },
                refresh
            );
        });
        // return sendMessage(userId,to_jid,body,header)
    }
    _action(args,functionName){
        let ifRetry=this.ifRetry(functionName);
        if(ifRetry===true){//go retry
            let retryInfo=config.retry[functionName];
            let {no,condition,timeout}=retryInfo;
            return utils.loop((...newArgs)=>{
                return this['_'+functionName](...newArgs);
            },[...args],[...args,true],condition,no,timeout);
        }
        else{
            return this['_'+functionName](...args);
        }
    }
    // channelList(userId){
    //     return this._action([userId],'channelList');
    // }
    // _channelList(userId,refresh=false) {
    //     return new Promise((resolve, reject) => {
    //         this.getToken(
    //             access_token => {
    //                 channelList(access_token, userId)
    //                     .then(data => {
    //                         resolve(data);
    //                     })
    //                     .catch(err => {
    //                         reject(err);
    //                     });
    //             },
    //             err => {
    //                 error.action({ type: 'action', message: err });
    //                 reject(err);
    //             },
    //             refresh
    //         );
    //     });
    // }
    clear() {
        this.auth = null;
    }
}

export default ClientApp;