import redis, { createClient, RedisClientType } from 'redis'
import {parse, visit, BREAK, GraphQLSchema, print, SelectionSetNode, ASTKindToNode } from 'graphql'
import {graphql} from 'graphql'

export class SplacheCache {
    schema: GraphQLSchema
    typeSet: any
    queryToObjMap: any
    client: RedisClientType
    constructor(schema: GraphQLSchema){
        this.schema = schema
        this.GQLquery = this.GQLquery.bind(this);
        this.typeSet = makeMapFromSchema(this.schema)
        this.queryToObjMap = queryToObjMap(this.schema)
        this.client = createClient();
        this.client.connect()
          .then(() => console.log('connected to redis'))
    }
    async GQLquery (req: any, res: any, next: any){
      const queryString: string = req.body.query;
      const ast = parse(queryString)
      const printedString = print(ast)
      makeTemplate(ast)
        graphql({ schema: this.schema, source: queryString })
        .then((queryResult) => {
          res.locals.queryResult = queryResult;
          return next();
        })
        .catch((error) => {
          return next('graphql library error: ', error);
        })

}
}
async function makeTemplate (ast: any){
  const template: any = {};
  const path: any = [];
  const fieldInfo: any = {};

  visit(ast, {
    Field: {
      enter(node:any){
        
        if (node.arguments){
          const args: any = {};
          for (let i=0; i<node.arguments.length; i++){
            const key = node.arguments[i].name.value;
            args[key] = node.arguments[i].value.value
          }
          fieldInfo[node.name.value] = {...args};
        }
        
        path.push(node.name.value)
      },
      leave(){
        path.pop();
      }
    },
    SelectionSet: {
      enter(node: any, key, parent: any){
        if (parent.kind === 'Field'){
          const fields = {};
          for (let i=0; i<node.selections.length; i++){
            if (!node.selections[i].selectionSet) fields[node.selections[i].name.value] = true
          }
          const fieldsObj = {
            ...fields,
            ...fieldInfo[path[path.length - 1]],
          };
          let curr = template;
          for (let i=0; i<path.length; i++){
            if (i+1 === path.length) curr[path[i]] = {...fieldsObj}
            curr = curr[path[i]]
          }
          
        }
      },
      leave(){
        path.pop();
      }
    }
  });
  console.log(template)
  return template
}
function makeMapFromSchema(schema: GraphQLSchema){
  const builtInTypes = {
      'String' : 'String',
      'Int': 'Int',
      'Float': 'Float',
      'Boolean': 'Boolean',
      'ID': 'ID',
      'Query': 'Query',
      '__Type': '__Type',
      '__Field': '__Field',
      '__EnumValue': '__EnumValue',
      '__DirectiveLocation': '__DirectiveLocation',
      '__Schema': '__Schema',
      '__TypeKind': '__TypeKind',
      '__InputValue': '__InputValue',
      '__Directive': '__Directive',
  }
  const typeMap = schema.getTypeMap()
  const userProvidedTypes = new Set();
  for (const key in typeMap){
    if (key in builtInTypes === false) userProvidedTypes.add(key.toLowerCase());
  }
  
  return userProvidedTypes
}

function queryToObjMap (schema: GraphQLSchema) {
  const queryTypeFields = schema.getQueryType()?.getFields();
  const map: any = {}
  for (const key in queryTypeFields){
    console.log(queryTypeFields)
  }
  
  return queryTypeFields
}