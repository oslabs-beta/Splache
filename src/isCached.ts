//import { RedisClientType } from "@redis/client";
import { client } from './index-test.ts';

export async function isCached (req,res,next) {
    console.log('inside isCache')
    const isInCache = await client.EXISTS(res.locals.queryString);
        if (isInCache){
            const returnObj = await client.GET(res.locals.queryString);
            const returnObjParsed = JSON.parse(returnObj);
            console.log('returned from cache')
            res.locals.queryResult = returnObjParsed;
            return next();
        }
        else {
            console.log('query not in cache', req.body); 
        
            await fetch('http://localhost:4000/graphql', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json'
                         },
                body: JSON.stringify(req.body), 
            })
            .then ((data) => data.json())
            .then ((result) => res.locals.queryResult = result);
            console.log(res.locals.queryString, typeof res.locals.queryString);
            console.log(res.locals.queryResult);
            await client.SET(res.locals.queryString, JSON.stringify(res.locals.queryResult));
            //return queried
            return next(); 
        }

}