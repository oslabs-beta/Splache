import { createClient, RedisClientType } from 'redis';
import {
  parse,
  visit,
  GraphQLSchema,
} from 'graphql';
import { graphql } from 'graphql';

export class SplacheCache {
  schema: GraphQLSchema;
  typeToFields: object;
  queryToReturnType: object;
  client: RedisClientType;
  constructor(schema: GraphQLSchema, host?: string, port?: number, password?: string) {
    this.schema = schema;
    this.GQLquery = this.GQLquery.bind(this);
    this.typeToFields = typeToFields(this.schema);
    this.queryToReturnType = queryToReturnedType(this.schema);
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
    this.client.connect().then(() => console.log('connected to redis'));
  }
  async GQLquery(req: any, res: any, next: any) {
    const queryString: string = req.body.query;
    const ast = parse(queryString);
    const [template, fieldArgs] = await makeTemplate(ast);
    //---------------
    const splitQuery = qlStrGen(template, fieldArgs);

    const compiledObj = { data: {} };
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
          .catch((err) => next({ err })); //clean up error handling
      }
    }
    res.locals.queryResult = compiledObj;
    return next();
  }
}

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
          const fields = {};
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
export function typeToFields(schema: GraphQLSchema) {
  const builtInTypes = {
    String: 'String',
    Int: 'Int',
    Float: 'Float',
    Boolean: 'Boolean',
    ID: 'ID',
    Query: 'Query',
    __Type: '__Type',
    __Field: '__Field',
    __EnumValue: '__EnumValue',
    __DirectiveLocation: '__DirectiveLocation',
    __Schema: '__Schema',
    __TypeKind: '__TypeKind',
    __InputValue: '__InputValue',
    __Directive: '__Directive',
  };
  const typeMap: any= schema.getTypeMap();
  const typesToFields = {};
  for (const type in typeMap) {
    if (type in builtInTypes === false) {
      const tempObj = {};
      const fields = typeMap[type]._fields;
      for (const field in fields) {
        const key = fields[field].name.toLowerCase();
        let value: any;
        if (fields[field].type.ofType)
          value = fields[field].type.ofType.name.toLowerCase();
        else value = fields[field].type.name.toLowerCase();
        tempObj[key] = value;
      }
      typesToFields[type.toLowerCase()] = tempObj;
    }
  }
  return typesToFields;
}

export function queryToReturnedType(schema: GraphQLSchema) {
  const queryTypeFields: any= schema.getQueryType()?.getFields();
  const map: any = {};
  for (const key in queryTypeFields) {
    if (queryTypeFields[key].type._interfaces.length > 0)
      map[key] = queryTypeFields[key].type._interfaces[0].name.toLowerCase();
    else map[key] = queryTypeFields[key].type.name.toLowerCase();
  }
  return map;
}

export function qlStrGen(template, fieldArgs) {
  const queryStrs: string[] = [];
  for (const prop in template) {
    let queryStr = `query {${prop} ${genArgStr(fieldArgs[prop])} {`;
    queryStr += genfields(template[prop]);
    queryStrs.push((queryStr += '} }'));
  }
  return queryStrs;
}

export function genArgStr(args) {
  if (Object.keys(args)[0] === undefined) return '';
  let argStr = '(';
  for (const arg in args) {
    argStr += `${arg}: "${args[arg]}" `
  }
  return (argStr += ')');
}

export function genfields(fields) {
  let fieldStr = '';
  for (const field in fields) {
    if (typeof fields[field] === 'object') {
      fieldStr += `${field} {${genfields(fields[field])}} `;
    } else {
      fieldStr += `${field} `;
    }
  }
  return fieldStr;
}