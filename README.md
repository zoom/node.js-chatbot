# Zoom Node.js Chatbot Library

The Zoom Node.js Chatbot Library wraps the OAuth2, sending messages,request zoom openapi, and receiving commands/actions functionality into easy to use functions you can import in your Node.js app.

## Installation

To get started install the [@zoomus/chatbot](https://www.npmjs.com/package/@zoomus/chatbot) 

`$ npm install @zoomus/chatbot --save`


## Example

1. Add your [Chatbot API credentials](https://marketplace.zoom.us/docs/guides/getting-started/app-types/create-chatbot-app) to the `oauth2` and `client` functions.
2. Add a help command to let users know how to use your app.
3. Bind zoom webhook
4. If you need to request zoom openapi,bind zoom oauth2


#### Initialize zoomapp, bind help command

```javascript

const { oauth2, client } = require('@zoomus/chatbot');

const oauth2Client = oauth2('{{ CLIENT_ID }}', '{{ CLIENT_SECRET }}','{{REDIRECT_URI}}');

//SLASH_COMMAND 
let chatbot = client('{{ CLIENT_ID }}', '{{ VERIFICATION_TOKEN }}', '{{ BOT_JID }}')
.commands([{ command: '{{ SLASH_COMMAND }}', hint: '<command parameter>', description: 'This is what my chatbot does' }])
.configurate({ help: true, errorHelp: false })
.defaultAuth(oauth2Client.connect());

```

#### Bind webhook(express example)


```javascript

let middleZoomWebhook=async function(req,res,next){
      let {body,headers}=req;
      try{
          let wehookData = await chatbot.handle({ body, headers });
          //create a app instance
          let zoomApp = chatbot.create({ auth: oauth2Client.connect()});
          res.locals.zoomApp = zoomApp;
          res.locals.wehookData = wehookData;
          next();
      }
      catch(e){
       //handle error
      }
};

app.post('/webhook',
  middleZoomWebhook,
  async function(req,res){
      let {zoomApp, wehookData}=res.locals;
      let { payload,data,type,command,message } = wehookData;
      let { toJid: to_jid,command,data, userId, accountId: account_id, channelName,name } = payload;
      try{
        await zoomApp.sendMessage({
          to_jid,account_id,content:{body:{type:'message',text:'example body'},header:{text:'example header'}}
        });
      }
      catch(e){
        //handle error
      }
      res.send('');
  });

```


#### Authorization && request openapi (express example)

After you [install and authorize](https://marketplace.zoom.us/docs/guides/getting-started/app-types/create-chatbot-app#local-testing) your app, you will be taken to your [redirect url](https://marketplace.zoom.us/docs/guides/getting-started/app-types/create-chatbot-app#credentials). Add this code to handle the redirect.

> Make sure your Redirect URL in your Zoom App Dashboard has the `/authorize` path so it matches with this rout\

```javascript

let middleZoomAuth=async function(req,res,next){
      let {code}=req.query;
      try{
        let connection=await oauth2Client.connectByCode(code);
        let zoomApp=chatbot.create({auth:connection});
        res.locals.zoomApp=zoomApp;
        next();
      }
      catch(e){
        // error handle
      }
};

app.post('/auth',
  middleZoomAuth,
  async function(req,res){
      let { zoomApp } = res.locals;
      let tokens = zoomApp.auth.getTokens();
      try{
        //save tokens to db
        //request openapi meetings
        let meetings=await zoomApp.request({
          url:'/v2/users/userid/meetings',
          method:'post',
          body:{
            topic:'my meeting',
            type:2,
            settings:{
              host_video: true,
              participant_video: true
            }
          }
        });
        //handle other logic
      }
      catch(e){
        //error handle
      }
  });

```


## Commands and Actions

To capture requests sent to our Bot endpoint URL, setup an express route that matches the path on our Bot endpoint URL.

**Commands** are [slash commands](https://marketplace.zoom.us/docs/guides/chatbots/sending-messages#receive) a user types in Zoom Chat to interact with your Chatbot.

**Actions** are user interaction events with the [Editable Text](https://marketplace.zoom.us/docs/guides/chatbots/customizing-messages/message-with-editable-text), [Form Field](https://marketplace.zoom.us/docs/guides/chatbots/customizing-messages/message-with-form-field), [Dropdown](https://marketplace.zoom.us/docs/guides/chatbots/customizing-messages/message-with-dropdown), or [Buttons](https://marketplace.zoom.us/docs/guides/chatbots/customizing-messages/message-with-buttons) message types in Zoom Chat.



### Commands and Actions api

Payload api please see [https://marketplace.zoom.us/docs/guides/chatbots/sending-messages](https://marketplace.zoom.us/docs/guides/chatbots/sending-messages)

```javascript

  //notification webhookData

  Interface WehookData{
      type:string;//value:one||group, group which said message is from Zoom IM Channel,one which said message is from your app chat
      payload:Payload;
      message:string;//origin content from ZOOM IM ,just like 'config project 2019-08-08'
      data:Array<string>;//just like ['project','2019-08-08']
      command:string;//command name,just like config
   }


  //action webhookData
 Interface WebhookData{
      type:string;//value:one||group, group which said message is from Zoom IM Channel,one which said message is from your app chat
      payload:Payload;
   }

```


## api


#### sendmessage

```javascript

  let zoomApp = chatbot.create({ auth: oauth2Client.connect()});
  let backMessage=await zoomApp.sendMessage({
    to_jid:String,
    account_id:String,
    content:{
      body:Object,
      header:Object
    }
  });

```


#### Request Zoom openapi which on need to handle oauth

```javascript
 let zoomApp=chatbot.create({auth:connection});
 //meeting openapi example
 let meetings=await zoomApp.request({
          url:'/v2/users/userid/meetings',
          method:'post',
          body:{
            topic:'my meeting',
            type:2,
            settings:{
              host_video: true,
              participant_video: true
            }
        }
  });

```

#### when oauth2 access_token is out date

```javascript

zoomApp.auth.callbackRefreshTokens(function(tokens){
  //this tokens is the new access_token info which request by refresh token
});

```

#### set tokens from database

```javascript

zoomApp.auth.setTokens({
        access_token,
        refresh_token,
        expires_in
});

```

#### Retry action if some request is error

```javascript

let {setting}=require('@zoomus/chatbot');
//this will try to sendMessage again if get last request error(code 7010)
setting.retry({
  // request:{}
  sendMessage:{
    no:3,
    timeout(no,lg){return Math.random() * (10000 - 5000) + 5000;},
    condition(backMsg,ind){//backMsg is https response message,ind is the retry no
      if(typeof backMsg==='object'&&backMsg.code&&backMsg.code.toString()==='7010'){
          return true;
        }
    }
});

```

#### debug http

```javascript

setting.debug(true);
DEBUG=http node index.js //now only support http debug

```



## Need Support?
The first place to look for help is on our [Developer Forum](https://devforum.zoom.us/), where Zoom Marketplace Developers can ask questions for public answers.

If you can’t find the answer in the Developer Forum or your request requires sensitive information to be relayed, please email us at developersupport@zoom.us.
