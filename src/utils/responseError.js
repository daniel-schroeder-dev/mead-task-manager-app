const ResponseError = function(status, message) {
  this.status = status;
  this.message = message;
};

module.exports = ResponseError;