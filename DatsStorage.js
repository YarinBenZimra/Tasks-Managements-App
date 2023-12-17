const fs = require('fs');
let {requestsCounter} = require('./loggers');
const directoryPath= './Storage';
const dataFilePath = directoryPath + '/data.json';

function loadFromFile(tasks) {
    try {
        let tasksIdCounter = 1;
      if (fs.existsSync(dataFilePath)) {
        const fileData = fs.readFileSync(dataFilePath, 'utf-8');
        const loadedData = JSON.parse(fileData);
        requestsCounter.value = loadedData.requestsCounter;
        tasks.length = 0;
        tasks.push(...loadedData.tasks);
        tasksIdCounter = loadedData.tasksIdCounter;
      } else {
        saveToFile(tasks, tasksIdCounter); 
      }
      return tasksIdCounter;
    } catch (error) {
      console.log('Error loading data from file:', dataFilePath);
      process.exit(1);
    }
  }
  
  function saveToFile(tasks, tasksIdCounter) {
    try {
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath);
          }
      const jsonData = JSON.stringify({ requestsCounter: requestsCounter.value, tasksIdCounter, tasks}, null, 2);
      fs.writeFileSync(dataFilePath, jsonData, 'utf-8');
    } catch (error) {
      console.log('Error saving data to file:', dataFilePath);
      process.exit(1);
    }
  }

module.exports = { saveToFile, loadFromFile };
