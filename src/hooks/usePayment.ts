import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';

// Define the structure of the order response from our edge function
interface OrderResponse {
  success: boolean;
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
  };
  keyId: string;
}

// Define the structure for Razorpay options
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
}

// Dynamically load the Razorpay SDK script
const loadRazorpayScript = (src: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    // Check if Razorpay is already available on window
    if ((window as any).Razorpay) {
      console.log('✅ Razorpay SDK already available on window');
      return resolve(true);
    }

    // Check if the script is already present
    if (document.getElementById('razorpay-checkout-js')) {
      console.log('Razorpay SDK script already loaded.');
      return resolve(true);
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-js';
    script.src = src;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('Razorpay SDK script loaded successfully.');
      resolve(true);
    };

    script.onerror = (error) => {
      console.error('Failed to load Razorpay SDK script:', error);
      reject(new Error('Failed to load Razorpay SDK script.'));
    };

    document.body.appendChild(script);
  });
};

export const usePayment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const initiatePayment = async (planId: string) => {
    console.log('🚀 initiatePayment called with planId:', planId);
    setLoading(true);
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to make a payment.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    // 1. Load the Razorpay SDK
    const scriptLoaded = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!scriptLoaded) {
      toast({ title: 'SDK Load Error', description: 'Failed to load Razorpay SDK.', variant: 'destructive' });
      setLoading(false);
      return;
    }
    console.log('✅ Razorpay SDK loaded successfully');

    try {
      // 2. Create a Razorpay order by calling our edge function
            // Get the current user's session to include the user ID in the request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated.');
      }

      console.log('📞 Calling create-razorpay-order edge function...');
      const { data: orderResponse, error: orderError } = await supabase.functions.invoke<OrderResponse>('create-razorpay-order', {
        body: { 
          planId
        },
      });

      if (orderError) {
        console.error('❌ Order creation failed:', orderError);
        toast({ title: 'Order Creation Failed', description: orderError.message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      console.log('✅ Order created successfully:', orderResponse);
      
      if (!orderResponse.success) {
        throw new Error('Order creation failed');
      }
      
      const { order, keyId } = orderResponse;

      // NOTE: Edge Function should multiply amount by 100 for paise conversion
      // Current Edge Function does: amount: plan.price * 100
      // So frontend should use the amount as-is (it's already in paise)
      
      // 3. Configure Razorpay options
      const razorpayOptions: RazorpayOptions = {
        key: keyId,
        amount: order.amount, // This is already in paise from Edge Function
        currency: order.currency,
        name: 'Namkeen Prime',
        description: 'Subscription Plan',
        order_id: order.id,
        handler: async (response: any) => {
          try {
            console.log('Payment successful:', response);
            
            // Show loading state
            toast({ title: 'Verifying Payment...', description: 'Please wait while we activate your subscription.', variant: 'default' });
            
            // 5. Verify payment with backend
            const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-payment', {
              body: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                planId: planId,
              },
            });

            if (verificationError) {
              console.error('Verification error:', verificationError);
              toast({ 
                title: 'Payment Verification Failed', 
                description: `Error: ${verificationError.message}. Please contact support with payment ID: ${response.razorpay_payment_id}`, 
                variant: 'destructive' 
              });
            } else if (verificationData?.success) {
              console.log('✅ Payment verified successfully:', verificationData);
              toast({ 
                title: 'Payment Successful! 🎉', 
                description: `Your ${verificationData.subscription?.duration_days || 30}-day subscription is now active!`, 
                variant: 'default' 
              });
              
              // Wait a moment before refreshing to let user see the success message
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } else {
              console.error('Unexpected verification response:', verificationData);
              toast({ 
                title: 'Payment Processing Issue', 
                description: 'Payment completed but verification failed. Please contact support.', 
                variant: 'destructive' 
              });
            }
          } catch (error) {
            console.error('Handler error:', error);
            toast({ 
              title: 'Payment Processing Error', 
              description: 'An unexpected error occurred. Please contact support if payment was deducted.', 
              variant: 'destructive' 
            });
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.user_metadata?.full_name || user.email || '',
          email: user.email || '',
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: function() {
            console.log('Checkout form closed');
            setLoading(false);
          }
        }
      };

      // 4. Open Razorpay checkout
      console.log('🎯 Opening Razorpay checkout with options:', razorpayOptions);
      try {
        if (!(window as any).Razorpay) {
          console.error('❌ Razorpay SDK not found on window');
          toast({ title: 'Error', description: 'Razorpay SDK not loaded properly', variant: 'destructive' });
          setLoading(false);
          return;
        }
        
        const razorpayInstance = new (window as any).Razorpay(razorpayOptions);
        console.log('✅ Razorpay instance created:', razorpayInstance);
        
        // Add event listeners for debugging
        razorpayInstance.on('payment.success', (response: any) => {
          console.log('🎉 Razorpay payment.success:', response);
        });
        
        razorpayInstance.on('payment.error', (error: any) => {
          console.error('💥 Razorpay payment.error:', error);
          setLoading(false);
          toast({ 
            title: 'Payment Failed', 
            description: 'Payment was not completed. Please try again.', 
            variant: 'destructive' 
          });
        });
        
        razorpayInstance.on('payment.cancel', (response: any) => {
          console.log('❌ Razorpay payment.cancel:', response);
          setLoading(false);
          toast({ 
            title: 'Payment Cancelled', 
            description: 'Payment was cancelled by user.', 
            variant: 'default' 
          });
        });
        
        console.log('🚀 Opening Razorpay checkout...');
        razorpayInstance.open();
        console.log('✅ Razorpay checkout opened successfully');
        
      } catch (error) {
        console.error('💥 Error opening Razorpay:', error);
        console.error('Error stack:', error.stack);
        toast({ 
          title: 'Error', 
          description: 'Could not open payment window. Please refresh and try again.', 
          variant: 'destructive' 
        });
        setLoading(false);
      }

    } catch (error: any) {
      toast({ title: 'Payment Initiation Failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return { initiatePayment, loading };
};
