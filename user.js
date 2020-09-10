const utils = require('./utils');
const {findQuickMatch, removeFromQueue} = require('./matchQueuing');

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

    get userData() {
        return {
            'username': this.username,
            'avatar': utils.generateUserAvatar(this.email).toString('base64')
        }
    };

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

        this.socket.on('quick-match', () => {
            findQuickMatch(this);
        });

        this.socket.on('cancel-match', () => {
            removeFromQueue(this);
        });
    }
}

module.exports.User = User;
