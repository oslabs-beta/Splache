import redis, { createClient, RedisClientType } from 'redis'
import {parse, visit, BREAK, GraphQLSchema, print, SelectionSetNode, ASTKindToNode, GraphQLScalarType } from 'graphql'
import {graphql} from 'graphql'

export class SplacheCache {
    schema: GraphQLSchema
    typeToFields: object
    queryToReturnType: object
    client: RedisClientType
    constructor(schema: GraphQLSchema){
        this.schema = schema
        this.GQLquery = this.GQLquery.bind(this);
        this.typeToFields = typeToFields(this.schema)
        this.queryToReturnType = queryToReturnedType(this.schema)
        this.client = createClient();
        this.client.connect()
          .then(() => console.log('connected to redis'))
    }
    async GQLquery (req: any, res: any, next: any){
      const queryString: string = req.body.query;
      const ast = parse(queryString)
      const template = makeTemplate(ast)
      console.log(template)
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
            if (!node.selections[i].selectionSet) {
              fields[node.selections[i].name.value] = true
            }
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
  return template
}
function typeToFields(schema: GraphQLSchema){
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
  console.log(typeMap)
  const typesToFields = {};
  for (const type in typeMap){
    if (type in builtInTypes === false){
      const tempObj = {};
      const fields = typeMap[type]._fields
      for (const field in fields){
        const key = fields[field].name.toLowerCase();
        let value: any;
        if (fields[field].type.ofType) value = fields[field].type.ofType.name.toLowerCase();
        else value = fields[field].type.name.toLowerCase();
        tempObj[key] = value
      }
      typesToFields[type.toLowerCase()] = tempObj
    }

  }
  console.log(typesToFields)
  return typesToFields
}

function queryToReturnedType (schema: GraphQLSchema) {
  const queryTypeFields = schema.getQueryType()?.getFields();
  const map: any = {}
  for (const key in queryTypeFields){
    if (queryTypeFields[key].type._interfaces.length > 0) map[key] = queryTypeFields[key].type._interfaces[0].name.toLowerCase();
    else map[key] = queryTypeFields[key].type.name.toLowerCase();
  }
  console.log(map)
  return map
}

function flattenResponse(response: object, ){
  for (const prop in response){

  }
}