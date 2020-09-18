const mysql = require('mysql');
const utils = require('./utils');
const { User } = require('./user');
const {removeFromQueue} = require('./matchQueuing');

const connectedUsers = [];

const mysqlConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
};

exports.account_actions = (socket) => {

    socket.on('register', (properties) => {
        email = properties['email']
        username = properties['username'];
        password = properties['password'];

        console.log(`Register: email=${email} username=${username} password=${password}`);

        const con = mysql.createConnection(mysqlConfig);
        con.connect((err) => {
            if (err) {
                console.log("An error on connection.");
                throw err;
            }

            const emailExistsQuery = con.format("SELECT * FROM Users WHERE EMAIL=? LIMIT 1;", [email]);

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
                    const registerInsertQuery = con.format("INSERT INTO Users (EMAIL, USERNAME, PASSWORD) VALUES (?, ?, ?);", [email, username, password]);

                    con.query(registerInsertQuery, (err, result) => {
                        if (err) {
                            console.log("Error on query return.")
                            throw err;
                        }
                        if (result['affectedRows'] > 0) {
                            const avatar = utils.generateUserAvatar(email);
                          
                            console.log("Register succeeded on " + utils.getTime());
                          
                            socket.emit('avatar-image', 'data:image/png;base64,' + avatar.toString('base64'));
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

        const con = mysql.createConnection(mysqlConfig);
        con.connect((err) => {
            if (err) {
                console.log("An error on connection.");
                throw err;
            }

            const loginCheckQuery = con.format("SELECT * FROM Users WHERE EMAIL=? AND PASSWORD=? LIMIT 1;", [email, password]);

            con.query(loginCheckQuery, (err, result, fields) => {
                if (err) {
                    console.log("Error on query return.")
                    throw err;
                }
                if (result.length > 0) {
                    let loginTime = utils.getTime();

                    let newUser = new User(result[0], socket);
                    connectedUsers.push(newUser);

                    console.log("Login succeeded on " + loginTime);
                    let loginInfo = {
                        'username': newUser.username,
                        'loginTime': loginTime
                    };
                    socket.emit('login-success', loginInfo);
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
        let disconnectedUser = connectedUsers.find((user) => user.socket == socket);
        let disconnectedUserIndex = connectedUsers.indexOf(disconnectedUser);

        if (disconnectedUser != null) {
            console.log('User disconnected: ' + disconnectedUser.username);
            connectedUsers.splice(disconnectedUserIndex, 1);
            removeFromQueue(disconnectedUser);
        } else {
            console.log('user disconnected');
        }
    });
};


module.exports.connectedUsers = connectedUsers;
