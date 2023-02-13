import redis from 'redis'
import {parse, visit, BREAK, GraphQLSchema } from 'graphql'
import {graphql} from 'graphql'

export class SplacheCache {
    schema: GraphQLSchema
    constructor(schema: GraphQLSchema){
        this.schema = schema
        this.GQLquery = this.GQLquery.bind(this);
    }
    async GQLquery (req: any, res: any, next: any){
        const queryString: string = req.body.query;
        const ast = parse(queryString)
        console.log(ast)
        const record = []
        const editedAST = visit(ast, {
          enter(node, key, parent, path, ancestors) {
            // console.log('node: ', node)
            // console.log('key: ', key)
            // console.log('parent: ', parent)
            // console.log('path', path);
            // console.log('ancestors: ', ancestors)
            // @return
            //   undefined: no action
            //   false: skip visiting this node
            //   visitor.BREAK: stop visiting altogether
            //   null: delete this node
            //   any value: replace this node with the returned value
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

