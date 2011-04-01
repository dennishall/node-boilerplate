var googleAnalyticsSiteId = 'UA-XXXXX-X';

// resolve dependencies
require(__dirname + "/lib/setup")
   .ext(__dirname + "/lib")
   .ext(__dirname + "/lib/express/support");
// end require block

var connect = require('connect'),
    express = require('express'),
    sys = require('sys'),
    io = require('Socket.IO-node'),
    port = process.env.PORT || 8081;
// end var block

// set up express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.use(connect.bodyDecoder());
    server.use(connect.staticProvider(__dirname + '/static'));
    server.use(server.router);
});

//set up the error handlers
server.error(function(err, req, res, next){
    if ( err instanceof NotFound ) {
        res.render('404.ejs', {locals: {
            header: '#Header#',
            footer: '#Footer#',
            title: '404 - Not Found',
            description: '',
            author: '',
            googleAnalyticsSiteId: googleAnalyticsSiteId
        }, status: 404 });
    } else {
        res.render('500.ejs', {locals: {
            header: '#Header#',
            footer: '#Footer#',
            title : 'The Server Encountered an Error',
            description: '',
            author: '',
            googleAnalyticsSiteId: googleAnalyticsSiteId,
            error: err
        }, status: 500 });
    }
});
server.listen( port );

//Setup Socket.IO
var io = io.listen(server);
io.on('connection', function(client){
    console.log('Client Connected');
    client.on('message', function(message){
        client.broadcast(message);
        client.send(message);
    });
    client.on('disconnect', function(){
        console.log('Client Disconnected.');
    });
});


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
    res.render('index.ejs', {locals: {
        header: '#Header#',
        footer: '#Footer#',
        title : 'Page Title',
        description: 'Page Description',
        author: 'Your Name',
        googleAnalyticsSiteId: googleAnalyticsSiteId,
        port: port
    }});
});


// a route for creating a 500 error (useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

// the 404 route (ALWAYS keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port);
