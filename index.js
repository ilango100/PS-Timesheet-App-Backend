const hapi = require('hapi');
const inert = require('inert');
const mysql = require('mysql');

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
