// 🔍 COMPREHENSIVE PAYMENT SYSTEM DEBUGGER
// This script will help identify and fix all payment-related issues

export const debugPaymentSystem = () => {
  console.log('🔍 === PAYMENT SYSTEM DIAGNOSTIC STARTED ===');
  
  // 1. Check Environment Variables
  console.log('\n📋 1. ENVIRONMENT VARIABLES CHECK:');
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  requiredEnvVars.forEach(envVar => {
    const value = import.meta.env[envVar];
    console.log(`${envVar}: ${value ? '✅ Present' : '❌ Missing'}`);
    if (value) {
      console.log(`  Value: ${value.substring(0, 20)}...`);
    }
  });
  
  // 2. Check DOM Elements
  console.log('\n🏗️ 2. DOM ELEMENTS CHECK:');
  const subscriptionButtons = document.querySelectorAll('[data-testid="subscription-button"], button:contains("Subscribe")');
  console.log(`Subscription buttons found: ${subscriptionButtons.length}`);
  
  subscriptionButtons.forEach((button, index) => {
    console.log(`Button ${index + 1}:`, {
      disabled: (button as HTMLButtonElement).disabled,
      textContent: button.textContent?.trim(),
      onclick: (button as any).onclick ? 'Has handler' : 'No handler'
    });
  });
  
  // 3. Check Razorpay SDK
  console.log('\n💳 3. RAZORPAY SDK CHECK:');
  if ((window as any).Razorpay) {
    console.log('✅ Razorpay SDK is loaded');
    console.log('Razorpay version:', (window as any).Razorpay.version || 'Unknown');
  } else {
    console.log('❌ Razorpay SDK not loaded');
    
    // Try to load it manually for testing
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('✅ Razorpay SDK loaded manually');
    };
    script.onerror = () => {
      console.log('❌ Failed to load Razorpay SDK manually');
    };
    document.head.appendChild(script);
  }
  
  // 4. Check Network Connectivity
  console.log('\n🌐 4. NETWORK CONNECTIVITY CHECK:');
  fetch('https://checkout.razorpay.com/v1/checkout.js', { method: 'HEAD' })
    .then(() => console.log('✅ Razorpay CDN accessible'))
    .catch(() => console.log('❌ Razorpay CDN not accessible'));
  
  // 5. Check Console Errors
  console.log('\n🐛 5. CONSOLE ERRORS CHECK:');
  const originalError = console.error;
  const errors: string[] = [];
  
  console.error = (...args) => {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  setTimeout(() => {
    console.error = originalError;
    console.log(`Captured ${errors.length} errors in last 5 seconds:`);
    errors.forEach((error, index) => {
      console.log(`Error ${index + 1}: ${error}`);
    });
  }, 5000);
  
  // 6. Test Edge Function Connectivity
  console.log('\n🔗 6. EDGE FUNCTION CONNECTIVITY CHECK:');
  const testEdgeFunction = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: 'test_product',
          user_id: 'test_user'
        }),
      });
      
      console.log(`Edge Function response status: ${response.status}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`Edge Function error: ${errorText}`);
      }
    } catch (error) {
      console.log(`Edge Function connection failed: ${error}`);
    }
  };
  
  testEdgeFunction();
  
  // 7. Check Local Storage/Session Storage
  console.log('\n💾 7. STORAGE CHECK:');
  console.log('LocalStorage items:', Object.keys(localStorage).length);
  console.log('SessionStorage items:', Object.keys(sessionStorage).length);
  
  // Check for problematic storage items
  const problematicKeys = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('subscription_check_') || key.includes('profile_creation_'))) {
      problematicKeys.push(key);
    }
  }
  
  if (problematicKeys.length > 0) {
    console.log('⚠️ Found problematic storage keys:', problematicKeys);
  } else {
    console.log('✅ No problematic storage keys found');
  }
  
  console.log('\n🔍 === PAYMENT SYSTEM DIAGNOSTIC COMPLETED ===');
  console.log('Check the logs above for any issues that need to be fixed.');
};

// Auto-run diagnostic when this file is imported
if (typeof window !== 'undefined') {
  // Run after a short delay to ensure everything is loaded
  setTimeout(debugPaymentSystem, 2000);
}

// Make it available globally for manual testing
(window as any).debugPaymentSystem = debugPaymentSystem;
