import Razorpay from 'razorpay';

export const RAZORPAY_CONFIG = {
  key_id: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
  currency: 'INR',
  name: 'Namkeen Prime',
  description: 'Premium Subscription',
  theme: {
    color: '#10B981'
  }
};

export class RazorpayService {
  private static instance: RazorpayService;
  private razorpay: Razorpay;

  private constructor() {
    this.razorpay = new Razorpay({
      key_id: RAZORPAY_CONFIG.key_id,
      key_secret: import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET',
    });
  }

  public static getInstance(): RazorpayService {
    if (!RazorpayService.instance) {
      RazorpayService.instance = new RazorpayService();
    }
    return RazorpayService.instance;
  }

  async createOrder(planId: string, amount: number) {
    try {
      const options = {
        amount: amount * 100,
        currency: 'INR',
        receipt: `order_${planId}_${Date.now()}`,
        notes: { plan_id: planId }
      };
      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  verifyPaymentSignature(paymentId: string, orderId: string, signature: string): boolean {
    try {
      const text = orderId + '|' + paymentId;
      const crypto = require('crypto');
      const generated_signature = crypto
        .createHmac('sha256', import.meta.env.VITE_RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');
      return generated_signature === signature;
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }
}

export default RazorpayService.getInstance(); 