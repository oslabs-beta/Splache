import { createClient } from 'redis'
import { ResolverCache } from "../ResolverCache";


interface MockRedisClient {
    exists: jest.Mock<Promise<number>, [string]>;
    get: jest.Mock<Promise<string | null>, [string]>;
    set: jest.Mock<Promise<string>, [string, string]>;
    connect: jest.Mock<Promise<void>, []>;
  }
  
  const createMockRedisClient = (): MockRedisClient => ({
    exists: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    connect: jest.fn(),
  });

jest.mock('redis');


const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

describe ('ResolverCache Redis Connection', () => {
    let mockClient: MockRedisClient;
    let resolverCache: ResolverCache;

    beforeEach(() => {
        mockClient = createMockRedisClient();
        resolverCache = new ResolverCache('localhost', 6379, 'password');
        resolverCache.client = mockClient as any;
      });
    
      afterEach(() => {
        jest.clearAllMocks();
      });
      
      describe('constructor', () => {
        it('should create a new Redis client with default options if no arguments are provided', () => {
          resolverCache = new ResolverCache();
          expect(mockCreateClient).toHaveBeenCalledTimes(1);
        });
    
        it('should create a new Redis client with host and port if provided', () => {
          resolverCache = new ResolverCache('localhost', 6379);
          expect(mockCreateClient).toHaveBeenCalledWith({ socket: { host: 'localhost', port: 6379 } });
        });
    
        it('should create a new Redis client with host, port and password if provided', () => {
          resolverCache = new ResolverCache('localhost', 6379, 'password');
          expect(mockCreateClient).toHaveBeenCalledWith({ socket: { host: 'localhost', port: 6379 }, password: 'password' });
        });
    
        it('should call the connect method of the Redis client', async () => {
          await resolverCache.client.connect();
          expect(resolverCache.client.connect).toHaveBeenCalledTimes(1);
        });
      });
})