const express = require('express');
const app = express();

global.__db_model = require('./db');
app.use(express.json());

app.use('/tasks',require('./controllers/TaskController'))

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
