import React, { useState, useEffect } from "react";
import CheckoutSdk from "@hubteljs/checkout";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useNominee } from "../../context/NomineContext";

const VotePage = () => {
  const { filteredNominees, categories } = useNominee();
  const { id } = useParams();
  const navigate = useNavigate();
  const [votes, setVotes] = useState(0);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [nominee, setNominee] = useState("");
  const [event, setEvent] = useState("");
  const [error, setError] = useState(null);
  const [categoryDetails, setCategoryDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch nominee data by ID
  useEffect(() => {
    const fetchNominee = async () => {
      try {
        const response = await axios.get(`https://xtocast-shiine.vercel.app/api/nominees/${id}`);
        setNominee(response.data);
      } catch (err) {
        setError("Failed to load nominee details");
      } finally {
        setLoading(false);
      }
    };

    fetchNominee();
  }, [id]);
  useEffect(() => {
    const fetchEvent = async () => {
      if (nominee && nominee.event_id) {
        try {
          const response = await axios.get(`https://xtocast-shiine.vercel.app/api/events/${nominee.event_id}`);
          setEvent(response.data);
        } catch (err) {
          setError("Failed to load events details");
        }
      }
    };

    fetchEvent();
  }, [nominee]); // Add nominee as a dependency

  // Extract unique category IDs
  const uniqueCategoryIds = [
    ...new Set(filteredNominees.map((nominee) => nominee.category_id)),
  ];

  // Fetch category details for each unique category ID
  useEffect(() => {
    // Step 1: Extract unique category IDs
    const uniqueCategoryIds = [
      ...new Set(filteredNominees.map((nominee) => nominee.category_id)),
    ];

    // Step 2: Fetch details for each unique category_id
    const fetchCategoryDetails = async () => {
      try {
        const details = await Promise.all(
          uniqueCategoryIds.map(async (categoryId) => {
            const response = await axios.get(`https://xtocast-shiine.vercel.app/api/category/${categoryId}`);
            return response.data; // Assuming the API returns full details of each category
          })
        );
        setCategoryDetails(details);
      } catch (error) {
        console.error("Error fetching category details:", error);
      }
    };

    if (uniqueCategoryIds.length > 0) {
      fetchCategoryDetails();
    }
  }, [filteredNominees]); // Only depend on filteredNominees

  const generateClientReference = () => `inv${Date.now()}`;

  const uniqueCategoryNames = Array.from(
    new Set(categoryDetails.map((category) => category.name))
  );

  // Initialize the Checkout SDK
  const checkout = new CheckoutSdk();

  const sendConfirmation = async (
    phoneNumber,
    numberOfVotes,
    nomineeName,
    eventName
  ) => {
    const message = `Congratulations! You have successfully casted ${numberOfVotes} vote(s) for ${nomineeName} in the ${eventName}. Thanks for voting.
    
    Xtocast - Bringing your events to life, One Click at a Time.`;

    try {
      await axios.post(
        "https://sms.arkesel.com/api/v2/sms/send",
        {
          sender: "Xtocast",
          message: message,
          recipients: [phoneNumber], // Ensure phoneNumber is a string here
        },
        {
          headers: { "api-key": "ZlZzZ1Z6UmROZ0dDVWpHaUdMck0" },
        }
      );
      console.log("SMS sent successfully");
    } catch (error) {
      console.error("SMS Error:", error.response?.data || error.message);
    }
  };

  const checkTransactionStatus = async (clientReference) => {
    try {
      const response = await axios.get(
        `https://api-txnstatus.hubtel.com/transactions/${clientReference}/status`,
        {
          headers: {
            Authorization:
              "Basic RDAyajB2NTo3ZjYxNjMzZDEwYTA0NzYzOWIxM2Q3YzYzOGJkMDgyZA==",
          },
        }
      );
      return response.data; // Return the response data containing the transaction status
    } catch (error) {
      console.error(
        "Error checking transaction status:",
        error.response?.data || error.message
      );
      throw error; // Rethrow the error to handle it in the calling function
    }
  };
  // Function to update the database with transaction information
  const updateDatabaseWithPayment = async (transactionData) => {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        throw new Error(
          "Failed to update transaction information in the database"
        );
      }

      console.log(
        "Transaction information successfully updated in the database"
      );
    } catch (error) {
      console.error("Error updating transaction information:", error);
    }
  };

  const initPay = async () => {
    if (votes < 1) {
      setMessage("Please enter a valid number of votes.");
      return;
    }

    // Macluumaadka iibsiga
    const purchaseInfo = {
      amount: votes,
      purchaseDescription: `${votes} votes for ${nominee.name} ${uniqueCategoryNames[0]} at GHS ${votes}`,
      customerPhoneNumber: "233551196764",
      clientReference: generateClientReference(),
    };

    // Xulashooyinka qaabeynta
    const config = {
      branding: "enabled",
      callbackUrl: import.meta.env.VITE_CALLBACK_URL, // Isticmaal .env
      merchantAccount: import.meta.env.VITE_MERCHANT_ACCOUNT, // Isticmaal .env
      basicAuth: import.meta.env.VITE_BASIC_AUTH, // Isticmaal .env
    };

    try {
      checkout.openModal({
        purchaseInfo,
        config,
        callBacks: {
          onInit: () => console.log("Iframe initialized: "),
          onPaymentSuccess: async (data) => {
            console.log("Payment succeeded: ", data);
            checkout.closePopUp();

            // Diyaari macluumaadka macaamilka
            const transactionData = {
              event_id: event.id, // Bedel ID-da dhabta ah ee dhacdadaada
              nominee_id: nominee.nominee.id, // Xasuusnow in nominee_code loo isticmaalo nominee_id
              trans_date: new Date().toISOString(), // Taariikhda iyo waqtiga hadda
              amount: votes,
              payment_method: "Mobile Money", // Bedel habka lacag-bixinta dhabta ah ee la isticmaalay
              status: "success", // Kuwa la xaqiijiyay in lacag-bixintu guulaysatay
              clientReference: purchaseInfo.clientReference, // Kaydi clientReference
            };

            // Cusbooneysii keydka macluumaadka lacag-bixinta iyo faahfaahinta macaamilka
            await updateDatabaseWithPayment(transactionData);

            // Hubi xaaladda macaamilka
            try {
              const statusData = await checkTransactionStatus(
                transactionData.clientReference
              );
              console.log("Fetched transaction status:", statusData);

              // Muujin farriin guul ah oo isticmaaleha
              setMessage(
                "Thank you for your vote! Your payment was successful."
              );
            } catch (error) {
              console.error("Failed to fetch transaction status:", error);
              setMessage(
                "Your payment was successful, but we couldn't fetch the transaction status."
              );
            }
          },
          onPaymentFailure: (data) => {
            console.log("Payment failed: ", data);
            setMessage("Payment failed. Please try again.");
          },
          onLoad: () => console.log("Checkout has been loaded: "),
          onFeesChanged: (fees) =>
            console.log("Payment channel has changed: ", fees),
          onResize: (size) =>
            console.log("Iframe has been resized: ", size?.height),
          onClose: (size) => console.log("The modal has closed ", size?.height),
        },
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      setMessage("Payment initiation failed. Please try again.");
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="flex justify-center items-center py-8 bg-white">
      <div className="max-w-[90%] mx-auto flex flex-col md:flex-row items-center gap-8">
        <div className="flex justify-center">
          <img
            src={nominee?.image_url || "/placeholder.jpg"}
            alt={nominee?.name || "Nominee Image"}
            className="w-full max-w-[400px] h-80 rounded-[50px] object-cover shadow-lg"
          />
        </div>
        {nominee ? (
          <div className="flex flex-col max-w-md">
            <h3 className="text-xl font-semibold text-black">{nominee.name}</h3>
            <h3 className="text-lg font-semibold text-black">
              {categoryDetails.length > 0
                ? categoryDetails.map((category, index) => (
                    <span key={index} className="block">
                      {category.name.trim()}
                    </span> // Each name in a new line
                  ))
                : "Category not found"}
            </h3>
            <h1 className="text-sm">
              USSD: *920*182# | Nominee Code: {nominee.nominee_code}
            </h1>
            <h6 className="text-md text-black mb-2">
              Enter number of votes for{" "}
              <span className="font-semibold">{nominee.name}</span>
            </h6>
            <input
              type="number"
              value={votes}
              onChange={(e) => setVotes(Number(e.target.value))}
              className="mb-3 w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter number of votes"
            />
            <h4 className="text-xl font-semibold text-black mb-1">
              Amount to Pay: <span className="font-bold">GHS {votes}.00</span>
            </h4>
            <h4 className="text-lg text-black mb-2">GHS 1 / vote</h4>
            <h4 className="text-lg font-medium text-black mb-2">
              Email Address (optional):
            </h4>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-3 w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Your Email"
            />
            {message && (
              <div className="text-sm text-red-600 mb-4">{message}</div>
            )}
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <button
                className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition duration-300 w-full md:w-auto"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                onClick={initPay}
                className="bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 w-full md:w-auto"
              >
                Submit
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center">Nominee not found</p>
        )}
      </div>
    </div>
  );
};

export default VotePage;
