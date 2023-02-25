import { ResolverCache } from "../ResolverCache";

//must have redis instance running and flushed


describe("ResolverCache", () => {

  function testFunc (args: any){
    return 0
  }
  const testResolverCache = new ResolverCache()
  afterAll(()=>{
    testResolverCache.client.QUIT();
  })

  it('checkCache should be a function', async ()=> {
    expect(typeof testResolverCache.checkCache).toEqual('function')
  })
  it('checkCache should return the result of the callback', async ()=> {
    const result =  await testResolverCache.checkCache({}, {}, {}, {returnType:'test'}, testFunc)
    expect(result).toEqual(0)
  })
  it('checkCache should call client.set if the key doesnt exist', async()=>{
    await testResolverCache.client.FLUSHALL();
    const spy = jest.spyOn(testResolverCache.client, "SET");
    await testResolverCache.checkCache({}, {id:'1'}, {}, {returnType:'test'}, testFunc)
    expect(spy).toBeCalled();
  })
  it('checkCache should call client.get if the key exists', async()=>{
    const spy = jest.spyOn(testResolverCache.client, "GET");
    await testResolverCache.checkCache({}, {id:'1'}, {}, {returnType:'test'}, testFunc)
    expect(spy).toBeCalled();
  })
  it('updateCache should return the result of the callback', async ()=> {
    const result =  await testResolverCache.updateCache({}, {}, {}, {returnType:'test'}, testFunc)
    expect(result).toEqual(0)
  })
  it('updateCache should call client.set', async()=>{
    const spy = jest.spyOn(testResolverCache.client, "SET");
    await testResolverCache.checkCache({}, {id:'1'}, {}, {returnType:'test'}, testFunc)
    expect(spy).toBeCalled
  })
})





