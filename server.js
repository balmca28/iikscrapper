const  mysql = require('mysql');
const app = require('./app');

const port =  process.env.PORT || 80;

app.listen(port, (req, res)=>{
    console.log(`Server is running on ${port}`);
})


