const { debug } = require('console');
const {account_actions} = require('./account');

var io = require('socket.io')(80);

io.on('connection', (socket) => {
    console.log('Client Connected');

    account_actions(socket);
});