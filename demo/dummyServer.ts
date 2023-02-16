//WHERE R U NIC JACKSON
//come outside, it works 
//we r commiting rn and connecting it to the button on the front end 
//scratch the front end, we'll just show it in postman !!!! c: 
//come outttttttttt 

//hello nic, pls do not make edits 
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