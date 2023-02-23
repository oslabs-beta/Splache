import { ResolverCache } from "./ResolverCache";

function testFunc (args: any){
    return 0
}
const testResolve = new ResolverCache();
const  output = testResolve.checkCache({}, {}, {}, {returnType:'test'}, testFunc)
console.log(output)
