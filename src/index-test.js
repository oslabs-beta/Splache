const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { checkCache } = require('./testFunc.js');
const port = 4000;


const { createClient } = require('redis');

let client = createClient();

client.on('error', err => console.log('Redis Client Error', err));

client.connect()
    .then(console.log('connect to reids instance'))

// Create a server:
const app = express();

// Create a schema and a root resolver:
var schema = buildSchema(`
    type Query {
        books: [Book]
        book(id: Int): Book
        hello: String!
    }
    type Mutation {
        updateTitle(id: Int!, title: String!): Book
    }
    type Book {
        author: String!
        title: String!
    }
`);

//dummy data
const books = [
    {author: 'Fitzgerald',
     title: 'The Beautiful and the Damned',
     id: 1
    },
    {author: 'Updike',
     title: 'Rabbit Redux',
     id: 2
    },
    {author: 'Frazier',
     title: 'Flash in the Great Game',
     id: 3
    }
]

function updateTitle({id, title}){
    books.map((book) => {
        if (book.id === id){
            book.title = title;
            return book
        }
    })
    return books.filter(book => book.id = id)[0]
}

function getBook(args){
    const id = args.id;
    const returnObj = books.filter((book) => book.id === id)[0]
    return returnObj
}

var resolvers = {
    books: (parent, args, context, info) => {
        console.log(info)
        return books;
    },
    hello: () => {
        return 'hello there nicky'
    },
    book: async (args, context, info) => {
        return checkCache(args, info, client, getBook)
    },
    updateTitle : updateTitle
};

// Use those to handle incoming requests:
app.use(graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true
}));

// Start the server:
app.listen(port, () => console.log(`Server listening on ${port}`));