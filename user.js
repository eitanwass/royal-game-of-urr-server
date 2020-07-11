const utils = require('./utils')

const active_users = new Set();
const users = {'admin': 'admin',
                'eitan': '123'};

exports.account_actions = (socket) => {

    socket.on('register', (properties) => {
        console.log('register');
    
        username = properties['username'];
        password = properties['password'];

        console.log(username);
        console.log(password);

        if(!(username in users)) {
            users[username] = password;
            
            socket.emit('register-success', "Register succeeded on " + utils.get_time());
            console.log("Register succeeded on " + utils.get_time());
            return;
        }
        
        console.log("Register failed. Username already exists.");
        socket.emit('register-failed', "Register failed. Username already exists.");
    });
    
    socket.on('login', (properties) => {
        console.log('login');
        
        username = properties['username'];
        password = properties['password'];

        console.log(username);
        console.log(password);

        if (username in users) {
            if (users[username] == password) {
                socket.user = username;
                active_users.add(username);

                socket.emit('login-success', "Login succeeded on " + utils.get_time());
                console.log("Login succeeded on " + utils.get_time())
                return;
            }
        }

        socket.emit('login-failed', "Username or password is incorrect.");
        console.log("Username or password is incorrect.");
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');

        active_users.delete(socket.user);
    })
}


exports.active_users = active_users;