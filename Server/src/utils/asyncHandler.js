// Wraps async controllers so we don't write try/catch everywhere
const asyncHandler = (controller) => {
  return (req, res, next) => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
};

export default asyncHandler;