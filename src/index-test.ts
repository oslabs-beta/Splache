import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { checkCache, updateCache } from './testFunc.ts';
const port = 4000;


import { createClient } from 'redis';

const client = createClient();
console.log(typeof client)

client.on('error', err => console.log('Redis Client Error', err));

client.connect()
    .then(console.log('connected to redis instance'))

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
        updateChapter(id: Int!, title: String!): Book
    }
    type Book {
        author: String!
        title: String!
        chapters: [Chapter]
        id: Int
    }
    type Chapter {
        title: String
        number: Int
        id: Int!
    }
`);

//dummy data
const books = [
    {author: 'Fitzgerald',
     title: 'The Beautiful and the Damned',
     id: 1,
     chapters: [{number: 1, title: "Chapter 1", id: 1}]
    },
    {author: 'Updike',
     title: 'Rabbit Redux',
     id: 2,
     chapters: [{number: 1, title: "Chapter 1", id: 2}]
    },
    {author: 'Frazier',
     title: 'Flash in the Great Game',
     id: 3,
     chapters: [{number: 1, title: "Chapter 1", id: 3}]
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
}

function getBook(args){
    const id = args.id;
    const returnObj = books.filter((book) => book.id === id)[0]
    return returnObj
}
function updateChapter(args){
    const id = args.id;
    const title = args.title;
    for (let i=0; i<books.length; i++){
        for (let i=0; i<books[i].chapters.length; i++){
            if (books[i].chapters[i].id === id){
                books[i].chapters[i].title = title;
                return books[i]
            }
        }
    }
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
    },
    updateChapter : (args, context, info) => {

        return updateCache(args, info, client, updateChapter)
    }
};

// Use those to handle incoming requests:
app.use(graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true
}));
