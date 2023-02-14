import redis from 'redis'
import {parse, visit, BREAK, GraphQLSchema } from 'graphql'
import {graphql} from 'graphql'

export class SplacheCache {
    schema: GraphQLSchema
    typeSet: any
    constructor(schema: GraphQLSchema){
        this.schema = schema
        this.GQLquery = this.GQLquery.bind(this);
        this.typeSet = makeMapFromSchema(this.schema)
    }
    async GQLquery (req: any, res: any, next: any){
        const queryString: string = req.body.query;
        const ast = parse(queryString)
        console.log(ast)
        const queryObj = {};
       visit(ast, {
          enter(node, key, parent, path, ancestors) {
            console.log(node)
          },
          leave(node, key, parent, path, ancestors) {
            // @return
            //   undefined: no action
            //   false: no action
            //   visitor.BREAK: stop visiting altogether
            //   null: delete this node
            //   any value: replace this node with the returned value
          }
        });
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