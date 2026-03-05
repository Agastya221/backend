import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import { apiResponse } from "../../utils/apiResponse";
import { verifyWebhookSignature } from "./payment.webhook";
import { BookingModel } from "../bookings/booking.model";
import { BookingService } from "../bookings/booking.service";

export const createOrder = async (req: Request, res: Response) => {
  const data = await PaymentService.createOrder(req.body.bookingId as string);
  res.status(201).json(apiResponse(data, "Payment order created"));
};

export const verifyPayment = async (req: Request, res: Response) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  // IMPORTANT: Audit logging of transaction signatures for security forensics
  console.log("\n--- RAZORPAY VERIFICATION PAYLOAD ---");
  console.log("razorpayOrderId:", razorpayOrderId);
  console.log("razorpayPaymentId:", razorpayPaymentId);
  console.log("razorpaySignature:", razorpaySignature);
  console.log("---------------------------------------\n");

  const valid = await PaymentService.verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  res.json(apiResponse({ verified: valid }, valid ? "Payment verified successfully" : "Invalid payment signature"));
};

export const handleWebhook = async (_req: Request, res: Response) => {
  const signature = _req.headers["x-razorpay-signature"];
  const rawBody = JSON.stringify(_req.body ?? {});
  const isValid = typeof signature === "string" ? verifyWebhookSignature(rawBody, signature) : false;

  if (isValid) {
    const event = _req.body.event;
    const paymentEntity = _req.body.payload?.payment?.entity;

    if (paymentEntity && paymentEntity.order_id) {
      const booking = await BookingModel.findOne({ razorpayOrderId: paymentEntity.order_id });

      if (booking) {
        if (event === "payment.captured") {
          // Asynchronous secure backend settlement
          await BookingService.confirmPayment(String(booking._id), paymentEntity.id);
        } else if (event === "payment.failed") {
          // Free up fleet reservation lock on payment bounce
          booking.paymentStatus = "failed";
          booking.bookingStatus = "cancelled";
          await booking.save();
        }
      }
    }
  }

  res.status(200).json(apiResponse({ received: true, isValid }, "Webhook processed securely"));
};
