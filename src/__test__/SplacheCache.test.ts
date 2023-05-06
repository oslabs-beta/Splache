import { SplacheCache } from "../SplacheCache";
import {StarWarsSchema} from '../schemaTest';
import { Request, Response } from "express";

describe ("SplacheCache", ()=>{

    const testSplacheCache = new SplacheCache(StarWarsSchema);

    let mockRequest: Partial<Request>;
    let mockResponse: any;

    beforeEach(()=>{
        mockRequest = {};
        mockResponse = {locals: {}};
    })
    afterEach(() => {
        jest.clearAllMocks();
      });
    afterAll(()=>{
        testSplacheCache.client.QUIT();
    })

    it(".GQLquery should attach the correct response to res.locals for one root query", async ()=>{
        const expectedResponse = {
            "data": {
                "human": {
                    "id": "1000",
                    "name": "Luke Skywalker"
                }
            }
        }
        mockRequest = {
            body:{
                query: `{
                    human (id:"1000") {
                        name
                    }
                  }`
            }
        }
        const next = jest.fn();
        await testSplacheCache.GQLquery(mockRequest, mockResponse, next)
        expect(mockResponse.locals.queryResult).toEqual(expectedResponse);
    })
    
    it(".GQLquery should attach the correct response to res.locals for multiple root queries", async ()=>{
        const expectedResponse = {
            "data": {
                "human": {
                    "id": "1000",
                    "name": "Luke Skywalker"
                },
                "droid": {
                    "name": "C-3PO",
                    "id": "2000"
                },
                "hero": {
                    "name": "R2-D2"
                }
            }
        }
        mockRequest = {
            body:{
                query: `{
                    human (id:"1000") {
                        name
                    }
                    droid (id:"2000") {
                        name
                    }
                    hero {
                        name
                    }
                  }`
            }
        }
        const next = jest.fn();
        await testSplacheCache.GQLquery(mockRequest, mockResponse, next)
        expect(mockResponse.locals.queryResult).toEqual(expectedResponse);
    })
    it('.GQLquery should handle queries where there are nested fields', async () => {
        const expectedResponse = {
            "data": {
                "human": {
                    "id": "1000",
                    "name": "Luke Skywalker",
                    "friends": [
                        {
                            "id": "1002",
                            "name": "Han Solo",
                            "friends": [
                                {
                                    "name": "Luke Skywalker"
                                },
                                {
                                    "name": "Leia Organa"
                                },
                                {
                                    "name": "R2-D2"
                                }
                            ]
                        },
                        {
                            "id": "1003",
                            "name": "Leia Organa",
                            "friends": [
                                {
                                    "name": "Luke Skywalker"
                                },
                                {
                                    "name": "Han Solo"
                                },
                                {
                                    "name": "C-3PO"
                                },
                                {
                                    "name": "R2-D2"
                                }
                            ]
                        },
                        {
                            "id": "2000",
                            "name": "C-3PO",
                            "friends": [
                                {
                                    "name": "Luke Skywalker"
                                },
                                {
                                    "name": "Han Solo"
                                },
                                {
                                    "name": "Leia Organa"
                                },
                                {
                                    "name": "R2-D2"
                                }
                            ]
                        },
                        {
                            "id": "2001",
                            "name": "R2-D2",
                            "friends": [
                                {
                                    "name": "Luke Skywalker"
                                },
                                {
                                    "name": "Han Solo"
                                },
                                {
                                    "name": "Leia Organa"
                                }
                            ]
                        }
                    ]
                },
                "droid": {
                    "name": "C-3PO",
                    "id": "2000"
                },
                "hero": {
                    "name": "R2-D2"
                }
            }
        }
        mockRequest = {
            body:{
                query: `query {
                    human (id:"1000") {
                        id
                        name
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
            }
        }
        const next = jest.fn();
        await testSplacheCache.GQLquery(mockRequest, mockResponse, next)
        expect(mockResponse.locals.queryResult).toEqual(expectedResponse);
    });
    it(".GQLquery should check the cache for the key on every invocation", async ()=>{
        const spy = jest.spyOn(testSplacheCache.client, "EXISTS")
        const next = jest.fn();
        mockRequest = {
            body:{
                query: `{
                    human (id:"1000") {
                        name
                    }
                  }`
            }
        }
        await testSplacheCache.GQLquery(mockRequest, mockResponse, next)
        expect(spy).toBeCalled();
    })
    it(".GQLquery should call client.set if the key doesn't exist in the cache", async ()=>{
        await testSplacheCache.client.FLUSHALL()
        const spy = jest.spyOn(testSplacheCache.client, "SET")
        const next = jest.fn();
        mockRequest = {
            body:{
                query: `{
                    human (id:"1000") {
                        name
                    }
                  }`
            }
        }
        await testSplacheCache.GQLquery(mockRequest, mockResponse, next)
        expect(spy).toBeCalled();
    })
    it(".GQLquery should call client.get if the key is found in the cache", async ()=> {
        const spy = jest.spyOn(testSplacheCache.client, "GET")
        const next = jest.fn();
        mockRequest = {
            body:{
                query: `{
                    human (id:"1000") {
                        name
                    }
                  }`
            }
        }
        await testSplacheCache.GQLquery(mockRequest, mockResponse, next)
        expect(spy).toBeCalled();
        
    })
    it(".GQLquery should retrieve query results from both cache and graphQL query when partial caching has occured", async () => {
        const spySET = jest.spyOn(testSplacheCache.client, "SET")
        const spyGET = jest.spyOn(testSplacheCache.client, "GET")
        const next = jest.fn();
        mockRequest = {
            body:{
                query: `{
                    human (id:"1000") {
                        name
                    }
                    droid (id: "2000") {
                        name
                    }
                  }`
            }
        }
        await testSplacheCache.GQLquery(mockRequest, mockResponse, next)
        expect(spySET).toBeCalled();
        expect(spyGET).toBeCalled();
    })
    it(".GQLquery should retrieve root queries that have been stored in the cache as partials", async () => {
        const spySet = jest.spyOn(testSplacheCache.client, "SET")
        mockRequest = {
            body:{
                query: `{
                    human (id:"1000") {
                        name
                    }
                  }`
            }
        }
        const next = jest.fn();
        await testSplacheCache.GQLquery(mockRequest, mockResponse, next)
        mockRequest = {
            body:{
                query: `{
                    droid (id: "2000") {
                        name
                    }
                  }`
            }
        }
        await testSplacheCache.GQLquery(mockRequest, mockResponse, next)
        expect(spySet).toHaveBeenCalledTimes(0);

    })
    it(".GQLquery should produce complex queries from cached root queries", async () => {
        const spySet = jest.spyOn(testSplacheCache.client, "SET")
        const next = jest.fn();
        mockRequest = {
            body:{
                query: `{
                    human (id:"1000") {
                        name
                    }
                    droid (id: "2000") {
                        name
                    }
                  }`
            }
        }
        await testSplacheCache.GQLquery(mockRequest, mockResponse, next)
        expect(spySet).toHaveBeenCalledTimes(0);
    })
    it(".GQLquery should return next", async ()=>{
        mockRequest = {body:{query:
            `query FetchLukeAndC3POQuery {
                human(id: "1000") {
                  id
                  name
                  friends{
                      id
                      name
                  }
                }
                droid(id: "2000") {
                  id
                  name
                }
            }`
        
        } } as Request;
        const next = jest.fn();
        await testSplacheCache.GQLquery(mockRequest, mockResponse, next);
        expect(next).toHaveBeenCalled();
    })
})