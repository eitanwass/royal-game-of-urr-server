const utils = require('./utils');
const {findQuickMatch} = require('./matchQueuing');

const usernameKey = 'USERNAME';
const emailKey = 'EMAIL';
const winsKey = 'WINS';
const lossesKey = 'LOSSES';

class User {
    constructor(userDict, socket) {
        this.username = userDict[usernameKey];
        this.email = userDict[emailKey];

        this.wins = userDict[winsKey];
        this.losses = userDict[lossesKey];

        this.socket = socket;

        this.userEvents();
    }

    userEvents() {
        this.socket.on('get-avatar', () => {
            const avatar = utils.generateUserAvatar(this.email);
            
            this.socket.emit('avatar-image', 'data:image/png;base64,' + avatar.toString('base64'));
        });

        this.socket.on('get-wins-losses',  () => {
            let data = {
                'wins': this.wins,
                'losses': this.losses
            }
            this.socket.emit('update-wins-losses', data);
        });

        this.socket.on('quick_match', () => {
            findQuickMatch(this);
        });
    
        this.socket.on('ranked_match', () => {
            // TODO: Add different function to ranked.
            findQuickMatch(this);
        });
    }
}

module.exports.User = User;
