"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.genfields = exports.genArgStr = exports.qlStrGen = exports.makeTemplate = exports.SplacheCache = exports.SplacheCacheWhole = exports.makeKey = exports.ResolverCache = void 0;
const redis_1 = require("redis");
const graphql_1 = require("graphql");
//creates an importable ResolverCache Class that connects to the user's local Redis client or provided Redis client 
class ResolverCache {
    constructor(host, port, password) {
        if (host && port && password) {
            this.client = (0, redis_1.createClient)({
                socket: {
                    host, port
                },
                password
            });
        }
        else if (host && port) {
            this.client = (0, redis_1.createClient)({
                socket: {
                    host, port
                }
            });
        }
        else {
            this.client = (0, redis_1.createClient)();
        }
        this.checkCache = this.checkCache.bind(this);
        this.client.connect()
            .then(() => console.log('connected to redis instance'))
            .catch((err) => console.log(`there was a problem connecting to the redis instance: ${err}`));
    }
    //all instances of ResolverCache have access to the checkCache method which checks the user's cache
    //if the key already exists in the cache, the result is returned from the user's cache
    //if not, it is added to the cache with the corresponding result 
    checkCache(parent, args, context, info, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = makeKey(info, args);
            const isInCache = yield this.client.EXISTS(key);
            if (isInCache) {
                const returnObj = yield this.client.GET(key);
                if (typeof returnObj === 'string') {
                    const returnObjParsed = JSON.parse(returnObj);
                    return returnObjParsed;
                }
            }
            else {
                const returnObj = callback(args);
                yield this.client.SET(key, JSON.stringify(returnObj));
                return returnObj;
            }
        });
    }
    //used with mutations that need to update existing information in cache
    updateCache(parent, args, context, info, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = makeKey(info, args);
            const returnObj = callback(args);
            yield this.client.SET(key, JSON.stringify(returnObj));
            return returnObj;
        });
    }
}
exports.ResolverCache = ResolverCache;
//creates a key that will be the fieldName concatenated with the argument id
function makeKey(info, args) {
    let key = '';
    if (Object.keys(args).length === 0)
        key = info.returnType;
    else
        key = String(info.returnType) + String(args.id);
    return key;
}
exports.makeKey = makeKey;
//--------------------------------------------------
class SplacheCacheWhole {
    constructor(schema, host, port, password) {
        this.schema = schema;
        if (host && port && password) {
            this.client = (0, redis_1.createClient)({
                socket: {
                    host, port
                },
                password
            });
        }
        else if (host && port) {
            this.client = (0, redis_1.createClient)({
                socket: {
                    host, port
                }
            });
        }
        else {
            this.client = (0, redis_1.createClient)();
        }
        this.wholeCache = this.wholeCache.bind(this);
        this.client.connect()
            .then(() => console.log('connected to redis instance'))
            .catch((err) => console.log(`there was a problem connecting to the redis instance: ${err}`));
    }
    //The method wholeCache is an express middleware function, it examines if queries coming from the request body already exists in the cache
    wholeCache(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryString = req.body.query;
            const isInCache = yield this.client.EXISTS(queryString);
            if (isInCache) {
                const returnObj = yield this.client.GET(queryString);
                if (typeof returnObj === 'string') {
                    const returnObjParsed = JSON.parse(returnObj);
                    res.locals.queryResult = returnObjParsed;
                    return next();
                }
                else {
                    return next({ err: 'There was a redis error' });
                }
            }
            else {
                (0, graphql_1.graphql)({ schema: this.schema, source: queryString })
                    .then((response) => {
                    this.client.SET(queryString, JSON.stringify(response));
                    res.locals.queryResult = response;
                    return next();
                })
                    .catch((err) => next({ err }));
            }
        });
    }
}
exports.SplacheCacheWhole = SplacheCacheWhole;
//--------------------------------------------------
class SplacheCache {
    constructor(schema, host, port, password) {
        this.schema = schema;
        this.GQLquery = this.GQLquery.bind(this);
        if (host && port && password) {
            this.client = (0, redis_1.createClient)({
                socket: {
                    host,
                    port,
                },
                password,
            });
        }
        else if (host && port) {
            this.client = (0, redis_1.createClient)({
                socket: {
                    host,
                    port,
                },
            });
        }
        else {
            this.client = (0, redis_1.createClient)();
        }
        this.client.connect()
            .then(() => console.log('connected to redis'))
            .catch((err) => console.log(`there was a problem connecting to the redis instance: ${err}`));
    }
    //Partial normalization of the input query through traversing the GraphQL AST to build valid root queries. 
    //The root queries are checked against the Redis cache as opposed to the original query
    GQLquery(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryString = req.body.query;
            const ast = (0, graphql_1.parse)(queryString);
            const [template, fieldArgs] = yield makeTemplate(ast);
            const splitQuery = qlStrGen(template, fieldArgs);
            const compiledObj = { data: {} };
            for (const query of splitQuery) {
                const isInCache = yield this.client.EXISTS(query);
                if (isInCache) {
                    const returnObj = yield this.client.GET(query);
                    if (typeof returnObj === 'string') {
                        const returnObjParsed = JSON.parse(returnObj);
                        compiledObj.data[Object.keys(returnObjParsed.data)[0]] =
                            returnObjParsed.data[Object.keys(returnObjParsed.data)[0]];
                    }
                    else {
                        return next({ err: 'There was a redis error' });
                    }
                }
                else {
                    yield (0, graphql_1.graphql)({ schema: this.schema, source: query })
                        .then((response) => {
                        compiledObj.data[Object.keys(response.data)[0]] =
                            response.data[Object.keys(response.data)[0]];
                        this.client.SET(query, JSON.stringify(response));
                    })
                        .catch((err) => next({ err }));
                }
            }
            res.locals.queryResult = compiledObj;
            return next();
        });
    }
}
exports.SplacheCache = SplacheCache;
// makeTemplate uses the AST from the GraphQL query as an input
// The visit function is provided by graphql, check documentation here https://graphql.org/graphql-js/language/#visit
function makeTemplate(ast) {
    return __awaiter(this, void 0, void 0, function* () {
        const template = {};
        const path = [];
        const fieldInfo = {};
        (0, graphql_1.visit)(ast, {
            Field: {
                enter(node) {
                    if (node.arguments) {
                        const args = {};
                        for (let i = 0; i < node.arguments.length; i++) {
                            const key = node.arguments[i].name.value;
                            args[key] = node.arguments[i].value.value;
                        }
                        fieldInfo[node.name.value] = Object.assign({}, args);
                    }
                    path.push(node.name.value);
                },
                leave() {
                    path.pop();
                },
            },
            SelectionSet: {
                enter(node, key, parent) {
                    if (parent.kind === 'Field') {
                        const fields = {};
                        for (let i = 0; i < node.selections.length; i++) {
                            if (!node.selections[i].selectionSet) {
                                fields[node.selections[i].name.value] = true;
                            }
                        }
                        const fieldsObj = Object.assign(Object.assign({}, fields), fieldInfo[path[path.length - 1]]);
                        let curr = template;
                        for (let i = 0; i < path.length; i++) {
                            if (i + 1 === path.length)
                                curr[path[i]] = Object.assign({}, fieldsObj);
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
    });
}
exports.makeTemplate = makeTemplate;
//GQLquery helper functions below
function qlStrGen(template, fieldArgs) {
    const queryStrs = [];
    for (const prop in template) {
        let queryStr = `query {${prop} ${genArgStr(fieldArgs[prop])} {`;
        queryStr += genfields(template[prop]);
        queryStrs.push((queryStr += '} }'));
    }
    return queryStrs;
}
exports.qlStrGen = qlStrGen;
function genArgStr(args) {
    if (Object.keys(args)[0] === undefined)
        return '';
    let argStr = '(';
    for (const arg in args) {
        argStr += `${arg}: "${args[arg]}" `;
    }
    return (argStr += ')');
}
exports.genArgStr = genArgStr;
function genfields(fields) {
    let fieldStr = '';
    for (const field in fields) {
        if (typeof fields[field] === 'object') {
            fieldStr += `${field} {${genfields(fields[field])}} `;
        }
        else {
            if (field !== 'id')
                fieldStr += `${field} `;
        }
    }
    return fieldStr;
}
exports.genfields = genfields;
