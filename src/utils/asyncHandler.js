/* This is the First technique for connect database (using Promises)
 */

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      // console.log("Error occurred in asyncHandler : ");
      next(err)
    });
  };
};

/*

This is the second  technique for connect database (using try-catch and async)

const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);   
  } catch (error) {
    res.status(err.code || 500).json({
      success: false,
      message: err.message,
    });
  }
};

*/

export { asyncHandler };
