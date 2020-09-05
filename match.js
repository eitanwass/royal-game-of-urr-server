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
        console.log("Got new player joined");
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

        console.log("Passed turn to " + this.players[this.playerTurn].username);
    }

    joinMatchRoom() {
        this.user0.socket.emit('found-match', this.user1.username);
        this.user1.socket.emit('found-match', this.user0.username);

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
    }
}

module.exports.Match = Match;
