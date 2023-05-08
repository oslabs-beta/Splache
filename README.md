
<div align = 'center'>

<img src = 'https://i.imgur.com/P3gEOhl.png'/>
<h3> A Lightweight NPM package for GraphQL Caching with Redis </h3>


![GraphQL](https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
 [![License](https://img.shields.io/github/license/Ileriayo/markdown-badges?style=for-the-badge)](public/LICENSE)


Introducing Splache (/splæʃ/), an agile, user-friendly, and lightweight JavaScript library that efficiently caches GraphQL queries using the power of Redis. The Splache library is designed for  improved performance and reduced load on your GraphQL server. Through leveraging the speed and scalability of Redis, Splache is able to provide an efficient and unique solution for caching GraphQL queries!


</div>


<br/>
<hr/>

[Launch Page](www.splachejs.com) : Learn More about Splache & Demo our package via an interactive sandbox pre-installation

[Install our NPM Package](https://www.npmjs.com/package/splache)

[Documentation](https://medium.com/@zhangn356/exploring-caching-solutions-for-graphql-an-introduction-to-splache-4a497bdb597f)

<hr/>

## Get Started and Installation
Run ```npm install splache``` to install the package to import ```SplacheCacheWhole```, ```ResolverCache``` and ```SplacheCache```.

### Quick Start with Redis
If you are new to Redis, here is the [documentation](https://redis.io/docs/getting-started/) to install redis and start a redis instance locally.

### Import splache

```node
import splache from 'splache'

```

<hr/>

## Key Features

1.<b> The Caching of Whole Queries </b>


Simply provide SpacheCacheWhole your schema, redis host, redis port, and password (Only provide the password if your external redis instance is password protected. If not, omit the password. Additionally, omit host, port, and password arguments if connecting to local redis instance) and then direct your queries through the middleware as seen in the example below. 


```node
import { SplacheCacheWhole }

const cache = new SplacheCacheWhole(schema, host, post, password);

app.use('/graphql', cache.wholeCache, (req, res) => {
 res.send(res.locals.queryResponse) 
})
```


2. <b> The Caching of Resolvers </b>

```node
import { ResolverCache } from 'Splache' 

const cache = new ResolverCache(host, port, password) 
```

Upon importing ResolverCache from our package, create a new instance of ResolverCache to access the ‘checkCache’ method. From there, simply wrap your resolver functions with our pre-built functionality.

Here is an example:


```node
planet : {
  type: Planet,
  args: {
   id : {
     description: 'id of the planet'
     type: new GraphQLNonNull(GraphQLString)
  }
 },
 resolve: ((parent, args, context, info) => cache.checkCache(parents, args, context, info, getPlanet))
}
```


3. <b> The Caching of Normalized Query Strings & Breakdown of Complex Nested Queries </b>

Create a new instance of SplacheCache, passing in your schema, host, port, and password (omit host, port, and password if just connecting to local redis instance). By passing your query through our GQLquery method, it’ll generalize and split your query string and check the cache for these individual split queries. This reduces redundancy in your cache if existing cached queries are nested into a complex nested query. 


```node
import { SplacheCache } from 'splache' 
const cache = newSplacheCache(schema, host, port, password);

app.use('/graphql', cacheGQLquery, (req, res) => {
  res.send(res.locals.queryResponse)
})
```

## Currently Under Development


## Connect with the Team!
| Nicholas Cathcart | Nicolas Jackson | Jessica Wang | Nancy Zhang |
| :---: | :---: | :---: | :---: |
| [![GitHub](https://skillicons.dev/icons?i=github)](https://github.com/nhcathcart) [![LinkedIn](https://skillicons.dev/icons?i=linkedin)](https://www.linkedin.com/in/nicholas-cathcart-4b3834267/)| [![GitHub](https://skillicons.dev/icons?i=github)](https://github.com/NicJax) [![LinkedIn](https://skillicons.dev/icons?i=linkedin)](www.linkedin.com/in/NicJax) | [![GitHub](https://skillicons.dev/icons?i=github)](https://github.com/jesswang-dev) [![LinkedIn](https://skillicons.dev/icons?i=linkedin)](https://www.linkedin.com/in/jessica-xuecen-wang) | [![GitHub](https://skillicons.dev/icons?i=github)](https://github.com/zhangn356 ) [![LinkedIn](https://skillicons.dev/icons?i=linkedin)](https://www.linkedin.com/in/zhangn356) |

## Want to Contribute?

Splache is an open-source product that is open to input and contributions from the community. After trying out the product, feel free to raise issues or submit a PR request.
