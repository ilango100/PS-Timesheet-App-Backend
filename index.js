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

defPaths = [
	'/break',
	'/details'
];

for (let i=0; i< defPaths.length; i++) {
server.route({
	method: 'GET',
	path: defPaths[i],
	handler: function(req,reply) {
		reply().redirect('/').temporary();
	}
});
}

server.route({
	method: 'POST',
	path: '/login',
	handler: function(req,resp) {
		if (req.payload != null && req.payload != undefined && req.payload['user'] != null && req.payload['user'] != undefined && req.payload['pass'] != null && req.payload['pass'] != undefined) {
		//Do db operation
		dbconn.query("select * from users where username=? and password=?",[req.payload['user'],req.payload['pass']],function(err,res,fld) {
			if (err)
				console.log("Error while querying...",err.message);
			if (res.length < 1) {
				return resp({
					login: false,
				}).type("application/json");
			} else {
				return resp({
					login: true,
				}).type("application/json");
			}
		})
		} else {
		return resp({
			login: false,
		}).type("application/json");
		}
	}
});

server.route({
	method: 'POST',
	path: '/register',
	handler: function(req,rep) {
		if (req.payload != null && req.payload != undefined &&
			req.payload['user'] != null && req.payload['user'] != undefined &&
			req.payload['pass'] != null && req.payload['pass'] != undefined &&
			req.payload['email'] != null && req.payload['email'] != undefined) {

				//check for email
				dbconn.query("select * from users where email=?",req.payload['email'],function(err,res,flds) {
					if (err) {
						console.log("Email check query failed");
						return rep({
							register: false,
							error: 'query',
						}).type("application/json")
					}
					if (res != null && res.length > 0) {
						return rep({
							register: false,
							error : 'email',
						}).type('application/json')
					} else {
						//check for username
						dbconn.query("select * from users where username=?",req.payload['user'],function(er,rs,fld) {
							if (er) {
								console.log("User query check failed");
								return rep({
									register: false,
									error: 'query'
								}).type("application/json")
							}
							if (rs != null && rs.length > 0) {
								return rep({
									register: false,
									error: 'user',
								}).type('application/json')
							} else {
								//create user
								if (req.payload['dob'] == '')
									dbconn.query("insert into users (username,password,email) values (?,?,?)",
										[req.payload['user'],req.payload['pass'],req.payload['email']],
										function(e,r,f) {
											if (e) {
												console.log(e)
												return rep({
													register: false,
													error: 'query',
												}).type("application/json")
											}
											if (r != null) {
												dbconn.query("create table "+req.payload['user']+"_ts (date DATE NOT NULL PRIMARY KEY,work DECIMAL(4.2), CHECK (work <= 24))",function(erro,resu,fild){
													if (erro){
														console.log(erro)
														return rep({
															register: false,
															error: 'query',
														}).type('application/json')
													} else {
														console.log(req.payload['user']+" registered")
														return rep({
															register: true,
														}).type("application/json")
													}
												})
											}
										})
								else
									dbconn.query("insert into users (username,password,dob,email) values (?,?,?,?)",
										[req.payload['user'],req.payload['pass'],req.payload['dob'],req.payload['email']],
									function(e,r,f){
										if (e) {
											console.log(e)
											return rep({
												register: false,
												error: 'query',
											}).type("application/json")
										}
										if (r != null) {
											dbconn.query("create table "+req.payload['user']+"_ts (date DATE NOT NULL PRIMARY KEY,work DECIMAL(4.2), CHECK (work <= 24))",function(erro,resu,fild){
													if (erro){
														console.log(erro)
														return rep({
															register: false,
															error: 'query',
														}).type('application/json')
													} else {
														console.log(req.payload['user']+" registered")
														return rep({
															register: true,
														}).type("application/json")
													}
												})
										}
									})
							}
						})
					}
				});

		} else {
			return rep({
				register: false,
			}).type('application/json');
		}
	}
});

server.start((err) => {
	if (err)
		throw err;

	console.log("Server running...");
});
