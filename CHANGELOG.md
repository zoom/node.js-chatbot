## 0.0.6

* feature:COMMAND:integrate help command with lib
* feature:CLIENT:client add command Event,and get IM account type,and specific command name

## 0.1.0
* feature:CLIENT:abandon command api(exit,no longer maintained),add commands api,and replace options to hint
* feature:CLIENT:no version api(no longer maintained)
* feature:MESSAGE:listen commands(no command,command exit,no longer maintained),parse command arguments to data,origin data to payload 
* rich readme

## 0.1.2
* feature:CLIENT:add parse method

## 0.1.3
* change readme.md

## 0.1.5
* feature:handle add promise method,you can use handle(opt).then((data)=>{}).catch((e)=>{}),old handle(opt,callback)//also can be used
* feature:add checkCommands,triggerHelp,configurate({help:true,errorHelp:false}),
* feature:add default error trigger help


## 0.1.6
* feature:add debug,add request method

## 0.1.8

* feature: add actions event,more help command style

## 0.1.9
* feature: add messages event which scope > commands,and messages||commands only runs one at a time

## 0.1.10
* feature: readme change

## 0.1.11
* feature: callback error hint in handle callback add type&&errorMessage

## 0.1.12
* change readme

## 0.1.15
* fix lambda stack exit early before event commit

## 0.1.16
* fit to  lambda async step

## 0.1.17
* pre for actions

## 0.2.1
* add settings for sendMessage

## 0.2.2
* add field_edit action type

## 0.2.3
* prototype connect fix

## 0.2.4
* support retry

## 0.2.5
* sendmessage can use content,add expires_date in setTokens

## 0.2.6
* change readme

## 0.2.7
* case sensitive


## 0.2.7
* case sensitive

## 0.2.9
* let sendmessage tranform any paras,and also support body,header single send.

## 0.3.10
* change readme