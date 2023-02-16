import {ResolverCache} from '../src/ResolverCache'
// import graphql from 'graphql';

const cache = new ResolverCache()
//used to convert the JS data types and custom data types into GraphQL-friendly types for compilation
import { graphql, GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLNonNull } from  'graphql';

//two versions of demo app - one uses splacheCache and cacheWhole

//type Person {
//     id: ID!
//     name: String!
//     height: Int
//     mass: Int
//     hair_color: String
//     skin_color: String
//     eye_color: String
//     birth_year: String
//     gender: String
// }

//Root Query: the type that represents all the possible entry points into the GraphQL API
const Person = new GraphQLObjectType({
    name: 'Person',
    fields: () => ({
        name: {
            type: GraphQLString
        },
        height: {
            type: GraphQLString
        },
        mass: {
            type: GraphQLString
        },
        hair_color: {
            type: GraphQLString
        },
        skin_color: {
            type: GraphQLString
        },
        eye_color: {
            type: GraphQLString
        },
        birth_year:{
            type: GraphQLString
        },
        gender:{
            type: GraphQLString
        }
    })
})

const Planet = new GraphQLObjectType({
    name: 'Planet',
    fields: () => ({
        climate: {
            type: GraphQLString
        },
        diameter: {
            type: GraphQLString
        },
        gravity: {
            type: GraphQLString
        },
        name: {
            type: GraphQLString
        },
        orbital_period: {
            type: GraphQLString
        },
        population: {
            type: GraphQLString
        }
    })
})
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: () => ({
        person: {
            type: Person, 
            args: {
                id: {
                    description: 'id of the person',
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (_source, {id}) => getPerson(id)
        },
        planet: {
            type: Planet,
            args: {
                id: {
                    description: 'id of the planet',
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve:  ((parent, args, context, info) => cache.checkCache(parent, args, context, info, getPlanet))
        }
    })
});

//functions getPerson and getPlanet that fetches from SWAPI 
async function getPerson(id) {
    const response = await fetch(`https://swapi.dev/api/people/${id}`);
    const data = await response.json();
    return data;
}
async function getPlanet(args) {
    const {id} = args;
    const response = await fetch(`https://swapi.dev/api/planets/${id}`);
    const data = await response.json();
    return data;
}


export const schema = new GraphQLSchema({
    query: RootQuery
})
