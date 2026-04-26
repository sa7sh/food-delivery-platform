/**
 * Zod Validation Middleware Factory
 *
 * Wraps a Zod schema into an Express middleware. On failure, passes a 400
 * AppError to the global error handler. On success, replaces req.body with
 * the coerced + stripped data from Zod.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate req.body against
 * @returns {import('express').RequestHandler}
 *
 * @example
 * import { validate } from '../middleware/validate.js';
 * import { placeOrderSchema } from '../validators/orderValidators.js';
 *
 * router.post('/', protect, validate(placeOrderSchema), placeOrderHandler);
 */
import { AppError } from '../utils/AppError.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    // Return the first validation error message for clarity
    const message = result.error.errors[0]?.message || 'Validation failed';
    return next(new AppError(message, 400));
  }
  // Replace body with coerced + unknown-fields-stripped data
  req.body = result.data;
  next();
};
