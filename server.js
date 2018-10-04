//required npm modules
const express = require('express');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const session = require('express-session');
const uuid = require('uuid/v4');
var path = require('path');

const port = 3005;

const app = express();

var parseForm = bodyParser.urlencoded({ extended: false });


// initialize the cookie parser
app.use(cookieParser());

app.use(session({
    //uuid to create a session Id
    genid: (req) => {
        return uuid();
    },
    name: 'SESSION_ID',
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

// set a cookie
app.use(function (req, res, next) {

    var csrfCookie = req.cookies._csrf;
    if (csrfCookie === undefined)
    {
        // generate csrf token using uuid
        var csrfToken = uuid();

        //set csrf cookie
        res.cookie('_csrf',csrfToken,
            { maxAge: 900000,
                httpOnly: false });
        console.log('csrf cookie is created!');
    }
    next();
});


//route to index.html upon loading
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'index.html'));
});

// The endpoint receives the session cookie
// According to the session identifier the CSRF token is returned
app.post('/middle', parseForm, function (req, res) {
    var token = req.session.csrfToken; //middleware token
    res.json({ csrfToken: token });
});

app.post('/login', parseForm, function (req, res, next) {

    if((req.body.username == 'ish') && (req.body.password == '123'))
    {
        if(req.cookies._csrf !== req.body._csrf) {
            console.log('Invalid CSRF Token!');
            let err = new Error('Invalid CSRF Token!');
            err.status = 403;
            return next(err);
        }
        res.send(`<h1>Login Success ${req.body.username} </h1> <h5>CSRF token is valid</h5>`);
    }
    else {
        res.send(`<h1>Invalid Username or Password </h1>`);
    }

});

//print on console that the server is listening on port 3000
app.listen(port, () => {
    console.log(`Listening on localhost:${port}`);

});