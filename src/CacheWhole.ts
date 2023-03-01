import { createClient } from 'redis';
import { graphql, GraphQLSchema } from 'graphql';
import { RedisClientType } from '@redis/client';
import { Request, Response, NextFunction } from 'express';

//creates an importable SplacheCacheWhole Class that accepts a graphQL schema and connects to the user's local Redis client or provided Redis client
export class SplacheCacheWhole {

    schema: GraphQLSchema
    client: RedisClientType

    constructor(schema: GraphQLSchema, host?: string, port?: number, password?: string ){

        this.schema = schema;
        if(host && port && password){
            this.client = createClient({
             socket: {
                 host, port
             },
             password
         })
         } else if(host && port){
         this.client = createClient({
             socket: {
                 host, port
             }})
         } else{
             this.client = createClient()
         }
        this.wholeCache = this.wholeCache.bind(this)
        this.client.connect()
            .then(() => console.log('connected to redis instance'))
            .catch((err) => console.log(`there was a problem connecting to the redis instance: ${err}`));
    }

    //The method wholeCache is an express middleware function, it examines if queries coming from the request body already exists in the cache
    async wholeCache (req: Request, res: Response, next: NextFunction) {
        const queryString : string = req.body.query;
        const isInCache = await this.client.EXISTS(queryString);
        if (isInCache){
            const returnObj = await this.client.GET(queryString);
            if (typeof returnObj === 'string'){
                const returnObjParsed = JSON.parse(returnObj);
                res.locals.queryResult = returnObjParsed;
                return next(); 
            }
            else {
                return next({err: 'There was a redis error'})
            }
        } else {
            graphql({ schema: this.schema, source: queryString})
                .then((response) => {
                    this.client.SET(queryString, JSON.stringify(response))
                    res.locals.queryResult = response;
                    return next();
                })
                .catch((err) => next({err}));
        }
    }
}