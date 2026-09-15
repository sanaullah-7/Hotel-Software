// Hum bhi ek special type ka object bana rahe hain.
// class ka mtlb "Main ApiError naam ka ek blueprint/type bana raha hoon."
class ApiError extends Error {
  // Error banate waqt status/message/details receive karunga.
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = []
  ) {
    // Error hamari parent class hai.
    // super() parent class ka constructor call karta hai.
    super(message);
// this ka matlab hai:Jo current ApiError object abhi ban raha ha
    this.name = "ApiError";
    this.statusCode = statusCode;//HTTP status code save karo.
    this.errors = errors;
    this.success = false;

  //  Iska purpose debugging hai.Ye error ki stack trace properly capture karta hai.
  // to developer ko pata chal sakta hai ke error kis path se aaya.Abhi is line ko deeply memorize karne ki zaroorat nahi.
  // captureStackTrace = debugging ke liye error ki location/stack information maintain karna
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;