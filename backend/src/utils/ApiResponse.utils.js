class ApiResponse {
  constructor(statusCode, success, message, data = null, meta = null) {
    this.statusCode = statusCode; // HTTP status code
    this.success = success; // Boolean indicating success or failure
    this.message = message; // Message describing the response
    this.data = data; // Data returned in the response, if any
    this.meta = meta; // Additional metadata, if any
  }
  send(res) {
    let response = {};
    response.message = this.message;
    response.success = this.success;
    if (this.data) {
      response.data = this.data;
    }
    if (this.meta) {
      response.meta = this.meta;
    }
    return res.status(this.statusCode).json(response);
  }
}

module.exports = ApiResponse;
