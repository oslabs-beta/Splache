
const graphql = require('graphql');
//used to convert the JS data types and custom data types into GraphQL-friendly types for compilation
const { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLNonNull } = graphql;

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
const Person = new graphql.GraphQLObjectType({
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
        }
    })
});

//function getPerson that fetches from SWAPI 
async function getPerson(id) {
    const response = await fetch(`https://swapi.dev/api/people/${id}`);
    const data = await response.json();
    // const person = {
    //     name: data.name,
    //     height: data.height,
    //     mass: data.mass,
    //     hair_color: data.hair_color, 
    //     skin_color: data.skin_color,
    //     eye_color: data.eye_color,
    //     birth_year: data.birth_year,
    //     gender: data.gender,
    // };
    // return person;
    return data;
}

module.exports = new GraphQLSchema({
    query: RootQuery
})




