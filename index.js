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

dbconn.query("show databases",function(err,results,field) {
	if (err) {
		console.log("Error querying...",err.message);
		process.exit(1);
	}
	let ourdb = results.find(o => o.Database == 'timesheet');
	if (ourdb != null && ourdb != undefined && ourdb['Database'] != null) {
		console.log("Database exists...");
	} else {
		console.log("Database doesnot exist, creating...");
		dbconn.query("create database timesheet",function(er,res,f) {
			if (err) {
				console.log("Error creating database...",er.message)
				process.exit(1);
			}
		});
	}
	dbconn.query("use timesheet",function(er,res,fl) {
		if (er) {
			console.log("Error while using timesheet database...")
		}
		//Setup tables
		dbconn.query("show tables",function(e,r,f) {
			if (e) {
				console.log("Error querying tables...",e.message);
				process.exit(1);
			}
			let ourtb = r.find(o => o.Tables_in_timesheet == 'users');
			if (ourdb != null && ourtb != undefined && ourtb['Tables_in_timesheet'] != null) {
				console.log("Users table exists...");
			} else {
				console.log("Users table doesnot exist, creating...");
				dbconn.query("create table users (username VARCHAR(20) NOT NULL PRIMARY KEY, password VARCHAR(12) NOT NULL,\
				dob DATE, email VARCHAR(50) NOT NULL UNIQUE)",function(f,s,g) {
					if (f) {
						console.log("Error creating table...",f.message)
						process.exit(1);
					}
					console.log("Successfully created users table...");
				});
			}
		});
	})
});

//Start server
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
