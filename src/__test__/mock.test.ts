// import * as mock from "../mock"
// const { add } = jest.requireActual<typeof mock>("../mock")
import { add } from "../mock";
console.log('add', add);
import { checkCache } from "../testFunc";

describe("test checkCache", () => {
  it('should be a function', ()=> {
    expect(typeof checkCache).toBe('function');
  })
})

describe("test add function", () => {
  it("should return 2 for add(1,1)", () => {
    expect(add(1, 1)).toBe(2);
  })
  it("should return 15 for add(10,5)", () => {
    expect(add(10, 5)).toBe(15);
  });
  it("should return 5 for add(2,3)", () => {
    expect(add(2, 3)).toBe(5);
  });
});

// required with this small example
// to make the isolatedModules config happy
export {}


