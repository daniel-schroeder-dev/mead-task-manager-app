exports.ResponseError = function(status, message) {
  this.status = status;
  this.message = message;
};