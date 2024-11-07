import CheckoutSdk from '@hubteljs/checkout';

// Initialize CheckoutSdk instance
const checkout = new CheckoutSdk(); // Create an instance of the SDK

document.addEventListener("DOMContentLoaded", () => {
    const nomineeNameEl = document.getElementById("nominee-name");
    const categoryNameEl = document.getElementById("category-name");
    const nomineeCodeEl = document.getElementById("nominee-code");
    const votesInput = document.getElementById("votes");
    const amountEl = document.getElementById("amount-value");
    const emailInput = document.getElementById("email");
    const messageEl = document.getElementById("message");
    const submitBtn = document.getElementById("submit-btn");
    const cancelBtn = document.getElementById("cancel-btn");

    // Set nominee details (mock data for demonstration)
    const nominee = {
        name: "John Doe",
        category: "Best Actor",
        nominee_code: "NOM123"
    };

    nomineeNameEl.textContent = nominee.name;
    categoryNameEl.textContent = nominee.category;
    nomineeCodeEl.textContent = nominee.nominee_code;

    // Update amount based on votes
    votesInput.addEventListener("input", (event) => {
        const votes = event.target.value;
        amountEl.textContent = votes; // 1 GHS per vote
    });

    // Submit button click event
    submitBtn.addEventListener("click", () => initPay(votesInput.value));

    // Cancel button click event
    cancelBtn.addEventListener("click", () => {
        alert("Cancelled");
    });
});

// Initialize payment function
const initPay = async (votes) => {
    const votesNum = parseInt(votes, 10); // Ensure you're getting the votes value correctly
    if (isNaN(votesNum) || votesNum < 1) {
        messageEl.textContent = "Please enter a valid number of votes.";
        return;
    }

    // Prepare purchase information
    const purchaseInfo = {
        amount: votesNum,
        purchaseDescription: `${votesNum} votes for ${nominee.name} at GHS ${votesNum}`,
        customerPhoneNumber: "233551196764", // You might want to get this from the user
        clientReference: `inv${Date.now()}`
    };

    // Configuration options
    const config = {
        branding: "enabled",
        callbackUrl: window.APP_ENV.CALLBACK_URL,
        merchantAccount: window.APP_ENV.MERCHANT_ACCOUNT,
        basicAuth: window.APP_ENV.BASIC_AUTH,
    };

    try {
        // Open the payment modal
        checkout.openModal({
            purchaseInfo,
            config,
            callBacks: {
                onInit: () => console.log("Iframe initialized: "),
                onPaymentSuccess: async (data) => {
                    console.log("Payment succeeded: ", data);
                    checkout.closePopUp();

                    // Prepare transaction data
                    const transactionData = {
                        event_id: event.id, // Ensure this ID corresponds to your actual event
                        nominee_id: nominee.nominee_code, // Use the correct nominee identifier
                        trans_date: new Date().toISOString(),
                        amount: votesNum,
                        payment_method: "Mobile Money", // Adjust based on actual payment method used
                        status: "success", // Confirm payment success
                        clientReference: purchaseInfo.clientReference,
                    };

                    // Update your database with payment details
                    await updateDatabaseWithPayment(transactionData);

                    // Check transaction status
                    try {
                        const statusData = await checkTransactionStatus(transactionData.clientReference);
                        console.log("Fetched transaction status:", statusData);
                        messageEl.textContent = "Thank you for your vote! Your payment was successful.";
                    } catch (error) {
                        console.error("Failed to fetch transaction status:", error);
                        messageEl.textContent = "Your payment was successful, but we couldn't fetch the transaction status.";
                    }
                },
                onPaymentFailure: (data) => {
                    console.log("Payment failed: ", data);
                    messageEl.textContent = "Payment failed. Please try again.";
                },
                onLoad: () => console.log("Checkout has been loaded: "),
                onFeesChanged: (fees) => console.log("Payment channel has changed: ", fees),
                onResize: (size) => console.log("Iframe has been resized: ", size?.height),
                onClose: (size) => console.log("The modal has closed ", size?.height),
            },
        });
    } catch (error) {
        console.error("Error initiating payment:", error);
        messageEl.textContent = "Payment initiation failed. Please try again.";
    }
};

// Mock function to simulate updating database with payment details
async function updateDatabaseWithPayment(transactionData) {
    // Implement your database update logic here
}

// Mock function to check transaction status
async function checkTransactionStatus(clientReference) {
    // Implement your transaction status check logic here
}
