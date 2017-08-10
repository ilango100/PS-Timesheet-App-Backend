const hapi = require('hapi');
const inert = require('inert');
const mysql = require('mysql');

let args = process.argv.slice(2);
let msquser = "";
let msqpass = "";
if (args.length < 2) {
    console.log("Usage:",process.argv[0],process.argv[1],"username password");
    process.exit(1);
} else {
    msquser = args[0];
    msqpass = args[1];
}

let dbconn = mysql.createConnection({
    host: 'localhost',
    user: msquser,
    password: msqpass,
});

//Connect to mysql
dbconn.connect(err => {
    if (err) {
        console.log("Error connecting to db...",err.message);
        process.exit(1);
    }
    console.log("Connected to mysql server successfully...")
});

const server = new hapi.Server();
server.connection({
    port: 80,
    routes: {
        files: {
            relativeTo: '../PS-Timesheet-App'
        }
    }
});

server.register(inert,() => {});

server.route({
    method: 'GET',
    path: '/{path*}',
    handler: {
        directory: {
            path: 'dist',
            index: true,
            redirectToSlash: true
        }
    }
});

server.route({
    method: 'POST',
    path: '/login',
    handler: function(req,resp) {
	//Do db operation
    return resp({
        status: 'ok',
    }).type("application/json");
    }
});

server.start((err) => {
    if (err)
        throw err;

    console.log("Server running...");
});
