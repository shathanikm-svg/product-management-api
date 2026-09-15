/**
 * Higher-order function to wrap async handlers and pass errors to the next middleware
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;
