const { debug } = require('console');
const user = require('./user');

var io = require('socket.io')(443)

io.on('connection', (socket) => {
    console.log('Client Connected');

    user.account_actions(socket);
});