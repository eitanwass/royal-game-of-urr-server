const utils = require('./utils');

class Match {
    constructor(roomId, user0, user1) {
        this.roomId = roomId;
        this.user0 = user0;
        this.user1 = user1;

        this.playersJoined = 0;

        this.playerTurn = 0;
        this.players = [user0, user1];

        this.joinMatchRoom();

        this.setupRoom();
    }

    setupRoom() {
        this.players = utils.simpleShuffle(this.players);
    };

    playerJoined() {
        this.playersJoined++;
        if (this.playersJoined == this.players.length) {
            this.informPlayersStatus();
        }
    }

    informPlayersStatus() {
        for (let x = 0; x < this.players.length; x++) {
            this.players[x].socket.emit('setup-side', x);
        }

        this.players[0].socket.emit('your-turn');

        console.log("Start with " + this.players[0].username + "'s turn");
    }

    passTurn() {
        this.playerTurn += 1;
        if (this.playerTurn >= this.players.length) {
            this.playerTurn = 0;
        }

        this.players[this.playerTurn].socket.emit('your-turn');
    }

    joinMatchRoom() {
        this.user0.socket.emit('found-match', this.user1.userData);
        this.user1.socket.emit('found-match', this.user0.userData);

        this.user0.socket.join(this.roomId);
        this.user1.socket.join(this.roomId);
    }

    gameEvents() {
        this.user0.socket.on('joined-game', () => {
            this.playerJoined();
        });
        this.user1.socket.on('joined-game', () => {
            this.playerJoined();
        });


        this.user0.socket.on('pass-turn', () => {
            this.passTurn();
        });

        this.user1.socket.on('pass-turn', () => {
            this.passTurn();
        });


        this.user0.socket.on('move-piece', (properties) => {
            this.user1.socket.emit('move-piece', properties);
        });

        this.user1.socket.on('move-piece', (properties) => {
            this.user0.socket.emit('move-piece', properties);
        });


        this.user0.socket.on('send-message', (properties) => {
            this.user1.socket.emit('receive-message', properties);
        });

        this.user1.socket.on('send-message', (properties) => {
            this.user0.socket.emit('receive-message', properties);
        });
    }
}

module.exports.Match = Match;
