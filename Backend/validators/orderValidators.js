/**
 * Order Validators — Zod schemas for order-related routes.
 *
 * Add new schemas here as you touch routes.
 * Import the `validate` middleware and the schema in the route file.
 */
import { z } from 'zod';

// ─── Place Order ─────────────────────────────────────────────────────────────

export const placeOrderSchema = z.object({
  // restaurantId MUST be here — Zod strips unknown fields by default,
  // so any field not listed is removed from req.body before the controller runs.
  restaurantId: z.string().min(1, 'restaurantId is required'),

  items: z
    .array(
      z.object({
        foodId: z.string().optional(), // only present for valid MongoDB ObjectIds
        name: z.string().min(1, 'Item name is required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        price: z.number().min(0, 'Price must be non-negative'),
        image: z.string().optional(),
      })
    )
    .min(1, 'Order must contain at least one item'),

  deliveryAddress: z.string().min(1, 'Delivery address is required'),

  deliveryLocation: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .nullable()   // CartScreen sends null when no coordinates
    .optional(),

  totalAmount: z.number().min(0, 'Total amount must be non-negative'),

  paymentMethod: z
    .enum(['COD', 'Online', 'Card', 'UPI', 'GPAY', 'PHONEPE', 'CARD'])
    .default('COD'),

  customer: z
    .object({
      name: z.string().min(1),
      phone: z.string().optional(),
    })
    .optional(),

  isPaid: z.boolean().optional(), // sent by PaymentScreen
});

// ─── Update Order Status (Restaurant) ────────────────────────────────────────

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'accepted',
    'preparing',
    'ready',
    'reached_restaurant',
    'out_for_delivery',
    'completed',
    'cancelled',
  ]),
});
