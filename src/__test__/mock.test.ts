import {ResolverCache} from "../ResolverCache"

function testFunc(args){
  return 'test'
}
//must have redis instance running and flushed
describe("ResolverCache", () => {
  it('should set key values if the key does not exist', async ()=> {
    const testResolverCache = new ResolverCache()
    expect(testResolverCache.checkCache({}, {}, {}, {returnType:'test'}, testFunc)).toBe('test')
  })
})




// required with this small example
// to make the isolatedModules config happy




