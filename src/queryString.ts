export function queryString (req,res,next) {
    console.log('in queryString'); 
    //console.log(req.body); 
    const key = JSON.stringify(req.body);
    //console.log(key); 
    res.locals.queryString = key; 
    return next(); 
}