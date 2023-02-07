declare function require(name:string);
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { checkCache, updateCache } = require('./testFunc.ts')
const port = 4000;


const { createClient } = require('redis');

const client = createClient();
console.log(typeof client)

client.on('error', err => console.log('Redis Client Error', err));

client.connect()
    .then(console.log('connect to reids instance'))

// Create a server:
const app = express();

// Create a schema and a root resolver:
const schema = buildSchema(`
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
        id: Int
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

function updateTitle(args){
    const id = args.id;
    const title = args.title
    for (let i=0; i<books.length; i++){
        if (books[i].id === id){
            books[i].title = title;
            return books[i];
        }
    }

    // const id = args.id;
    // const title = args.title
    // books.map((book) => {
    //     if (book.id === id){
    //         book.title = title;
    //         return book
    //     }
    // })
    // const returnObj = books.filter(book => book.id = id)[0]
    // return returnObj;
}

function getBook(args){
    const id = args.id;
    const returnObj = books.filter((book) => book.id === id)[0]
    return returnObj
}

const resolvers = {
    books: (parent, args, context, info) => {

        return books;
        
    },
    hello: () => {

        return 'hello there nicky'
    },
    book: async (args, context, info) => {

        return checkCache(args, info, client, getBook)

    },
    updateTitle : (args, context, info) => {
        
        return updateCache(args, info, client, updateTitle)

    }
};

// Use those to handle incoming requests:
app.use(graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true
}));
