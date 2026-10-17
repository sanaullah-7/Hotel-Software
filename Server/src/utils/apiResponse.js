class ApiResponse {
  constructor(statusCode, data, message = "Success", meta = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }

  toJSON() {
    const response = {
      success: this.success,
      message: this.message,
      data: this.data,
    };
    if (this.meta) {
      response.meta = this.meta;
    }
    return response;
  }
}

export default ApiResponse;