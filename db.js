const { Sequelize } = require('sequelize');

// PostgreSQL client configuration
const sequelize = new Sequelize('task_management', 'postgres', 'root', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: false
});

sequelize.sync().then(success => {
    console.log('Database connected successfully');
}, err => {
    console.log("There was a problem to connecting Database::: ", err);
});

var Task = sequelize.define('task', {   
    title: { type: Sequelize.STRING },
    description: { type: Sequelize.STRING },
    status: { type: Sequelize.STRING }
});

var client = {
    "Task": Task
}

module.exports = client;
