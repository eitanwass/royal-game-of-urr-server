const crypto = require('crypto');

const hashSecret = "VeryComplicatedHashSecret";

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
