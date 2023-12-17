const express = require('express');
const bodyParser = require('body-parser');
const { 
  requestsLogger, taskLogger,
  requestInfoLogger, requestDebugLogger, requestErrorLogger,
  createNewTaskInfoLogger, createNewTaskDebugLogger, 
  getTasksCountInfoLogger,
  getTasksDataInfoLogger, getTasksDataDebugLogger,
  updateTaskPriorityInfoLogger, updateTaskPriorityDebugLogger,
  deleteTaskInfoLogger, deleteTaskDebugLogger, 
  errorLogger, setLoggerLevel} = require('./loggers'); 
const {saveToFile, loadFromFile} = require('./DatsStorage');

const app = express();
const PORT = 3000
let tasksIdCounter =1;
let tasks = [];

app.use(bodyParser.json());
app.use(requestInfoLogger);
app.use(requestDebugLogger);

// ===> Load data from file 
tasksIdCounter = loadFromFile(tasks);
///////////////////////////


// *ENDPOINT* ======> Check if the server is running 
app.get('/task', (req, res) => {
  res.status(200).json({
  result: 'OK'});
});

// *ENDPOINT* ======> Create new task
app.post('/task/create', (req, res) => {
  const { title, description, deadline, priority } = req.body;
  if(!title || !description || !deadline || !priority ){
    const errorMessage= "Invalid Details";
    errorLogger(errorMessage);
    return res.status(404).json({
      errorMessage: errorMessage
    });
  }
  
  if (deadline <= Date.now()) {
    const errorMessage= "Can't create new task that it's deadline is over";
    errorLogger(errorMessage);
    return res.status(409).json({
      errorMessage: errorMessage
    });
  }

  if (!['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
    const errorMessage = 'The priority should be one of this: HIGH, MEDIUM or LOW';
    return res.status(400).json({
      errorMessage: errorMessage
    })

  }
 
  const existingTask = tasks.find(task => task.title === title);
  if (existingTask) {
    const errorMessage= `The title [${title}] already exists in the system`;
    errorLogger(errorMessage);
    return res.status(409).json({
      errorMessage: errorMessage
    });
  }
  createNewTaskInfoLogger(title);
  const newTask = {
    id: tasksIdCounter++,
    title: title,
    description: description,
    deadline: deadline,
    priority: priority
  };
  tasks.push(newTask);
  
  res.status(201).json({
    result: "A new task has been added to the system",
    taskId: newTask.id
  });
  
  createNewTaskDebugLogger (tasks.length -1, newTask.id);
});

// *ENDPOINT* ======> Get the amount of tasks by priority
app.get('/task/size', (req, res) => { 
  const priority = req.query.priority;
    
    if (!['ALL', 'HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
      return res.status(400).json({
        errorMessage: 'Invalid priority parameter'
      });
    }
    
    const filteredTasks = priority === 'ALL' ? tasks : tasks.filter((task) => task.priority === priority);
    const filteredTasksCount = filteredTasks.length;
    const filteredTasksById = filteredTasks.map(task => task.id)
    
    res.status(200).json({
      result: filteredTasksCount,
      tasksID: filteredTasksById
    });
    
    getTasksCountInfoLogger(priority, tasks.length)
  });
  
 // *ENDPOINT* ======> Get tasks data
app.get('/task/data', (req, res) => {
  const priority = req.query.priority || 'ALL';
  const sortBy = req.query.sortBy || 'ID';
  getTasksDataInfoLogger(sortBy, priority);

  if (!['ALL', 'HIGH', 'MEDIUM', 'LOW'].includes(priority) || !['ID', 'DEADLINE', 'TITLE'].includes(sortBy)) {
    return res.status(400).json({
      errorMessage: 'Invalid priority or sortBy parameter'
    });
  }

  const filteredTasks = priority === 'ALL' ? tasks : tasks.filter(task => task.priority === priority);

  if (sortBy === 'DEADLINE') {
    filteredTasks.sort((taskA, taskB) => taskA.deadline - taskB.deadline);
  } else if (sortBy === 'TITLE') {
    filteredTasks.sort((taskA, taskB) => taskA.title.localeCompare(taskB.title));
  } else if (sortBy) {
    filteredTasks.sort((taskA, taskB) => taskA.id - taskB.id);
  }

  res.status(200).json(filteredTasks);
  getTasksDataDebugLogger(tasks.length, filteredTasks.length);
});

  // *ENDPOINT* ======> Update task priority
  app.put('/task/priority', (req, res) => {
    const id = parseInt(req.query.id);
    const newPriority = req.query.priority;
    
    updateTaskPriorityInfoLogger(id, newPriority);

    const taskToUpdate = tasks.find(task => task.id === id);
    if (!taskToUpdate) {
      const errorMessage= `Task with Id ${id} not found.`;
      errorLogger(errorMessage);
      return res.status(404).json({
        errorMessage: errorMessage
      });
    }

    if (!['HIGH', 'MEDIUM', 'LOW'].includes(newPriority)) {
      const errorMessage= 'Invalid priority parameter';
      errorLogger(errorMessage);
      return res.status(400).json({
        errorMessage: errorMessage
      });
    }
  
    const oldPriority = taskToUpdate.priority;
    taskToUpdate.priority = newPriority;
    res.status(200).json({
      result: `The priority of task ${taskToUpdate.id} was updated from ${oldPriority} to ${newPriority}`
    });

    updateTaskPriorityDebugLogger(id, oldPriority, newPriority);
  });
  
  // *ENDPOINT* ======>   Search task by keyword
  app.get('/task/search', (req, res) => {
    const keyword = req.query.keyword;
    if(!keyword){
      const errorMessage= 'Keyword parameter is required for searching tasks.';
      return res.status(400).json({
        errorMessage: errorMessage
      })
    }
    const filteredTasks = tasks.filter((task) => 
    task.title.toLowerCase().includes(keyword.toLowerCase()) ||
    task.description.toLowerCase().includes(keyword.toLowerCase()));
    
    return res.status(200).json(filteredTasks);
})
  // *ENDPOINT* ======> Delete task 
  app.delete('/task', (req, res) => {    
    const id = parseInt(req.query.id);
    const previousSize = tasks.length;
    tasks = tasks.filter(task => task.id !== id);
    if (previousSize === tasks.length) {
      const errorMessage= `Task with Id ${id} not found.`;
      errorLogger(errorMessage);
      return res.status(404).json({
        errorMessage: errorMessage
      });
    }
    deleteTaskInfoLogger(id);
    res.status(200).json({
      result: `The number of tasks left in the system is: ${tasks.length}`,
      message: `Task with Id ${id} deleted successfully.`
    });
    
    deleteTaskDebugLogger(id, tasks.length);
  });
  
   // *ENDPOINT* ======> Set logger level 
   app.put('/logs/level', (req, res) => { 
    let { 'logger-name': loggerName, 'logger-level': newLoggerLevel } = req.query;
    
    if(!['request-logger', 'task-logger'].includes(loggerName)){
      requestErrorLogger(req);
      const errorMessage= "Invalid logger name";
      return res.status(400).json({
        errorMessage: errorMessage
      });
    }
    
    else if(!['ERROR', 'INFO', 'DEBUG'].includes(newLoggerLevel)){
      requestErrorLogger(req);
      const errorMessage= "Invalid logger level";
      return res.status(400).json({
        errorMessage: errorMessage
      });
    }
    
    else {
      newLoggerLevel= newLoggerLevel.toLowerCase();
      const currentLogLevel = loggerName === 'request-logger' ? requestsLogger.level : taskLogger.level
      loggerName === 'request-logger' ? setLoggerLevel(requestsLogger, newLoggerLevel) : setLoggerLevel(taskLogger, newLoggerLevel)
      return res.status(200).json({
      result: `The log level has changed from level ${currentLogLevel.toUpperCase()} to level ${newLoggerLevel.toUpperCase()}`
    });
  }});

  // *ENDPOINT* ======> Get logger level 
  app.get('/logs/level', (req, res) => { 
    const { 'logger-name': loggerName } = req.query;
    
    if(!['request-logger', 'task-logger'].includes(loggerName)){
      requestErrorLogger(req);
      const errorMessage= "Invalid logger name";
      return res.status(400).json({
        errorMessage: errorMessage
      });
    }
  
    else {
    const currentLogLevel = loggerName === 'request-logger' ? requestsLogger.level : taskLogger.level
    res.status(200).json({
      result: `${loggerName} is in level ${currentLogLevel.toUpperCase()}`
    });
  }})

// *ENDPOINT* ======> For all the routes that are not found
  app.all('*', (req, res) => {
    requestErrorLogger(req);
    const errorMessage= 'Route not found';
    res.status(404).json({ 
      errorMessage: errorMessage});
  });
  
  
// ====> Start the server <====
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// ====> Saving data to the file
process.on('SIGINT', () => {
  console.log('\nServer is shutting down...');
  saveToFile(tasks, tasksIdCounter);
  process.exit();
});
//////////////////////////////////