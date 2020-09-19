require('dotenv').config();

const utils = require('./utils');
const { User } = require('./user');
const {removeFromQueue} = require('./matchQueuing');
const {sendQuery} = require('./dbActions');

const connectedUsers = [];

exports.account_actions = (socket) => {

    socket.on('register', (properties) => {
        email = properties['email']
        username = properties['username'];
        password = properties['password'];

        console.log(`Register: email=${email} username=${username} password=${password}`);

        const emailExistsRes = sendQuery("SELECT * FROM users WHERE EMAIL=? LIMIT 1;", [email]);

        emailExistsRes.then((res) => {
            if (res.length > 0) {
                console.log("Register failed. Email already exists.");
                socket.emit('register-failed', "Register failed. Email already exists.");
            } 
            else {
                const registerInsertRes = sendQuery("INSERT INTO users (EMAIL, USERNAME, PASSWORD) VALUES (?, ?, ?);", [email, username, password]);
    
                registerInsertRes.then((res) => {
                    if (res['affectedRows'] > 0) {
                        const avatar = utils.generateUserAvatar(email);
                      
                        console.log("Register succeeded on " + utils.getTime());
                      
                        socket.emit('avatar-image', 'data:image/png;base64,' + avatar.toString('base64'));
                        socket.emit('register-success', "Register succeeded on " + utils.getTime());
                    } else {
                        console.log("Register failed. Something went wrong in insertion of new user: " + err);
                        socket.emit('register-failed', "Something went wrong in registration process.");
                    }
                });
            }
        });
    });

    socket.on('login', (properties) => {
        email = properties['email'];
        password = properties['password'];

        console.log(`Login: email=${email} password=${password}`);

        const loginCheckRes = sendQuery("SELECT * FROM users WHERE EMAIL=? AND PASSWORD=? LIMIT 1;", [email, password]);

        loginCheckRes.then((res) => {
            if (res.length > 0) {
                const loginTime = utils.getTime();
    
                const newUser = new User(res[0], socket);
                connectedUsers.push(newUser);
    
                console.log("Login succeeded on " + loginTime);
    
                const loginInfo = {
                    'username': newUser.username,
                    'loginTime': loginTime
                };
                socket.emit('login-success', loginInfo);
            } 
            else {
                console.log("Login failed. Email or password is incorrect.");
                socket.emit('login-failed', "Login failed. Email or password is incorrect.");
            }
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
