import {graphql} from 'graphql';
// import {SplacheCache} from '../src/SplacheCache';

import express from 'express';
import {schema} from './schema';

const app = express(); 
const PORT = 4002;

app.use(express.json())

app.use('/graphql', (req, res) => {
  graphql({ schema: schema, source: req.body.query})
    .then((response) => {
      res.send(response)
    })
})

app.listen(PORT, () => {
    console.log(`listening on ${PORT}`)
})