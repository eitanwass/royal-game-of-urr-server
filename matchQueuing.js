const Match = require('./match');
const User = require('./user');
const utils = require('./utils');

const quickMatchQueue = [];
const matches = [];


const createMatch = (user0, user1) => {
    console.log("New Match for " + user0.username + " and " + user1.username);
    let matchName = utils.genHash(user0.username + user1.username);
    let newMatch = new Match.Match(matchName, user0, user1);
    matches.push(newMatch);
    newMatch.gameEvents();
};

const findQuickMatch = (user) => {
    console.log("Joined Queue: " + user.username);
    if (quickMatchQueue.length > 0) {
        let otherUser = quickMatchQueue.pop();
        createMatch(user, otherUser);
    } else {
        quickMatchQueue.push(user);
        user.socket.emit('joined-queue');
    }
};

exports.queuing_actions = (socket) => {
    socket.on('quick_match', ({username}) => {
        let user = new User.User(username, socket);
        findQuickMatch(user);
    });

    socket.on('ranked_match', ({username}) => {
        let user = new User.User(username, socket);
        // TODO: Add different function to ranked.
        findQuickMatch(user);
    });
};