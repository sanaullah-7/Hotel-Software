import ApiError from "../utils/apiError.js";

// Higher-order middleware:
// schema receive karta hai aur ek Express middleware return karta hai.
const validate = (schema) => {
  return (req, res, next) => {
    // Determine whether schema is designed for nested request object { body, params, query }
    // or direct req.body validation.
    const isNested = schema._ids && (schema._ids._byKey.has('body') || schema._ids._byKey.has('params') || schema._ids._byKey.has('query'));
    
    const dataToValidate = isNested
      ? { body: req.body, params: req.params, query: req.query }
      : req.body;

    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return next(new ApiError(400, "Validation failed", errors));
    }

    if (isNested) {
      if (value.body) req.body = value.body;
      if (value.params) req.params = value.params;
      if (value.query) req.query = value.query;
    } else {
      req.body = value;
    }

    next();
  };
};

export default validate;