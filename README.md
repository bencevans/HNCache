#HNCache

A server/worker that caches each item posted to [Hacker News](http://news.ycombinator.com) so that if the original resource goes down due to traffic or some other reason then the disscussion can continue.

The resource is available by visiting http://hncache.bensbit.co.uk/{ITEM_ID} or if you are hosting your own then http://{YOUR_URL}/{ITEM_ID}.

Links: [Repo](https://github.com/bencevans/HNCache), [Issues](https://github.com/bencevans/HNCache/issues), [Site](http://hncache.bensbit.co.uk)

##Requirements

* Node.js (0.8.x)
* NPM (1.1.x)
* [Redis Server](http://redis.io/)

##Installation

```bash
git clone https://github.com/bencevans/HNCache.git && cd HNCache
npm install
node app.js
```

##Licence

(The MIT Licence)

Copyright (c) 2012 Ben Evans <ben@bensbit.co.uk>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.