const axios = require("axios");
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API_BASE_URL = process.env.PAYPAL_API_BASE_URL
const PAYPAL_API_ACCESS_TOKEN = process.env.PAYPAL_API_ACCESS_TOKEN


async function getAccessToken() {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
    const response = await axios.post(
      `${PAYPAL_API_BASE_URL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting PayPal access token", error.message);
    throw new Error("Failed to obtain access token");
  }
}

async function makePayout(receiverId, amount) {
  try {
    // const accessToken = await getAccessToken();
    const payoutData = {
      sender_batch_header: {
        sender_batch_id: `batch_${Date.now()}`,
        email_subject: "You have a payout!",
        email_message: "You have received a payout! Thanks for using our service!",
      },
      items: [
        {
          recipient_type: "PAYPAL_ID",
          amount: {
            value: amount,
            currency: "USD",
          },
          note: "Payment for service",
          sender_item_id: `item_${Date.now()}`,
          receiver: receiverId,
          // receiver: "ZQ7GTTUACFRBC",
        },
      ],
    };

    const response = await axios.post(`${PAYPAL_API_BASE_URL}/v1/payments/payouts`, payoutData, {
      headers: {
        Authorization: `Bearer ${PAYPAL_API_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return { success: true, data: response.data};
  } catch (error) {
    console.log("Error making payout", error.response.data.details);
    return { error: error.response.data.name, message: error.response.data.details, success: false};
    // throw new Error("Failed to make payout");
    // return error.response.data;
  }
}

module.exports = {
    getAccessToken,
    makePayout
}