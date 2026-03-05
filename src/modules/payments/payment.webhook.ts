import crypto from "crypto";
import { env } from "../../config/env";

export const verifyWebhookSignature = (rawBody: string, signature: string) => {
  const expected = crypto.createHmac("sha256", env.razorpayWebhookSecret).update(rawBody).digest("hex");
  return expected === signature;
};
