/**
 * AppError — Custom error class for operational errors.
 *
 * Throw this anywhere in a route handler instead of calling res.status().json().
 * The global error handler in errorHandler.js will catch it and respond correctly.
 *
 * @example
 * import { AppError } from '../utils/AppError.js';
 *
 * const order = await Order.findById(id);
 * if (!order) throw new AppError('Order not found', 404);
 */
export class AppError extends Error {
  /**
   * @param {string} message  - Human-readable error message sent to the client
   * @param {number} statusCode - HTTP status code (default: 400)
   */
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes from unexpected programmer errors
    Error.captureStackTrace(this, this.constructor);
  }
}
