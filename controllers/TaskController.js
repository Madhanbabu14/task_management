const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const Task = __db_model.Task;
const fs = require('fs');
const path = require('path');
const tasksFilePath = path.join(__dirname, 'tasks.json');

router.use(bodyParser.json());

const readTasksFromFile = () => {
    try {
        const data = fs.readFileSync(tasksFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeTasksToFile = (tasks) => {
    try {
        fs.writeFileSync(tasksFilePath, JSON.stringify(tasks));
    } catch (error) {
        console.error('Error writing to file', error);
    }
};

router.get('/', async (req, res) => {
    try {
        const task = await Task.findAll({
            raw: true,
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        });
        return res.status(200).send(task);
    } catch (error) {
        return res.status(500).send('Problem in finding task');
    }
});

router.get('/status/:status', async (req, res) => {
    try {
        const task = await Task.findAll({
            raw: true,
            where: { status: req.params.status },
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        });
        return res.status(200).send(task);
    } catch (error) {
        return res.status(500).send('Problem in finding filtered task');
    }
});

router.post('/', async (req, res) => {
    try {
        req.body.status = 'pending';
        const createdTask = await Task.create(req.body);

        const task = createdTask.toJSON();
        delete task.createdAt;
        delete task.updatedAt;

        const tasksFromFile = readTasksFromFile();
        tasksFromFile.push(task);
        writeTasksToFile(tasksFromFile);

        return res.status(201).send({ message: 'Task created successfully', task });
    } catch (error) {
        return res.status(500).send('Error creating task');
    }
});

router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findOne({ where: { id: req.params.id } });
        if (!task) return res.status(404).send({ error: 'Task not found' });

        await Task.update(req.body, { where: { id: req.params.id } });

        const tasksFromFile = readTasksFromFile();
        
        const taskIndex = tasksFromFile.findIndex(t => String(t.id) === String(req.params.id));
        if (taskIndex !== -1) {
            tasksFromFile[taskIndex] = { ...tasksFromFile[taskIndex], ...req.body };
            writeTasksToFile(tasksFromFile);
        }

        const updatedTask = await Task.findOne({
            raw: true,
            where: { id: req.params.id },
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        });

        return res.status(200).send({ message: 'Task updated successfully', task: updatedTask });
    } catch (error) {
        return res.status(500).send('Error updating task');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findOne({ where: { id: req.params.id } });
        if (!task) return res.status(404).send({ error: 'Task not found' });

        await Task.destroy({ where: { id: req.params.id } });

        const tasksFromFile = readTasksFromFile();
        const updatedTasks = tasksFromFile.filter(t => String(t.id) !== String(req.params.id));
        writeTasksToFile(updatedTasks);

        return res.status(200).send({ message: 'Task deleted successfully' });
    } catch (error) {
        return res.status(500).send('Error deleting task');
    }
});

module.exports = router;
