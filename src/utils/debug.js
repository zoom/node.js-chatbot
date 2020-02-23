import debug from 'debug';
import config from '../services/config';

let debugUtils=(type='work')=>(msg)=>{
    if (config.debug===true){
        let newMsg=msg;
        try{
            if(typeof msg==='object'){
                newMsg=JSON.stringify(msg);
            }
        }
        catch(e){
            newMsg=`can't change debug msg to string`;
        }
        debug(type)(newMsg);
    }
};



export default debugUtils;
