import { SplacheCache, makeTemplate, typeToFields, qlStrGen, genArgStr, genfields, queryToReturnedType} from "../SplacheCache";
import { Request, Response } from "express";
import {StarWarsSchema} from '../schemaTest'
import {parse} from 'graphql'
//must have redis instance running and flushed



describe("SplacheCache Helpers", () => {
  
  it('makeTemplate should output a valid template, and fieldArgs', async ()=> {
    const queryString = `query FetchLukeAndC3POQuery {
        human(id: "1000") {
          name
        }
        droid(id: "2000") {
          name
        }
      }`
    const ast = parse(queryString)
    const output = await makeTemplate(ast)
    const [template, fieldArgs] = output;
    expect(template).toEqual({
        human: { name: true, id: '1000' },
        droid: { name: true, id: '2000' }
      })
    expect(fieldArgs).toEqual({ human: { id: '1000' }, name: {}, droid: { id: '2000' } })
  })

  it('typeToFields should output a valid type map (object)', () => {
    const expectedTypeMap =  {
      human: {
        id: 'string',
        name: 'string',
        friends: 'character',
        appearsin: 'episode',
        homeplanet: 'string',
        secretbackstory: 'string'
      },
      character: {
        id: 'string',
        name: 'string',
        friends: 'character',
        appearsin: 'episode',
        secretbackstory: 'string'
      },
      episode: {},
      droid: {
        id: 'string',
        name: 'string',
        friends: 'character',
        appearsin: 'episode',
        secretbackstory: 'string',
        primaryfunction: 'string'
      }
    }

    const output = typeToFields(StarWarsSchema)
    expect(output).toEqual(expectedTypeMap);

  });
  it('queryToReturned type should return a valid query to type map', async ()=> {
    const expectedMap = { hero: 'character', human: 'character', droid: 'character' }
    const output = queryToReturnedType(StarWarsSchema);
    expect(output).toEqual(expectedMap);
  });
  it('qlStrGen should return an array of single root graphQL queries', async () => {
    const expectedQueryStrings = [
      'query {human (id: "1000" ) {id friends {id name friends {name } } } }',
      'query {droid (id: "2000" ) {name id } }',
      'query {hero  {name } }'
    ];
    const queryStr = `query {
      human (id:"1000") {
        friends {
            id
            name
            friends {
                name
            }
        }
    }
    droid (id: "2000") {
        name
    }
    hero {
        name
    }
    }`
    const ast = parse(queryStr)
    const mkTemplateOut = await makeTemplate(ast)
    const [template, fieldArgs] = mkTemplateOut;
    const outputStrs = qlStrGen(template, fieldArgs); 
    expect(outputStrs).toEqual(expectedQueryStrings); 
  });
  it('genArgStr should return a string of the query arguments', ()=> {
    const qArgs = { id: '1000' , name: 'test'}
    const expectedQArgStr = '(id: "1000" name: "test" )'
    const outputArgStr = genArgStr(qArgs); 
    expect(outputArgStr).toEqual(expectedQArgStr); 

  });
  it('genfields should return a string of all query fields', () => {
    const qFields = {id: '1000',friends: { id: true, name: true, friends: { name: true } }}
    const expectQStr = 'id friends {id name friends {name } } '
    const outputQfield = genfields(qFields); 
    expect(outputQfield).toEqual(expectQStr); 


  })
  
})