class Match {
    constructor(roomId, user0, user1) {
        this.roomId = roomId;
        this.user0 = user0;
        this.user1 = user1;
    }

    joinMatchRoom() {
        this.user0.socket.emit('found-match', this.user1.username);
        this.user1.socket.emit('found-match', this.user0.username);

        this.user0.socket.join(this.roomId);
        this.user1.socket.join(this.roomId);
    }
}

module.exports.Match = Match;
