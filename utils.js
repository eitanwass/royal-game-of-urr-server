const crypto = require('crypto');
const jdenticon = require('jdenticon');

const hashSecret = "VeryComplicatedHashSecret";
const userIconSize = 128;

exports.getTime = () => {
    let date = new Date();

    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    let min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    let sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    let year = date.getFullYear();

    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    let day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return day + "/" + month + "/" + year + "-" + hour + ":" + min + ":" + sec;
};

exports.genHash = (data) => {
    return crypto.createHash('md5').update(data + hashSecret).digest('hex');
};

exports.simpleShuffle = (arr) => {
    return (arr.sort(() => Math.random() - 0.5));
};

exports.generateUserAvatar = (username) => {
    return jdenticon.toPng(username, userIconSize);
};
