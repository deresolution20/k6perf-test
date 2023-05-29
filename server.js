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
