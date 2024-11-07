// Initialize Paystack Payment function
async function initializePaystackPayment(email, amount, phoneNumber, numberOfVotes, nomineeName, eventName) {
    try {
        // Send request to initialize the payment
        const response = await fetch('/api/paystack/initialize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, amount })
        });

        const data = await response.json();
        
        // Check if the Paystack initialization was successful
        if (data.status === 'success' && data.data.authorization_url) {
            // Initialize PaystackPop and pass the necessary parameters for the transaction
            const paystack = new PaystackPop(); // Initialize PaystackPop

            paystack.newTransaction({
                key: 'pk_test_181c5fb9a20c21be5970be4e62058585ce0dad81', // Replace with your Paystack public key
                email: email,
                amount: amount * 100, // Convert to kobo (1 GHS = 100 kobo)
                currency: 'GHS', // Adjust based on your currency (e.g., 'NGN', 'USD')
                ref: data.data.reference, // The transaction reference returned by the backend
                callback: async function(response) {
                    console.log("Payment successful:", response);
                    // alert('Payment was successful!');
                    // Send confirmation SMS after successful payment
                    // await sendConfirmation(phoneNumber, numberOfVotes, nomineeName, eventName);

                    await createVote()
                },
                onClose: function() {
                    console.log("Payment modal was closed");
                    alert('Payment was canceled!');
                    // Send failure SMS if payment is canceled
                    // sendFailed(phoneNumber, nomineeName, eventName);
                }
            });
        } else {
            alert(`Payment initialization failed: ${data.message || 'Unknown error'}`);
            // Send failure SMS if Paystack initialization fails
            sendFailed(phoneNumber, nomineeName, eventName);
        }
    } catch (error) {
        console.error('Error initializing Paystack payment:', error);
        alert('An error occurred while initializing the payment.');
        // Send failure SMS if there is an error during payment initialization
        sendFailed(phoneNumber, nomineeName, eventName);
    }
}

// Function to send SMS using the provided phone number and message
const sendSMS = async (phoneNumber, message) => {
    try {
        const response = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': 'ZlZzZ1Z6UmROZ0dDVWpHaUdMck0' // Replace with your API key
            },
            body: JSON.stringify({
                sender: 'Xtocast',
                message: message,
                recipients: [phoneNumber]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'SMS sending failed');
        }

        const data = await response.json();
        console.log('SMS Sent:', data); // For debugging, remove in production
        return data;
    } catch (error) {
        console.error('SMS Error:', error.message);
        throw new Error('SMS sending failed');
    }
};

// Send confirmation SMS after successful payment
const sendConfirmation = async (phoneNumber, numberOfVotes, nomineeName, eventName) => {
    const message = `Congratulations! You have successfully casted ${numberOfVotes} vote(s) for ${nomineeName} in the ${eventName}. Thanks for voting.`;
    console.log(message);
    return sendSMS(phoneNumber, message);
};

// Send failure SMS if payment fails or is canceled
const sendFailed = async (phoneNumber, nomineeName, eventName) => {
    const message = `We're sorry, your vote attempt for ${nomineeName} in the ${eventName} was unsuccessful. Please try again.`;
    console.log(message);
    return sendSMS(phoneNumber, message);
};

// Event listener to initialize Paystack payment on button click
document.getElementById('submitButton').addEventListener('click', () => {
    const email = document.getElementById('emailAddress').value;
    const amount = parseFloat(document.getElementById('amountToPay').textContent.replace('GHS', '').trim());
    
    // Get phone number from an element (if it's not an input field)
    const phoneNumber = document.getElementById('phoneNumber').textContent.trim(); // Use textContent if the number is displayed in HTML
    const numberOfVotes = parseInt(document.getElementById('voteCount').value) || 0;
    const nomineeName = document.getElementById('nomineeName').textContent.trim(); // Get nominee name from element
    const eventId = document.getElementById('eventId').textContent.trim(); // Get event name from element

    // Ensure email and amount are valid
    if (!email || isNaN(amount) || amount <= 0) {
        alert('Please provide a valid email and amount.');
        return;
    }

    // Ensure phone number is valid
    if (!phoneNumber) {
        alert('Please provide a valid phone number.');
        return;
    }

    // Ensure nominee name and event name are available
    if (!nomineeName || !eventId) {
        alert('Nominee name and event id must be available.');
        return;
    }

    // Call the function to initialize Paystack payment
    initializePaystackPayment(email, amount, phoneNumber, numberOfVotes, nomineeName, eventId);
});

// Function to set a message in the UI
function setMessage(message) {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = message;
    }
}

// Fetch nominee data from the API
async function fetchNomineeData(nomineeId) {
    try {
        const response = await fetch(`/api/nominees/${nomineeId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch nominee data: ${response.status}`);
        }
        const nominee = await response.json();

        // Fetch the category name based on the nominee's category ID
        const categoryName = await fetchCategoryName(nominee.category_id);

        // Update nominee details with the category name
        updateNomineeDetails(nominee, categoryName);
    } catch (error) {
        console.error(error);
    }
}

// Fetch category name by ID
async function fetchCategoryName(categoryId) {
    try {
        const response = await fetch(`/api/categories/${categoryId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch category data: ${response.status}`);
        }
        const category = await response.json();
        return category;  // Return the category object
    } catch (error) {
        console.error(error);
        return null; // Return null in case of error
    }
}

// Frontend function to create a vote
async function createVote() {
    const nomineeId = document.getElementById('nomineeId').textContent; 
    const phoneNumber = document.getElementById('phoneNumber').textContent;
    const eventId = document.getElementById('eventId').textContent;
    const voteCount = parseInt(document.getElementById('voteCount').value); // Get votes count from an input field

    if ( !phoneNumber || !voteCount) {
        console.error('Required fields are missing');
        return;
    }

    try {
        const response = await fetch(`/api/votes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nomineeId: nomineeId,
                phoneNumber: phoneNumber,
                numberOfVotes: voteCount,
                amountPaid: voteCount * 100, // Assuming each vote costs 100 units
                eventId: eventId
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create vote');
        }

        const data = await response.json();
        console.log('Vote created:', data);
        alert("Vote submitted successfully!");

    } catch (error) {
        console.error('Error submitting vote:', error);
        alert("Error submitting vote. Please try again.");
    }
}


// createVote()


const nomId = new URLSearchParams(window.location.search).get('nomineeId');

// Update nominee details in the DOM
function updateNomineeDetails(nominee, category) {
    if (!nominee || !category) return;  // Handle null or undefined nominee and category

    document.getElementById('nomineeImage').src = nominee.image_url;
    document.getElementById('nomineeName').textContent = nominee.name;
    document.getElementById('nomineeCategory').textContent = category.name;  // Use category name
    document.getElementById('nomineeCode').textContent = nominee.nominee_code;
    document.getElementById('nomineeNameLabel').textContent = nominee.name;
    // document.getElementById('eventId').textContent = category.event_id;
    // document.getElementById('nomineeId').textContent = nominee.id;
    document.getElementById('eventId').textContent = category.event_id;  // Set the text content of the <h6> element
document.getElementById('nomineeId').textContent = nominee.id;  // Set the text content of the <span> inside <h6>

}

// Calculate the amount to pay based on vote count
function updateAmountToPay() {
    const voteCount = parseInt(document.getElementById('voteCount').value) || 0;
    const amount = voteCount * 1; // Assuming GHS 1 per vote
    document.getElementById('amountToPay').textContent = `GHS ${amount}`;
}

document.getElementById('voteCount').addEventListener('input', updateAmountToPay);

window.onload = function() {
    if (nomId) {
        fetchNomineeData(nomId);
    }
};
