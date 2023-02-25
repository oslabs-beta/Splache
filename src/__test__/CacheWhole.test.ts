import { SplacheCacheWhole } from "../CacheWhole";
import { Request, Response } from "express";
import {StarWarsSchema} from '../schemaTest'
describe("SplacheCacheWhole", () => {

    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(()=>{
        mockRequest = {};
        mockResponse = {locals: {}};
    })
    
    const testSplacheCacheWhole = new SplacheCacheWhole(StarWarsSchema);
    afterAll(()=>{
        testSplacheCacheWhole.client.QUIT();
    })
    it('.wholeCache should return next', async () => {
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
                }`
        
        } } as Request;
        const next = jest.fn();
        await testSplacheCacheWhole.wholeCache(mockRequest, mockResponse, next);
        expect(next).toHaveBeenCalled();
    })
    it('.wholeCache should call client.set if the key does not exist', async () => {
        await testSplacheCacheWhole.client.FLUSHALL();
        const spy = jest.spyOn(testSplacheCacheWhole.client, "SET");
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
                `
        
        } } as Request;
        const next = jest.fn();
        await testSplacheCacheWhole.wholeCache(mockRequest, mockResponse, next);
        expect(spy).toHaveBeenCalled();
    })
    it('.wholeCache should call client.get if the key already exists', async () => {
       const spy = jest.spyOn(testSplacheCacheWhole.client, "SET");
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
                `
        
        } } as Request;
        const next = jest.fn();
        await testSplacheCacheWhole.wholeCache(mockRequest, mockResponse, next);
        expect(spy).toHaveBeenCalled(); 
    })
  })

