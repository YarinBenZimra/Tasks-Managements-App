# Task Management Application

A Node.js-based task management application with logging and data storage functionality.

## Overview

This Node.js application allows users to manage tasks with various functionalities, including creating, updating, deleting, and retrieving tasks. It incorporates logging features and persistent data storage capabilities.

## Features

- Create, update, delete, and retrieve tasks.
- In-memory data storage with save and load capabilities.
- Logging for requests, tasks, and errors.
- Task filtering and sorting options.
- Endpoint for changing logger levels dynamically.

## Getting Started

### Prerequisites

- Node.js and npm installed.
- Git installed.
- GitHub account for version control.

### Installation

#### 1. Clone the repository

   ```bash 
   git clone https://github.com/YarinBenZimra/Tasks-Managements-App.git
```
   
#### 2. Navigate to the project directory

  ```bash 
cd Tasks-Managements-App
```
   
#### 3. Install the dependencies

 ```bash 
 npm install
```

#### 4. Run the server

 ```bash 
 node .\TasksManagementApp.js
```

### Usage
Access the application through the defined endpoints (e.g., taskcreate, taskdata, etc.).
Use appropriate HTTP methods (GET, POST, PUT, DELETE) for the desired operation.
Check the logs in the .logs directory for request, task, and error information.
### API Endpoints
GET task Check if the server is running.
POST taskcreate Create a new task.
GET tasksize Get the amount of tasks by priority.
GET taskdata Get tasks data with optional sorting and filtering.
PUT taskpriority Update task priority.
GET tasksearch Search for tasks by keyword.
DELETE task Delete a task.
PUT logslevel Set logger level.
GET logslevel Get logger level.

### API Documentation

#### 1. Check if the server is running.

Example: 
GET http://localhost:3000/task

Response:
```json
{
  "result": "OK"
}
```

#### 2. Create a new task.

Example:
POST http://localhost:3000/task/create

Content-Type applicationjson
```json
{
"title": "New Task",
"description": "Task description",
"deadline": "2023-12-30 16:21",
"priority": "HIGH"
}
```

Response:
```json
{
  "result": "A new task has been added to the system",
  "taskId": 2
}
```

#### 3. Get the amount of tasks by priority.

Example:
GET "http://localhost:3000/task/size?priority=HIGH"

Response:
```json
{
  "result": 5,
  "tasksID": [1, 3, 5, 7, 9]
}
```

#### 4.Get tasks data with optional sorting and filtering.

Example:
GET  "http://localhost:3000/task/data?priority=MEDIUM&sortBy=DEADLINE"

Response:
```json
[
  {
    "id": 4,
    "title": "Medium Priority Task",
    "description": "Description of medium priority task",
    "deadline": "2023-11-24 16:21",
    "priority": "MEDIUM"
  },
  {
    "id": 6,
    "title": "Another Medium Priority Task",
    "description": "Another description",
    "deadline": "2023-10-12 18:30",
    "priority": "MEDIUM"
  },
  // ... (other tasks)
]
```

#### 5. Update task priority.

Example:
PUT "http://localhost:3000/task/priority?id=3&priority=LOW"

Response:
```json
{
  "result": "The priority of task 3 was updated from MEDIUM to LOW"
}
```

#### 6. Delete a task.

Example:
DELETE "http://localhost:3000/task?id=2"

Response:
```json
{
  "result": "The number of tasks left in the system is: 8",
  "message": "Task with Id 2 deleted successfully."
}
```

#### 7. Search for tasks by keyword.

Example:
GET "http://localhost:3000/task/search?keyword=important"

Response:
```json
[
  {
    "id": 2,
    "title": "Important Task",
    "description": "This task is labeled as important",
    "deadline": "2023-12-30 16:21",
    "priority": "HIGH"
  },
  {
    "id": 7,
    "title": "Another Important Task",
    "description": "Another important task",
    "deadline": "2023-12-30 17:21",
    "priority": "MEDIUM"
  }
]
```

#### 8. Set logger level.

Example:
PUT "http://localhost:3000/logs/level?logger-name=request-logger&logger-level=DEBUG"

Response:
```json
{
  "result": "The log level has changed from level INFO to level DEBUG"
}
```

#### 9. Get logger level.

Example:
GET "http://localhost:3000/logs/level?logger-name=request-logger"

Response:
```json
{
  "result": "request-logger is in level DEBUG"
}
```

## Contributing
Feel free to contribute to the project by opening issues or submitting pull requests. Follow the Contribution Guidelines.

## License
This project is licensed under the MIT License.

