const config = {
  host    : 'localhost',
  user    : 'jalilgroup_balu',
  password: 'B@lmca28',
  database: 'balu_iikData',
  connectionLimit: 25,
};

// mysqlUtil.setConnection({
//   host: process.env.DB_HOST, //database host, eg: localhost
//   user: process.env.DB_USER, // database user, eg: root
//   password: process.env.DB_PASSWORD, //database password,eg: anything
//   database: process.env.DB_NAME // database name, eg: anything,
//   connectionLimit: 25 // connection Limit(Integer)
// });
module.exports = config;
