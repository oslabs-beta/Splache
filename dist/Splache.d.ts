import { Request, Response, NextFunction } from 'express';
import { RedisClientType } from 'redis';
import { GraphQLSchema } from 'graphql';
export declare class ResolverCache {
    client: RedisClientType;
    constructor(host?: string, port?: number, password?: string);
    checkCache(parent: any, args: any, context: any, info: {
        returnType: any;
    }, callback: any): Promise<any>;
    updateCache(parent: any, args: any, context: any, info: {
        returnType: any;
    }, callback: any): Promise<any>;
}
export declare function makeKey(info: any, args: any): string;
export declare class SplacheCacheWhole {
    schema: GraphQLSchema;
    client: RedisClientType;
    constructor(schema: GraphQLSchema, host?: string, port?: number, password?: string);
    wholeCache(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare class SplacheCache {
    schema: GraphQLSchema;
    client: RedisClientType;
    constructor(schema: GraphQLSchema, host?: string, port?: number, password?: string);
    GQLquery(req: any, res: any, next: any): Promise<any>;
}
export declare function makeTemplate(ast: any): Promise<any[]>;
export declare function qlStrGen(template: any, fieldArgs: any): string[];
export declare function genArgStr(args: any): string;
export declare function genfields(fields: any): string;
