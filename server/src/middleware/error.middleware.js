export class ErrorHandler extends Error{
  constructor(message, statusCode){
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  return res.status(err.statusCode).json({
    status: 'error',
    message: err.message,
  })
}