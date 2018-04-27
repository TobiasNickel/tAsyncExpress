/**
 * this module monkey patches the express/router/layer to allow async handlers
 */

require('express/lib/router/layer').prototype.handle_request = function handle(req, res, next) {
    var fn = this.handle;
    if (fn.length > 3) { return next(); }
    try {
        var promise = fn(req, res, next);
        if (typeof (promise) === 'object' && typeof (promise.catch) === 'function' && typeof (promise.then) === 'function') {
            promise.then((data) => {
                try {
                    if (data !== undefined){
                        if(typeof(data) == 'string'){
                            res.send(data);
                        }else if(typeof(data)==='object'){
                            res.json(data);
                        }
                    } 
                } catch (err) {/*ignore error*/ }
            });
            promise.catch(next);
        }
    } catch (err) { next(err); }
}; 