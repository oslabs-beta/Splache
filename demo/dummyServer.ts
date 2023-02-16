const {graphql, GraphQLSchema} = require('graphql');
// import {SplacheCache} from '../src/SplacheCache';
import {SplacheCacheWhole} from '../src/CacheWhole';

const express = require('express');
const app = express(); 
const PORT = 4001; 
const schema = require ('./schema.ts'); 

const cache = new SplacheCacheWhole(schema);

app.use(express.json())

app.use('/graphql', cache.wholeCache, (req, res) => {
  res.send(res.locals.queryResult)
})

app.listen(PORT, () => {
    console.log(`listening on ${PORT}`)
})