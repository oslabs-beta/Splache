import {createClient} from 'redis'
import { RedisClientType } from '@redis/client';
import {graphql, GraphQLSchema} from 'graphql'
import {Request, Response, NextFunction} from 'express'

export class SplacheCacheWhole {

    schema: GraphQLSchema
    client: RedisClientType
    constructor(schema: GraphQLSchema){

        this.schema = schema;
        this.client = createClient()
        this.wholeCache = this.wholeCache.bind(this)
        this.client.connect()
            .then(() => console.log('connected to redis instance'))

    }

    async wholeCache (req: Partial<Request>, res: any, next: NextFunction) {

        const queryString : string = req.body.query;
        const isInCache = await this.client.EXISTS(queryString);
        if (isInCache){
            const returnObj = await this.client.GET(queryString);
            if (typeof returnObj === 'string'){
                const returnObjParsed = JSON.parse(returnObj);
                res.locals.queryResult = returnObjParsed;
                return next(); 
            }
            else{
                return next({err: 'There was a redis error'})
            }
        }else{
            graphql({ schema: this.schema, source: queryString})
                .then((response) => {
                    this.client.SET(queryString, JSON.stringify(response))
                    res.locals.queryResult = response;
                    return next();
                })
                .catch((err) => next({err})) //clean up error handling.
        }
    }
}