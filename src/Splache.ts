import { Request, Response, NextFunction } from 'express';
import { createClient, RedisClientType } from 'redis';
import { parse, visit, GraphQLSchema, graphql } from 'graphql';

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

//--------------------------------------------------

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

//--------------------------------------------------

export class SplacheCache {
    schema: GraphQLSchema;
    client: RedisClientType;
    constructor(
      schema: GraphQLSchema,
      host?: string,
      port?: number,
      password?: string
    ) {
      this.schema = schema;
      this.GQLquery = this.GQLquery.bind(this);
      if (host && port && password) {
        this.client = createClient({
          socket: {
            host,
            port,
          },
          password,
        });
      } else if (host && port) {
        this.client = createClient({
          socket: {
            host,
            port,
          },
        });
      } else {
        this.client = createClient();
      }
      this.client.connect()
      .then(() => console.log('connected to redis'))
      .catch((err) => console.log(`there was a problem connecting to the redis instance: ${err}`))
    }
    //Partial normalization of the input query through traversing the GraphQL AST to build valid root queries. 
    //The root queries are checked against the Redis cache as opposed to the original query
    async GQLquery(req: any, res: any, next: any) {
      const queryString: string = req.body.query;
      const ast = parse(queryString);
      const [template, fieldArgs] = await makeTemplate(ast);
      const splitQuery = qlStrGen(template, fieldArgs);
      const compiledObj: any = { data: {} };
      for (const query of splitQuery) {
        const isInCache = await this.client.EXISTS(query);
        if (isInCache) {
          const returnObj = await this.client.GET(query);
          if (typeof returnObj === 'string') {
            const returnObjParsed = JSON.parse(returnObj);
            compiledObj.data[Object.keys(returnObjParsed.data)[0]] =
              returnObjParsed.data[Object.keys(returnObjParsed.data)[0]];
          } else {
            return next({ err: 'There was a redis error' });
          }
        } else {
          await graphql({ schema: this.schema, source: query })
            .then((response: any) => {
              compiledObj.data[Object.keys(response.data)[0]] =
                response.data[Object.keys(response.data)[0]];
              this.client.SET(query, JSON.stringify(response));
            })
            .catch((err) => next({ err }));
        }
      }
      res.locals.queryResult = compiledObj;
      return next();
    }
  }
  
  // makeTemplate uses the AST from the GraphQL query as an input
  // The visit function is provided by graphql, check documentation here https://graphql.org/graphql-js/language/#visit
  export async function makeTemplate(ast: any) {
    const template: any = {};
    const path: any = [];
    const fieldInfo: any = {};
    visit(ast, {
      Field: {
        enter(node: any) {
          if (node.arguments) {
            const args: any = {};
            for (let i = 0; i < node.arguments.length; i++) {
              const key = node.arguments[i].name.value;
              args[key] = node.arguments[i].value.value;
            }
            fieldInfo[node.name.value] = { ...args };
          }
  
          path.push(node.name.value);
        },
        leave() {
          path.pop();
        },
      },
      SelectionSet: {
        enter(node: any, key, parent: any) {
          if (parent.kind === 'Field') {
            const fields: any = {};
            for (let i = 0; i < node.selections.length; i++) {
              if (!node.selections[i].selectionSet) {
                fields[node.selections[i].name.value] = true;
              }
            }
            const fieldsObj = {
              ...fields,
              ...fieldInfo[path[path.length - 1]],
            };
            let curr = template;
            for (let i = 0; i < path.length; i++) {
              if (i + 1 === path.length) curr[path[i]] = { ...fieldsObj };
              curr = curr[path[i]];
            }
          }
        },
        leave() {
          path.pop();
        },
      },
    });
    return [template, fieldInfo];
  }
  
  //GQLquery helper functions below
  export function qlStrGen(template: any, fieldArgs: any) {
    const queryStrs: string[] = [];
    for (const prop in template) {
      let queryStr = `query {${prop} ${genArgStr(fieldArgs[prop])} {`;
      queryStr += genfields(template[prop]);
      queryStrs.push((queryStr += '} }'));
    }
    return queryStrs;
  }
  
  export function genArgStr(args: any) {
    if (Object.keys(args)[0] === undefined) return '';
    let argStr = '(';
    for (const arg in args) {
      argStr += `${arg}: "${args[arg]}" `;
    }
    return (argStr += ')');
  }
  
  export function genfields(fields: any) {
    let fieldStr = '';
    for (const field in fields) {
      if (typeof fields[field] === 'object') {
        fieldStr += `${field} {${genfields(fields[field])}} `;
      } else {
        if (field !== 'id') fieldStr += `${field} `;
      }
    }
    return fieldStr;
  }
  

