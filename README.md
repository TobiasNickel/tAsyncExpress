# tAsyncExpress
monkeypatch express/router/layer so you can write async handler

## examples
```js
app.post('/user', ({body})=>userDao.insert(body));
app.post('/user/login', async (req,res)=>{
    const user = await userDao.getByMail(req.body.mail);
    if(user.password == req.body.password){
        req.session = {userId:user.id};
        return user;
    }
    return false;
});
app.get('/user/:id', ({params})=>userDao.getById(params.id));
app.get('/blogpost/:title', async ({title})=>{
    var post = await mysql.query('SELECT * FROM blogposts WHERE title = *', title);
    post.author = await mysql.query('SELECT * FROM user WHERE id = ?', post.authorId);
    return post;
})
// and all your existing code also still works, still run sum tests before go blind to production
```

## sourcecode
```js
require('express/lib/router/layer').prototype.handle_request = function handle(req, res, next) {
    var fn = this.handle;
    if (fn.length > 3) { return next(); }
    try {
        var promise = fn(req, res, next);
        if (typeof (promise) === 'object' && typeof (promise.catch) === 'function' && typeof (promise.then) === 'function') {
            promise.then((data) => {
                try {
                    if (data !== undefined) res.json(data);
                } catch (err) {/*ignore error*/ }
            });
            promise.catch(next);
        }
    } catch (err) { next(err); }
}; 
```

### comparisons
there are different aproaches:
similar aproach with different opinion about handling the resolve value of that promise.
- express-async-errors: not handling the response value of a promise

replacing the 'all','use','del',[verb] methods on the routers.
- express-promise-router: also is handling promise resolve only with the values "next" and "route"
- express-asyncify

Create a subclass
- express-as-promised: is extending the Router class

let you wrap every handler into a promise handling method.
- promised-routing
- async-middleware
- express-wrap-async
- express-async-wrap
- express-async-handler

At this point I am not clear what aproach will be in general the best, as still more projects get started with express then with koa.js I would also like to see a change in version express 5. Using this patch module, the code with express get much cleaner, so that there is very little reason to switch to an other framework. In this module you see the opinion of not just catching the error but also returning JSON.

