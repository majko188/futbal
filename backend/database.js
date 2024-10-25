
            const mysql = require('mysql2');
            
            const db = mysql.createConnection({
              host: 'sql7.freemysqlhosting.net',
              user: 'sql7740631',
              password: 'P4YdmNmYyr',
              database: 'sql7740631',
              port: 3306
            });

            db.connect((err) => {
              if (err) throw err;
              console.log('Connected to MySQL Database!');
            });

            module.exports = db;
        