const winston = require('winston');
const path = require('path');

// Define the log file path
const logFilePath = path.join(__dirname, 'logs', 'app.log');

// Create your custom logger configuration
const logger = winston.createLogger({
  level: 'info', // Logging level (info, error, etc.)
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamps
    winston.format.json({ space: 2 }) // Pretty print with an indentation of 2 spaces
  ),
  transports: [
    new winston.transports.Console(), // Log to the console
    new winston.transports.File({ filename: logFilePath }), // Log to a file
  ],
});

module.exports = logger;










// const winston = require("winston");

// // Define your custom logger configuration
// const logger = winston.createLogger({
//   level: "info", // Logging level (info, error, etc.)
//   format: winston.format.json(), // JSON format for logs
//   transports: [
//     new winston.transports.File({ filename: "error.log", level: "error" }),
//     new winston.transports.File({ filename: "combined.log" }),
//   ],
// });

// // Add a console transport for logging to the console during development
// if (process.env.NODE_ENV !== "production") {
//   logger.add(
//     new winston.transports.Console({
//       format: winston.format.simple(),
//     })
//   );
// }

// module.exports = logger;
