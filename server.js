const { debug } = require('console');
const account = require('./account');
const matchQueuing = require('./matchQueuing');

const port = process.env.port || 80;

var io = require('socket.io')(port);

io.on('connection', (socket) => {
    console.log('Client Connected');

    account.account_actions(socket);

    matchQueuing.queuing_actions(socket);
});