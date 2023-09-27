const logger = require("./Logger");

// Define a function that generates a response object
const generateResponse = (
  success,
  result = null,
  errors = [],
  message = Status.SUCCESS
) => {
  return {
    message,
    success,
    result,
    errors,
  };
};

const Status = {
  SUCCESS: 'Successful',
  FAILURE: 'Failed',
  LOADING: 'Loading',
};

// Middleware function to format responses
const formatResponse = (req, res, next) => {
  // Create a successResponse function that wraps the result
  res.successResponse = (result) => {
    const response = generateResponse(true, result);
    logger.info("Response:", response); // Log the response
    res.json(response);
  };

  // Create an errorResponse function that wraps the errors
  res.errorResponse = (errors) => {
    const response = generateResponse(false, null, [errors],Status.FAILURE);
    logger.error("Response:", response); // Log the response
    res.status(400).json(response);
  };

  // Create an errorResponseWithCode function for custom HTTP status codes
  res.errorResponseWithCode = (code, errors) => {
    const response = generateResponse(false, null, [errors],Status.FAILURE);
    logger.error("Response:", response); // Log the response
    res.status(code).json(response);
  };

  next();
};

module.exports = formatResponse;
