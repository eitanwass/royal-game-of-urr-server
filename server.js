const { debug } = require('console');
const user = require('./user');

var io = require('socket.io')(443)

io.configure(function () { 
    io.set("transports", ["xhr-polling"]); 
    io.set("polling duration", 10); 
});

io.on('connection', (socket) => {
    console.log('Client Connected');

    user.account_actions(socket);
});