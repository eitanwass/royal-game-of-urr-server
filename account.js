const utils = require('./utils');
const MongoClient = require('mongodb').MongoClient;

const dbName = "Urr";
const dbAdminUsername = "dbAdmin";
const dbAdminPassword = "zL56g4Gtghq2kQbb";

const dbUri = `mongodb+srv://${dbAdminUsername}:${dbAdminPassword}@urr.uguke.mongodb.net/${dbName}?retryWrites=true&w=1"`

const client = new MongoClient(dbUri, { useNewUrlParser: true,
                                        useUnifiedTopology: true });

exports.account_actions = (socket) => {

    socket.on('register', (properties) => {
        email = properties['email']
        username = properties['username'];
        password = properties['password'];

        console.log(`Register: email=${email} username=${username} password=${password}`);

        client.connect( (err) => {
            if (err) {
                throw err;
            }

            const collection = client.db("urr").collection("users");
            collection.findOne({email: email}).then( (err, result) => {
                if (err) {
                    console.log("Register failed. Email already exists.");
                    socket.emit('register-failed', "Register failed. Email already exists.");
                } else {
                    new_user = {email: email,
                                username: username,
                                password: password};
                    collection.insertOne(new_user).then( result => {
                        console.log("Register succeeded on " + utils.getTime());
                        socket.emit('register-success', "Register succeeded on " + utils.getTime());
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
        email = properties['email'];
        password = properties['password'];

        console.log(`Login: email=${email} password=${password}`);

        client.connect( (err) => {
            if (err) {
                // console.trace("An error has occured ->")
                console.log("An error on connection")
                throw err;
            }

            const collection = client.db("urr").collection("users");
            const query = {email: email,
                            password: password};
            collection.findOne(query).then( (result) => {
                if (result) {
                    console.log("Login succeeded on " + utils.getTime());
                    socket.emit('login-success', "Login succeeded on " + utils.getTime());
                } else {
                    console.log("Login failed. Email or password is incorrect.");
                    socket.emit('login-failed', "Login failed. Email or password is incorrect.");
                }
            }).catch((err) => {
                throw err;
            });
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
};
