const mysql = require('mysql');

const mysqlConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
};

exports.sendQuery = (q, params) => {
    const con = mysql.createConnection(mysqlConfig);

    return new Promise((resolve, reject) => {
        con.connect((err) => {
            if (err) {
                console.log("An error on connection.");
                throw err;
            }
    
            const query = con.format(q, params);
    
            con.query(query, (err, result, fields) => {
                if (err) {
                    console.log("Error on query return.")
                    throw err;
                }
    
                con.end();
    
                resolve(result);
            });
        });
    });
};