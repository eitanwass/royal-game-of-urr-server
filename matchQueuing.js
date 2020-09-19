const utils = require('./utils');
const {Match} = require('./match');

const quickMatchQueue = [];
const matches = [];


const createMatch = (user0, user1) => {
    console.log("New Match for " + user0.username + " and " + user1.username);

    let matchName = utils.genHash(user0.username + user1.username);
    let newMatch = new Match(matchName, user0, user1, removeMatch);

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

const removeFromQueue = (user) => {
    let userIndex = quickMatchQueue.indexOf(user);

    if (userIndex != -1) {
        quickMatchQueue.splice(userIndex, 1);
        console.log("Removed user '" + user.username + "' from match queue.");
    }
};

const removeMatch = (match) => {
    let matchIndex = matches.indexOf(match);

    if (matchIndex != -1) {
        matches.splice(matchIndex, 1);
        console.log("Removed match '" + match.roomId + "'");
    }
};


module.exports.findQuickMatch = findQuickMatch;
module.exports.removeFromQueue = removeFromQueue;
module.exports.removeMatch = removeMatch;
