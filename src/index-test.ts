import express from 'express';
import { SplacheCache } from 'test-test-splache';
import {SplacheCacheWhole} from 'test-test-splache'
import {StarWarsSchema} from './schemaTest'
// import {StarWarsSchema} from './SchemaWithCache'
import {graphql, GraphQLSchema} from 'graphql'

const app = express()

const cache = new SplacheCache(StarWarsSchema);
// const cache = new SplacheCache(StarWarsSchema)
app.use(express.json())
app.use('/graphql', cache.GQLquery, (req, res) => {
  res.send(res.locals.queryResult)
})

// app.use('/graphql', cache.GQLquery, (req, res) => {
//   res.send(res.locals.queryResult)
// })
// app.use('/graphql', (req, res) => {
//   graphql({ schema: StarWarsSchema, source: req.body.query})
//     .then((response) => {
//       res.send(response)
//     })
// })
app.use('/graphql', (req, res) => {
  graphql({ schema: StarWarsSchema, source: req.body.query})
    .then((response) => {
      res.send(response)
    })
})
