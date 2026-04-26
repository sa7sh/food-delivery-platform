import { z } from "zod";

export const placeOrderSchema = z.object({
  restaurantId: z.string(),
  deliveryAddress: z.string(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    price: z.number(),
    foodId: z.string().optional()
  })),
  totalAmount: z.number(),
  paymentMethod: z.enum(["COD", "Online", "Card", "UPI", "GPAY", "PHONEPE", "CARD"]).optional()
});
