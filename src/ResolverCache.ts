import {createClient} from 'redis'
import { RedisClientType } from '@redis/client';


//creates an importable ResolverCache Class that connects to the user's local Redis client or provided Redis client 
export class ResolverCache {
    client: RedisClientType
    constructor(host?:string, port?: number, password?: string){
        if(host && port && password){
            this.client = createClient({
             socket: {
                 host,port
             },
             password
         })
         }else if(host && port){
         this.client = createClient({
             socket: {
                 host,port
             }})
         }else{
             this.client = createClient()
         }
        this.checkCache = this.checkCache.bind(this)
        this.client.connect()
            .then(() => console.log('connected to redis instance'))
            .catch((err) => console.log(`there was a problem connecting to the redis instance: ${err}`))

    }

    //all instances of ResolverCache have access to the checkCache method which checks the user's cache
    //if the key already exists in the cache, the result is returned from the user's cache
    //if not, it is added to the cache with the corresponding result 
    async checkCache (parent: any, args: any, context: any, info: {returnType: any}, callback:any){
        const key = makeKey(info, args)
        const isInCache = await this.client.EXISTS(key)
        if (isInCache){
            const returnObj = await this.client.GET(key);
            if (typeof returnObj === 'string'){
                const returnObjParsed = JSON.parse(returnObj);
                return returnObjParsed
            } 
        }else{
            const returnObj = callback(args)
            await this.client.SET(key, JSON.stringify(returnObj));
            return returnObj
        }
    }
}

//creates a key that will be the fieldName concatenated with the argument id
export function makeKey (info:any, args:any){
    let key = '';
    if (Object.keys(args).length === 0) key = info.returnType;
    else key = String(info.returnType) + String(args.id);
    return key
}

