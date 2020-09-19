const { debug } = require('console');
const {account_actions} = require('./account');

const port = process.env.PORT || 80;

var io = require('socket.io')(port);

io.on('connection', (socket) => {
    console.log('Client Connected');

    account_actions(socket);
});