import { RedisClientType } from "@redis/client";

export async function checkCache (parent: any, args: {id: number}, context: any, info: {returnType: any}, client: RedisClientType, callback:any) {
    const key = String(info.returnType) + String(args.id); //set the key equal to the fieldName concatenated with the argValString
    const isInCache = await client.EXISTS(key)
        if (isInCache){
            const returnObj = await client.GET(key);
            if (typeof returnObj === 'string'){
                const returnObjParsed = JSON.parse(returnObj);
                return returnObjParsed
            } 
        }else{
            const returnObj = callback(args)
            await client.SET(key, JSON.stringify(returnObj));
            return returnObj
        }
}

export async function updateCache (args: {id: number}, info: {returnType: any}, client: RedisClientType, callback:any) {
    const key  = String(info.returnType) + String(args.id);
    const returnObj = callback(args)
    await client.SET(key, JSON.stringify(returnObj));
    return returnObj
}
