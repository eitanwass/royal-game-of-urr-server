const { debug } = require('console');
const account = require('./account');
const matchQueuing = require('./matchQueuing');

var io = require('socket.io')(80);

io.on('connection', (socket) => {
    console.log('Client Connected');

    account.account_actions(socket);

    matchQueuing.queuing_actions(socket);
});