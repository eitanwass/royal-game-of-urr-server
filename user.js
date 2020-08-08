const utils = require('./utils');
const MongoClient = require('mongodb').MongoClient;

const dbName = "Urr";
const dbAdminUsername = "dbAdmin";
const dbAdminPassword = "zL56g4Gtghq2kQbb";

const dbUri = `mongodb+srv://${dbAdminUsername}:${dbAdminPassword}@urr.uguke.mongodb.net/${dbName}?retryWrites=true&w=1"`

const client = new MongoClient(dbUri, { useNewUrlParser: true,
                                        useUnifiedTopology: true });
const active_users = new Set();

exports.account_actions = (socket) => {

    socket.on('register', (properties) => {    
        username = properties['username'];
        password = properties['password'];

        console.log(`Register: username=${username} password=${password}`);

        client.connect( (err) => {
            if (err) {
                throw err;
            }

            const collection = client.db("urr").collection("users");
            collection.findOne({username: username}).then( (err, result) => {
                if (err) {
                    console.log("Register failed. Username already exists.");
                    socket.emit('register-failed', "Register failed. Username already exists.");
                } else {
                    new_user = {username: username,
                                password: password};
                    collection.insertOne(new_user).then( result => {
                        console.log("Register succeeded on " + utils.get_time());
                        socket.emit('register-success', "Register succeeded on " + utils.get_time());
                    }).catch ((err) => {
                        console.log("Register failed. Something went wrong in insertion of new user: " + err);
                        socket.emit('register-failed', "Something went wrong in registration process.");
                    });
                }
            }).catch((err) => {
                throw err;
            });
        });
    });
    
    socket.on('login', (properties) => {
        username = properties['username'];
        password = properties['password'];

        console.log(`Login: username=${username} password=${password}`);

        client.connect( (err) => {
            if (err) {
                throw err;
            }

            const collection = client.db("urr").collection("users");
            const query = {username: username,
                            password: password};
            collection.findOne(query).then( (result) => {
                if (result) {
                    console.log("Login succeeded on " + utils.get_time());
                    socket.emit('login-success', "Login succeeded on " + utils.get_time());
                } else {
                    console.log("Login failed. Username or password is incorrect.");
                    socket.emit('login-failed', "Login failed. Username or password is incorrect.");
                }
            }).catch((err) => {
                throw err;
            });
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');

        active_users.delete(socket.user);
    })
}


exports.active_users = active_users;