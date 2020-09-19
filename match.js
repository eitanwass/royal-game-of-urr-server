const utils = require('./utils');
const {sendQuery} = require('./dbActions');

class Match {
    constructor(roomId, user0, user1, onEnd) {
        this.roomId = roomId;
        this.user0 = user0;
        this.user1 = user1;

        this.playersJoined = 0;

        this.playerTurn = 0;
        this.players = [user0, user1];

        this.onEnd = onEnd;

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

    incWins(userData) {
        const incWinsRes = sendQuery("UPDATE users set WINS=WINS+1 WHERE EMAIL=?;", [userData['email']]);
    }

    incLosses(userData) {
        const incLossesRes = sendQuery("UPDATE users set LOSSES=LOSSES+1 WHERE EMAIL=?;", [userData['email']]);
    }

    gameEvents() {
        this.user0.socket.on('joined-game', () => {
            this.playerJoined();
        });
        
        this.user1.socket.on('joined-game', () => {
            this.playerJoined();
        });


        this.user0.socket.on('won-game', () => {
            this.incWins(this.user0.userData);
            this.incLosses(this.user1.userData);
        });
        
        this.user1.socket.on('won-game', () => {
            this.incWins(this.user1.userData);
            this.incLosses(this.user0.userData);
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


        this.user0.socket.on('exit-match', () => {
            // Add wins and losses.
            this.user1.socket.emit('opponent-forfeit');
            this.onEnd(this);
        });

        this.user1.socket.on('exit-match', () => {
            // Add wins and losses.
            this.user0.socket.emit('opponent-forfeit');
            this.onEnd(this);
        });
    }
}

module.exports.Match = Match;
