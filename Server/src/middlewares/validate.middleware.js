import ApiError from "../utils/apiError.js";

// Higher-order middleware:
// schema receive karta hai aur ek Express middleware return karta hai.
const validate = (schema) => {//Schema = validation ke rules

  return (req, res, next) => {
   
    const data = {
      body: req.body, // body   → POST/PUT/PATCH ka data
      params: req.params,// params → URL parameters, e.g. /hotels/:hotelId
      query: req.query,// query  → URL query parameters, e.g. ?page=1
    };

    // Joi schema ke against complete request data validate kar rahe hain.
    // schema.validate() = rules ko actual data par check karna
    const { error } = schema.validate(data, {
      abortEarly: false,// // abortEarly: false ka matlab: agar multiple validation errors hain,to Joi sirf pehla error nahi balki saare errors return karega.
    });

    // Agar validation fail ho jaye
    if (error) {
      // Joi ke detailed errors ko simple messages ki array mein convert kar rahe hain.
      const errors = error.details.map((detail) => detail.message);
      // Custom ApiError bana kar centralized errorHandler ko bhej rahe hain.
      return next(new ApiError( 400,"Validation failed",errors )
      );
    }

    // Agar validation successful hai,
    // request ko next middleware/controller ke paas bhej do.
    next();
  };
};

export default validate;