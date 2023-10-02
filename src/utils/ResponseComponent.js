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

// {
//   "message": "Successful",
//   "success": true,
//   "result": {
//       "_id": "651b21e124b354a9d467bda6",
//       "firstName": "Innocent",
//       "lastName": "Omiji",
//       "phoneNumber": "08012345679",
//       "username": "garren"
//   },
//   "errors": []
// }
// Middleware function to format responses
const formatResponse = (req, res, next) => {
  // Create a successResponse function that wraps the result
  res.successResponse = (result, code = 200) => {
    const response = generateResponse(true, result);
    logger.info("Success Response:", response); // Log the response
    res.status(code).json(response);
  };

  // Create an errorResponse function that wraps the errors
  res.errorResponse = (error, code = 400) => {
    const response = generateResponse(
      false,
      null,
      [{ message: error }],
      Status.FAILURE
    );
    logger.error("Error Response:", response); // Log the response
    res.status(code).json(response);
  };

  next();
};

const Status = {
  SUCCESS: "Successful",
  FAILURE: "Failed",
  LOADING: "Loading",
};

module.exports = formatResponse;
