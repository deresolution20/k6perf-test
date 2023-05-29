# k6perf-test


<h2>Description</h2>

Deploy nodejs server to perform load testing using Grafana k6. You'd like to try and use k6 to simulate a scenario where multiple users are concurrently interacting with your application by loading the main page, submitting a form, and clicking a button. 

<br />

<h2>Languages and Utilities Used</h2>


- Nodejs Express Body-Parser
- Grafana and k6


<h2>Environments and tools Used </h2>


- Ubuntu 22.04-GCP VM
- Grafana Cloud 9.5.3
- Node v20.2.0


<h2>Documentation and learnings Used</h2>

- k6 documentation: https://k6.io/docs/
- Some documentation on NodeJS: 
- https://nodejs.org/en/docs/guides/getting-started-guide
- https://www.freecodecamp.org/news/build-a-secure-server-with-node-and-express/

<h2>Scope and exclusions</h2>
This test lab in this guide assumes a working knowledge of standing up a nodejs server for testing purposes.  It assumes you have already installed k6 locally and can access via your terminal. 
k6 GitHub is here: https://github.com/grafana/k6

<h2>Guidelines</h2>

To create a Node.js server that can handle basic button clicks and form submissions, you can follow the guidelines outlined below. 

<h3>1. Setting up the Node.js Server</h3>

To begin, you'll need to set up a Node.js server to handle incoming requests. The provided code snippet demonstrates how to create a server using the express framework library to simplify the process of creating http modules in Node.js. The server listens on port 3000 and responds to different endpoints based on the HTTP method and the request URL.

<h3>2. Handling GET Requests</h3>

The server code handles GET requests in the following manner:
When a GET request is made to the root path ('/'), the server responds by serving the index.html file. This file represents the main HTML page containing the buttons and form.If a GET request is made to the '/click-button' path, the server responds with a 200 status code and a simple message indicating that the button was clicked.For any other GET requests, the server responds with a 404 status code, indicating that the requested page was not found.

<h3>3. Handling POST Requests</h3>

The server code handles POST requests in the following way:
When a POST request is made to the '/submit-form' path, the server reads the request body, which contains the submitted form data. In the provided example, the form data is logged to the console.After reading the form data, the server responds with a 200 status code and a message indicating that the form was successfully submitted.Any other POST requests receive a 405 status code, indicating that the HTTP method used is not allowed for the specified endpoint.

<h2>Procedure</h2>

Setup a GCP/AWS/Azure VM and run the following to install NodeJS and Npm(Node package manager).  Once installed use npm init to initialize the project and create the package.json file in your directory and npm install express which is the library needed to create the HTTP server.  Body-parser is used to parse incoming request bodies in a middleware before your handlers, available under the req.body property. In this case, it's used to handle JSON data sent in the body of a POST request. 
<br> <br>
 
```
sudo apt-get update
sudo apt-get install nodejs npm
mkdir test-server
cd test-server
npm init -y
npm install express body-parser
```
<br> <br>

In your test-server directory create two files, index.html and server.js.
Index.html contents:
This code creates a simple web page with a form and a button. The form allows users to enter their name, email, and message. The button displays an alert message when it is clicked.

<br> <br>

```
<!DOCTYPE html>
<html>
<head>
    <title>Performance Test Page</title>
</head>
<body>
    <h1>Performance Test Page</h1>
    <form action="/submit-form" method="post">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name"><br><br>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email"><br><br>
        <label for="message">Message:</label><br>
        <textarea id="message" name="message"></textarea><br><br>
        <input type="submit" value="Submit">
    </form>
    <br>
    <button onclick="alert('Button clicked!')">Click me</button>
</body>
</html>
```

<br> <br>
server.js contents:
This code creates a simple Node.js web server that listens on port 3000. The server can handle form submissions and button clicks. The server logs all requests to a file called server.log.

<br> <br>

```
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');


const app = express();
const PORT = 3000;


// Use body-parser middleware to parse JSON bodies
app.use(bodyParser.json());


// Function to log messages to a file
function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  fs.appendFileSync('server.log', logMessage);
}


// Serve the index.html file for all requests
app.get('/', (req, res) => {
  logToFile('GET /');
  res.sendFile(path.join(__dirname, 'index.html'));
});


// Handle form submission
app.post('/submit-form', (req, res) => {
  const { name, email, message } = req.body;


  logToFile(`POST /submit-form - Name: ${name}, Email: ${email}, Message: ${message}`);
  res.json({ status: 'Form submitted' });
});


// Handle button click
app.get('/click-button', (req, res) => {
  logToFile('GET /click-button');
  res.json({ status: 'Button clicked' });
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
```

<br> <br>

Start up the server with node server.js and validate it either in the browser or using curl.
<br> <br>
![Greenshot 2023-05-29 11 00 46](https://github.com/deresolution20/k6perf-test/assets/85902399/b30056f0-9d03-4b9b-9abb-7d3ad028dcfe)

<br> <br>
Create your k6 test script locally (be sure to update the project ID and name for your instance):

<br> <br>
```
import http from 'k6/http';
import { check, sleep } from 'k6';


// Parameterize the base URL
const BASE_URL = 'http://34.83.69.27:3000';


export let options = {
  vus: 10,
  duration: '30s',
  ext: {
    loadimpact: {
      projectID: XXXXXXXX,
      name: 'perf-test'
    }
  }
};


export default function () {
  // Simulate loading the page
  let res = http.get(`${BASE_URL}/`);
  console.log(res.status);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);


  // Simulate submitting the form
  let payload = JSON.stringify({
    name: 'John Doe',
    email: 'johndoe@example.com',
    message: 'This is a test message'
  });


  let params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };


  res = http.post(`${BASE_URL}/submit-form`, payload, params);
  console.log(res.status);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);


  // Simulate clicking the button
  res = http.get(`${BASE_URL}/click-button`);
  console.log(res.status);
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
```
<br> <br>

Run the k6 script and wait.  For validation the node.js server will output a server.log in the same directory.
example:

<br> <br>
```
2023-05-26T22:49:28.006Z - POST /submit-form - Name: John Doe, Email: johndoe@example.com, Message: This is a test message
2023-05-26T22:49:29.030Z - GET /click-button
2023-05-26T22:49:29.031Z - GET /click-button
2023-05-26T22:49:29.036Z - GET /click-button
```
You should also see the test results in your instance.
<br> <br>
![Greenshot 2023-05-29 11 04 15](https://github.com/deresolution20/k6perf-test/assets/85902399/ef4baa80-518e-4e03-b42d-19d4c81c4ae4)

