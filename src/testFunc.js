async function checkCache (args, info, client, callback) {
    let argKeyArray = Object.keys(args).sort(); //make an array of sorted keys from the args object
    let argValString = '';
    for (let i=0; i<argKeyArray.length; i++){
        argValString += String(args[argKeyArray[i]]); //for each key in argKeyArray add the value to the arValString
    }
    let key = info.fieldName + argValString; //set the key equal to the fieldName concatenated with the argValString
    let isInCache = await client.EXISTS(key)
        if (isInCache){
            let returnObj = await client.GET(key);
            let returnObjParsed = JSON.parse(returnObj);
            console.log('returned from cache')
            return returnObjParsed
        }else{
            let returnObj = callback(args)
            await client.SET(key, JSON.stringify(returnObj));
            return returnObj
        }
}

module.exports.checkCache = checkCache;