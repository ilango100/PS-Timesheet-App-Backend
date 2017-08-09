const hapi = require('hapi')
const inert = require('inert')

const server = new hapi.Server();
server.connection({
    port: 80,
    routes: {
        files: {
            relativeTo: '../PS-Timesheet-App'
        }
    }
});

server.register(inert,() => {})

server.route({
    method: 'GET',
    path: '/{path*}',
    handler: {
        directory: {
            path: 'src',
            index: true,
            redirectToSlash: true
        }
    }
});

server.route({
    method: 'GET',
    path: '/node_modules/{path*}',
    handler: {
        directory: {
            path: 'node_modules',
            index: false
        }
    }
});

server.start((err) => {
    if (err)
        throw err;

    console.log("Server running...");
})