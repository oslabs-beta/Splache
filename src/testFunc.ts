async function checkCache (args: object, info: object, client:any, callback:any) {
    // const argKeyArray = Object.keys(args).sort(); //make an array of sorted keys from the args object
    // let argValString = '';
    // for (let i=0; i<argKeyArray.length; i++){
    //     argValString += String(args[argKeyArray[i]]); //for each key in argKeyArray add the value to the arValString
    // }
    
    const key = info.fieldName + String(args.id); //set the key equal to the fieldName concatenated with the argValString
    const isInCache = await client.EXISTS(key)
        if (isInCache){
            const returnObj = await client.GET(key);
            const returnObjParsed = JSON.parse(returnObj);
            console.log('returned from cache')
            return returnObjParsed
        }else{
            const returnObj = callback(args)
            await client.SET(key, JSON.stringify(returnObj));
            return returnObj
        }
}

module.exports.checkCache = checkCache;