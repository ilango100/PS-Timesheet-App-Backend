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
            path: 'dist',
            index: true,
            redirectToSlash: true
        }
    }
});

server.start((err) => {
    if (err)
        throw err;

    console.log("Server running...");
})
