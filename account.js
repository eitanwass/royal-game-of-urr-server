const mysql = require('mysql');
const utils = require('./utils');
const MongoClient = require('mongodb').MongoClient;

const dbName = "Urr";
const dbAdminUsername = "dbAdmin";
const dbAdminPassword = "zL56g4Gtghq2kQbb";

const dbUri = `mongodb+srv://${dbAdminUsername}:${dbAdminPassword}@urr.uguke.mongodb.net/${dbName}?retryWrites=true&w=1"`

const client = new MongoClient(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const con = mysql.createConnection({
    host: "sql2.freesqldatabase.com",
    user: "sql2364384",
    password: "lI7!aA7*",
    database: "sql2364384"
});

exports.account_actions = (socket) => {

    socket.on('register', (properties) => {
        email = properties['email']
        username = properties['username'];
        password = properties['password'];

        console.log(`Register: email=${email} username=${username} password=${password}`);

        con.connect((err) => {
            if (err) {
                console.log("An error on connection.");
                throw err;
            }

            const emailExistsQuery = `SELECT * FROM Users WHERE EMAIL='${email}' LIMIT 1;`;

            con.query(emailExistsQuery, (err, result, fields) => {
                if (err) {
                    console.log("Error on query return.")
                    throw err;
                }
                if (result.length > 0) {
                    console.log("Register failed. Email already exists.");
                    socket.emit('register-failed', "Register failed. Email already exists.");
                    con.end();
                } else {
                    const registerInsertQuery = `INSERT INTO Users (EMAIL, USERNAME, PASSWORD) VALUES ('${email}', '${username}', '${password}');`;

                    con.query(registerInsertQuery, (err, result) => {
                        if (err) {
                            console.log("Error on query return.")
                            throw err;
                        }
                        if (result['affectedRows'] > 0) {
                            console.log(result);
                            console.log("Register succeeded on " + utils.getTime());
                            socket.emit('register-success', "Register succeeded on " + utils.getTime());
                            con.end();
                        } else {
                            console.log("Register failed. Something went wrong in insertion of new user: " + err);
                            socket.emit('register-failed', "Something went wrong in registration process.");
                            con.end();
                        }
                    });
                }
            });
        });
    });

    socket.on('login', (properties) => {
        email = properties['email'];
        password = properties['password'];

        console.log(`Login: email=${email} password=${password}`);

        con.connect((err) => {
            if (err) {
                console.log("An error on connection.");
                throw err;
            }

            const loginCheckQuery = `SELECT * FROM Users WHERE EMAIL='${email}' AND PASSWORD='${password}' LIMIT 1;`;

            con.query(loginCheckQuery, (err, result, fields) => {
                if (err) {
                    console.log("Error on query return.")
                    throw err;
                }
                if (result.length > 0) {
                    console.log(result);
                    console.log("Login succeeded on " + utils.getTime());
                    socket.emit('login-success', "Login succeeded on " + utils.getTime());
                    con.end();
                } else {
                    console.log("Login failed. Email or password is incorrect.");
                    socket.emit('login-failed', "Login failed. Email or password is incorrect.");
                    con.end();
                }
            });
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
};
