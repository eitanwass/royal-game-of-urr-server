const { debug } = require('console');
const account = require('./account');
const matchQueuing = require('./matchQueuing');

const port = process.env.PORT || 80;

var io = require('socket.io')(port);

io.on('connection', (socket) => {
    console.log('Client Connected');

    account.account_actions(socket);
});