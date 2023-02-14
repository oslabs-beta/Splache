import redis from 'redis'
import {parse, visit, BREAK, GraphQLSchema } from 'graphql'
import {graphql} from 'graphql'

export class SplacheCache {
    schema: GraphQLSchema
    typeSet: any
    querySet: any
    constructor(schema: GraphQLSchema){
        this.schema = schema
        this.GQLquery = this.GQLquery.bind(this);
        this.typeSet = makeMapFromSchema(this.schema)
        this.querySet  = makeQuerySetFromSchema(this.schema)
    }
    async GQLquery (req: any, res: any, next: any){
      const queryString: string = req.body.query;
      const ast = parse(queryString)
      const querySet = this.querySet
      const schema = this.schema
      visit (ast, {
        Field: {
          enter(node){
            if (querySet.has(node.name.value)){
              console.log('hey man')
            }
          }
        }
      })
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
    if (key in builtInTypes === false) userProvidedTypes.add(key);
  }
  console.log(userProvidedTypes)
  return userProvidedTypes
}

function makeQuerySetFromSchema (schema: GraphQLSchema) {
  const queryTypeFields = schema.getQueryType()?.getFields();
  const querySet = new Set();
  for (const key in queryTypeFields){
    querySet.add(key);
  }
  console.log(querySet)
  return querySet
}