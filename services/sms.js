import axios from "axios";


export const sendConfirmation = async (phoneNumber, numberOfVotes, nomineeName, eventName) => {
  const message = `Congratulations! You have successfully casted ${numberOfVotes} vote(s) for ${nomineeName} in the ${eventName}. Thanks for voting.

Xtocast - Bringing your events to life, One Click at a Time.`;

  try {
    await axios.post('https://sms.arkesel.com/api/v2/sms/send', {
      sender: 'Xtocast',
      message: message,
      recipients: [phoneNumber]
    }, {
      headers: { 'api-key': 'ZlZzZ1Z6UmROZ0dDVWpHaUdMck0' }
    });
    console.log("send ")
  } catch (error) {
    console.error('SMS Error:', error);
  }
};
