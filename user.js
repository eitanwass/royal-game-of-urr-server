const utils = require('./utils');
const {findQuickMatch, removeFromQueue} = require('./matchQueuing');
const {sendQuery} = require('./dbActions');

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
            'email': this.email,
            'avatar': utils.generateUserAvatar(this.email).toString('base64')
        }
    };

    userEvents() {
        this.socket.on('get-avatar', () => {
            const avatar = utils.generateUserAvatar(this.email);
            
            this.socket.emit('avatar-image', 'data:image/png;base64,' + avatar.toString('base64'));
        });

        this.socket.on('get-wins-losses',  () => {
            const winsLossesRes = sendQuery("SELECT WINS,LOSSES FROM users WHERE EMAIL=? LIMIT 1;", [this.email]);

            winsLossesRes.then((res) => {
                res = res[0];
                this.wins = res['WINS'];
                this.losses = res['LOSSES'];

                let data = {
                    'wins': this.wins,
                    'losses': this.losses
                }
                this.socket.emit('update-wins-losses', data);
            });
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
