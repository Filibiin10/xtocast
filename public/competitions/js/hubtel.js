import { Checkout } from '@hubteljs/checkout';

// Initialize the checkout SDK
const hubtelCheckout = new Checkout({
    merchantAccount: '<YOUR_MERCHANT_ACCOUNT>',
    basicAuth: '<YOUR_BASIC_AUTH>',
    branding: 'enabled',
    callbackUrl: '<YOUR_CALLBACK_URL>',
});

// Check if the SDK is loaded
if (!hubtelCheckout) {
    console.error("Hubtel Checkout SDK not loaded");
} else {
    console.log("Hubtel Checkout SDK loaded successfully");
}
