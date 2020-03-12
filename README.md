# Zoom Node.js Chatbot Library

The Zoom Node.js Chatbot Library wraps OAuth2, receiving slash commands and user actions, sending messages, and making requests to the Zoom API into easy to use functions you can import in your Node.js app.

## Installation

To get started install the [@zoomus/chatbot](https://www.npmjs.com/package/@zoomus/chatbot) NPM package.

```
$ npm install @zoomus/chatbot --save
const {  oauth2, client, setting, log,request } = require('@zoomus/chatbot');
```

### 1. **Zoom OAuth2 Credentials Flow(prepare for request zoom openapi)**

use zoom oauth2 to request zoom openapi simple

use expires_date to auto check expired time,and auto use refresh_token to request access_token

use *let userInfo = await zoomApp.request({url:'/v2/users/me', method:'get'}); console.log(userInfo)* can get zoom account_id,jid and others information.(origin jwt.decode not useful again)


**First install ZOOM bot app**
```js
const { oauth2, client, setting, log } = require('@zoomus/chatbot');
const oauth2Client = oauth2( '{{ CLIENT_ID }}', '{{ CLIENT_SECRET }}', '{{ REDIRECT_URI }}' );
let chatbot = client( '{{ CLIENT_ID }}', '{{ VERIFICATION_TOKEN }}', '{{ BOT_JID }}' ).defaultAuth(oauth2Client.connect());

let middleZoomAuth = async (req, res, next) => {
  let { code } = req.query;
  try {
    let connection = await oauth2Client.connectByCode(code);
    let zoomApp = chatbot.create({ auth: connection }); //this is the first store tokens,zoomApp have already inject tokens by connection.you can use zoomApp to request zoom openapi
    res.locals.zoomApp = zoomApp;
    next();
  } catch (error) {
    console.log(error);
    res.send(error);
  }
};

app.get('/authorize', middleZoomAuth, async (req, res) => {
  res.send('Thanks for installing!');
  let { zoomApp } = res.locals;
  let tokens = zoomApp.auth.getTokens();
  // save tokens to db
  // db.set('access_token',tokens.access_token);
  // db.set('refresh_token',tokens.refresh_token);
  // db.set('expires_date': moment().add( tokens.expires_in, 'seconds' ).format()');
  // sendMessage to zoom
  await zoomApp.sendMessage({...});
  // request openapi of zoom
  await zoomApp.request({url:'/v2/users/me', method:'get'});
});
```

### 2. **SendMessage ZOOM IM Chat Message**

**Get zoom channel/bot webhook message,and sendmessage to feedback channel/bot**

```js
const {  oauth2, client, setting, log } = require('@zoomus/chatbot');
const oauth2Client = oauth2( '{{ CLIENT_ID }}', '{{ CLIENT_SECRET }}', '{{ REDIRECT_URI }}' );
let chatbot = client('{{ CLIENT_ID }}', '{{ VERIFICATION_TOKEN }}', '{{ BOT_JID }}').defaultAuth(oauth2Client.connect());
app.post('/webhook',async function(req,res){
  try{
        let data = await chatbot.handle({ body, headers });
        let { event, command?,type, payload } = data;
        let { toJid, userJid, accountId } = payload;
        let zoomApp = chatbot.create();
        await zoomApp.sendMessage({
            //is_visible_you: true|false,//only the userid user can see the message
            //user_jid:userJid//which user can see this message
            to_jid: toJid,
            account_id:accountId,
            content: {
              head: {
                 text: 'Hello World'
               }
            }
        });
  }
  catch(e){
    //
  }
}

```




### 3. **Get ZOOM IM chat message**

handle ZOOM IM chat webhook message,message have two sources, one is 'channel',another is 'bot'.And message have two types,one is 'slash',another is 'action'

payload details please see zoom [zoom message-with-dropdown dropdown example](https://marketplace.zoom.us/docs/guides/chatbots/customizing-messages/message-with-dropdown)

we have slash event = 'bot_notification';

we have action event,'interactive_message_select','interactive_message_actions','interactive_message_editable','interactive_message_fields_editable'

```js
const {  oauth2, client, setting, log } = require('@zoomus/chatbot');
const oauth2Client = oauth2( '{{ CLIENT_ID }}', '{{ CLIENT_SECRET }}', '{{ REDIRECT_URI }}' );
let chatbot = client('{{ CLIENT_ID }}', '{{ VERIFICATION_TOKEN }}', '{{ BOT_JID }}').defaultAuth(oauth2Client.connect());
app.post('/webhook',async function(req,res){
      try{
        let data = await chatbot.handle({ body, headers });
        //if this is slash from zoom IM,just like /help,command will be help,action will not have this option.
        //type 'channel'|'bot', channel express this message from IM channel,bot express this message from the bot which you installed
        let { event, command?,type, payload } = data;
        //do the business logic 
      }
      catch(e){
        //
      }
});

```


### 4. **Request Zoom Open Api and Refreshing the Access Token(must do oauth2 first)**

If the access_token is expired, this function will request a new access_token, so you can update the tokens in your `zoomApp` instance and database.

**auth get expired access_token from refresh_token**

```js
const {  oauth2, client, setting, log } = require('@zoomus/chatbot');
const oauth2Client = oauth2( '{{ CLIENT_ID }}', '{{ CLIENT_SECRET }}', '{{ REDIRECT_URI }}' );
let chatbot = client('{{ CLIENT_ID }}', '{{ VERIFICATION_TOKEN }}', '{{ BOT_JID }}').defaultAuth(oauth2Client.connect());
//see OAuth2 Credentials Flow for zoomApp
let zoomApp = chatbot.create();//zoomApp.auth is same with connection variable
zoomApp.auth.setTokens({//get tokens from database and set into zoomApp
        access_token: database.get('access_token'),
        refresh_token: database.get('refresh_token'),
        expires_date: database.get('expires_date')
});
// When request v2/users/me fail by accesstoken expired
//Library will auto use refresh_token for request access_token. 
//After that, this function will be called,you can save new access_token in database. 
//Then will auto call request /v2/users/me again
zoomApp.auth.callbackRefreshTokens((tokens,error) => {
      if(error){
        //try use refresh token to get access_token,but also fail,refresh token is invalid
      }
      else{
        try {
          await database.update({
             id:'id',
             access_token:tokens.access_token
             refresh_token:tokens.refresh_token,
             expires_date: moment().add( tokens.expires_in, 'seconds' ).format()
          });
      } catch (e) {
          console.log(e);
      }
      }
});


await zoomApp.request({url:'/v2/users/me', method:'get'});

// await zoomApp.request({
//         url: `/v2/users/${userId}/meetings`,
//         method: 'post',
//         headers: { 'content-type': 'application/json' },
//         body: {
//           topic: `New topic Meeting`,
//           type: 2,
//           settings: {
//             host_video: true,
//             participant_video: true,
//             join_before_host: true,
//             enforce_login: true,
//             mute_upon_entry: true
//           }
//         }
// });

//await zoomApp.auth.requestTokensByRefresh(refreshToken); for refresh new access_token

```

**auth get new access_token from refresh_token by method**

```js
try{
  await zoomApp.request({url:'/v2/users/me', method:'get'});
}
catch(e){
  //tokens expired
  let newTokens=await zoomApp.auth.requestTokensByRefresh(refreshToken);
  //
}
```

### 5. Log,auto log http&&error from library

we have two type log of info,one is {type:'http',{error,request,response}},another is {type:'error_notice',message:{error}} this error include http error/webhook data error.
you can use request method to auto log http information in custom logic,request({url:'',headers,body,bodyType,method});After request happen,will auto log information in the callback

```js
const { oauth2, client, setting, log,request } = require('@zoomus/chatbot');
log(function(info) {
  console.log(info);
  let { type, message } = info;
  if (type === 'http') {
    let { request, error, response } = message; //response:{status,body},request:{body,url,headers,method}
    //handle log info;
  }
});
```


### 6. **Common request method**

Request is the method which wrap [node-fetch](https://www.npmjs.com/package/node-fetch) and put form-data and form-parameters in simple object

```js
const {request } = require('@zoomus/chatbot');
//application/json type
request({
  url:string,
  method:'post',
  headers:{},
  body:{a:1,b:2}
});

//form x-www-form-urlencoded
request({
  url:string,
  method:'post',
  headers:{},
  body:{a:1,b:2},
  bodyType:'formParameters'
});

//form-data 
request({
  url:string,
  method:'post',
  headers:{},
  body:{a:1,b:2},
  bodyType:'formData'
});

//get query
request({
  url:string,
  method:'get',
  headers:{},
  query:{
    a:1,b:2
  }
});

```

### 7. **case sensitive in zoom IM message,default false**

```js
setting.caseSensitive(false); //in zoom IM ,type help is same with Help
```

## Slash Commands and User Actions

[Slash commands](https://marketplace.zoom.us/docs/guides/chatbots/sending-messages#receive) are what the user types in Zoom Chat to interact with your Chatbot.

[User Actions](https://marketplace.zoom.us/docs/guides/chatbots/sending-messages#user-commands) are user interactions with the [Editable Text](https://marketplace.zoom.us/docs/guides/chatbots/customizing-messages/message-with-editable-text), [Form Field](https://marketplace.zoom.us/docs/guides/chatbots/customizing-messages/message-with-form-field), [Dropdown](https://marketplace.zoom.us/docs/guides/chatbots/customizing-messages/message-with-dropdown), or [Buttons](https://marketplace.zoom.us/docs/guides/chatbots/customizing-messages/message-with-buttons) message types in Zoom Chat.


## Need Support?

The first place to look for help is on our [Developer Forum](https://devforum.zoom.us/), where Zoom Marketplace Developers can ask questions for public answers.

If you can’t find the answer in the Developer Forum or your request requires sensitive information to be relayed, please email us at developersupport@zoom.us.
