import express from 'express';
import { SplacheCache } from './SplacheCache';
import {SplacheCacheWhole} from './CacheWhole'
import {StarWarsSchema} from './schemaTest'
import {graphql, GraphQLSchema} from 'graphql'

const app = express()

const cache = new SplacheCacheWhole(StarWarsSchema);
// const cache = new SplacheCache(StarWarsSchema)
app.use(express.json())
app.use('/graphql', cache.wholeCache, (req, res) => {
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

app.listen(4000)