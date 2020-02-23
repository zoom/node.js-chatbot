# Zoom Node.js Chatbot Library

The Zoom Node.js Chatbot Library wraps OAuth2, receiving slash commands and user actions, sending messages, and making requests to the Zoom API into easy to use functions you can import in your Node.js app.

## Installation

To get started install the [@zoomus/chatbot](https://www.npmjs.com/package/@zoomus/chatbot) NPM package.

```
$ npm install @zoomus/chatbot --save
const {  oauth2, client, setting, log } = require('@zoomus/chatbot');
```

### Log

```js
const { oauth2, client, setting, log } = require('@zoomus/chatbot');
//we have two type log of info,one is {type:'http',{error,request,response}},another is {type:'error_notice',message:{error}} this error include http error/webhook data error.
log(function(info) {
  let { type, message } = info;
  if (type === 'http') {
    let { request, error, response } = message; //response:{status,body},request:{body,url,headers,method}
    //handle log info;
  }
});
```

### SendMessage Chatbot Message

```js
const { oauth2, client, setting, log } = require('@zoomus/chatbot');
const oauth2Client = oauth2('{{ CLIENT_ID }}', '{{ CLIENT_SECRET }}');
let chatbot = client(
  '{{ CLIENT_ID }}',
  '{{ VERIFICATION_TOKEN }}',
  '{{ BOT_JID }}'
).defaultAuth(oauth2Client.connect());
let zoomApp = chatbot.create();//because we already bind defaultAuth
await zoomApp.sendMessage({
  to_jid: 'to_jid: can get from webhook response or GET /users/{userID}',
  account_id:
    'account_id: can get from webhook response or from JWT parsed access_token or GET /users/{userID}',
  content: {
    head: {
      text: 'Hello World'
    }
  }
});
```

### Get ZOOM IM channel message

```js
const {  oauth2, client, setting, log } = require('@zoomus/chatbot');
let chatbot = client('{{ CLIENT_ID }}', '{{ VERIFICATION_TOKEN }}', '{{ BOT_JID }}')
.defaultAuth(oauth2Client.connect());
app.post('/webhook',async function(req,res){
      try{
        let data = await chatbot.handle({ body, headers });
        let { event, command?,type, payload } = data;//if this is slash from zoom im,just like /help,command will be help
        // we have type 'channel'|'bot', channel express this message from IM channel,bot express this message from the bot which you installed
        //payload details please see zoom https://marketplace.zoom.us/docs/guides/chatbots/customizing-messages/message-with-dropdown
        //we have slash  event = 'bot_notification';
        // we have action event = 'interactive_message_select'|'interactive_message_actions'|'interactive_message_editable'|'interactive_message_fields_editable'
      }
      catch(e){
        //
      }
});

```

### OAuth2 Credentials Flow(prepare for request zoom openapi)

```js
const { oauth2, client, setting, log } = require('@zoomus/chatbot');
const oauth2Client = oauth2(
  '{{ CLIENT_ID }}',
  '{{ CLIENT_SECRET }}',
  '{{ REDIRECT_URI }}'
);
let chatbot = client(
  '{{ CLIENT_ID }}',
  '{{ VERIFICATION_TOKEN }}',
  '{{ BOT_JID }}'
).defaultAuth(oauth2Client.connect());

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
  // db.set('access_token');
  // db.set('refresh_token');
  // db.set('expires_in');
});
```

#### Request Zoom Open Api and Refreshing the Access Token(must do oauth2 first)

If the access_token is expired, this function will request a new access_token, so you can update the tokens in your `zoomApp` instance and database.

```js

//see OAuth2 Credentials Flow for zoomApp
let zoomApp = chatbot.create({ auth:connection });//zoomApp.auth is same with connection variable
zoomApp.auth.setTokens({//get tokens from database and set into zoomApp
        access_token: database.get('zoom_access_token'),
        refresh_token: database.get('zoom_refresh_token'),
        expires_date: database.get('zoom_access_token_expire_time')
});
zoomApp.auth.callbackRefreshTokens((tokens,error) => {// when request v2/users/me fail by accesstoken expired,library will auto use refresh_token for request access_token. After that, this function will be called,you can save new access_token in database. and then will auto call request /v2/users/me again
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

//you can also catch the request error,and refresh access_token by your self.
// await zoomApp.auth.requestTokensByRefresh(refreshToken); for refresh new access_token
//this library use node-fetch library to http request
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

```

### case sensitive in zoom IM message,default false

```js
setting.caseSensitive(false); //in zoom IM ,type help is same with Help
```

## Slash Commands and User Actions

[Slash commands](https://marketplace.zoom.us/docs/guides/chatbots/sending-messages#receive) are what the user types in Zoom Chat to interact with your Chatbot.

[User Actions](https://marketplace.zoom.us/docs/guides/chatbots/sending-messages#user-commands) are user interactions with the [Editable Text](https://marketplace.zoom.us/docs/guides/chatbots/customizing-messages/message-with-editable-text), [Form Field](https://marketplace.zoom.us/docs/guides/chatbots/customizing-messages/message-with-form-field), [Dropdown](https://marketplace.zoom.us/docs/guides/chatbots/customizing-messages/message-with-dropdown), or [Buttons](https://marketplace.zoom.us/docs/guides/chatbots/customizing-messages/message-with-buttons) message types in Zoom Chat.

## Need Support?

The first place to look for help is on our [Developer Forum](https://devforum.zoom.us/), where Zoom Marketplace Developers can ask questions for public answers.

If you can’t find the answer in the Developer Forum or your request requires sensitive information to be relayed, please email us at developersupport@zoom.us.
