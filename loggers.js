const winston = require("winston");
const { combine, timestamp, printf } = winston.format;

let requestsCounter = 0;
let defaultLogLevel = "info";

const logFormat = printf(({ level, message, timestamp}) => {
    return `${timestamp} ${level.toLocaleUpperCase()}: ${message} | request #${requestsCounter}`;
  });

  const requestsLogger = winston.createLogger({
        level: defaultLogLevel,
        format: combine(timestamp({ format: 'DD-MM-YYYY HH:mm:ss.SSS' }), logFormat),
        transports: [
            new winston.transports.Console({ level: defaultLogLevel }),
            new winston.transports.File({
                level: defaultLogLevel,
                filename: './logs/requests.log'
            })
        ]
    });

const taskLogger= winston.createLogger({
    level: defaultLogLevel,
    format: combine(timestamp({ format: "DD-MM-YYYY HH:mm:ss.SSS" }), logFormat),
    transports: [
        new winston.transports.File({ level: defaultLogLevel,
                                      filename: './logs/tasks.log'})
    ]});

    
function requestInfoLogger (req, res, next){
       ++requestsCounter;
        req.startTime = Date.now();
        requestsLogger.info(`Incoming request | #${requestsCounter} | resource: ${req.url.split('?')[0]} | HTTP Verb ${req.method}`);
        next();
}
    
function requestDebugLogger (req, res, next){
        requestsLogger.debug(`request #${(requestsCounter)} duration: ${(Date.now()- req.startTime)}ms`);
        next();
}

function requestErrorLogger (req){
    requestsLogger.error(`Invalid request #${(requestsCounter)} | resource: ${req.url.split('?')[0]} | HTTP Verb ${req.method}`);
}

function createNewTaskInfoLogger (title){
     taskLogger.info(`Creating new task with title [${title}]`); 
}

function createNewTaskDebugLogger (lastNumberOfTasks, newId){
         taskLogger.debug(`Currently there are ${lastNumberOfTasks} tasks in the system. New task will be assigned with id ${newId}`);
}
    
    
function getTasksCountInfoLogger (priority, totalTasks){
         taskLogger.info(`Total tasks count for priortiy ${priority} is ${totalTasks}`);
}

function getTasksDataInfoLogger(sortBy, priority){
        taskLogger.info(`Extracting tasks content. Priority: ${priority} | Sorting by: ${sortBy}`);
}
        
function getTasksDataDebugLogger(totalTasks, totalTasksByFilter){
        taskLogger.debug(`There are a total of ${totalTasks} tasks in the system. The result holds ${totalTasksByFilter} tasks`);
}
    

function updateTaskPriorityInfoLogger(taskId, newPriority){
            taskLogger.info(`Update task id [${taskId}] priority to ${newPriority}`);
}
        
 function updateTaskPriorityDebugLogger(taskId, oldPriority, newPriority){
        taskLogger.debug(`Task id [${taskId}] priority change: ${oldPriority} --> ${newPriority}`);
        }
    

 function deleteTaskInfoLogger(taskId){
            taskLogger.info(`Removing task id ${taskId}`);
}
        
function deleteTaskDebugLogger(taskId, totalTasks){
        taskLogger.debug(`After removing task id [${taskId}] there are ${totalTasks} tasks in the system`);
}
    

function errorLogger(res){
        taskLogger.error(res);
}

function setLoggerLevel(logger, newLoggerLevel){
    logger.level=newLoggerLevel;
    logger.transports.forEach(transport => {
            transport.level = newLoggerLevel;
    })}
  
module.exports= { requestsCounter: {
                                    get value() {
                                        return requestsCounter;
                                        },
                                    set value(newValue) {
                                        requestsCounter = newValue;
                                        }
                                    },
                  requestsLogger, taskLogger,
                  requestInfoLogger,requestDebugLogger ,requestErrorLogger,
                  createNewTaskInfoLogger, createNewTaskDebugLogger, 
                  getTasksCountInfoLogger,
                  getTasksDataInfoLogger, getTasksDataDebugLogger,
                  updateTaskPriorityInfoLogger, updateTaskPriorityDebugLogger,
                  deleteTaskInfoLogger, deleteTaskDebugLogger,
                  errorLogger, setLoggerLevel};
                  
                

