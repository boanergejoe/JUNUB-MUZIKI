// PesaPal Payment Integration Service
import crypto from 'crypto';
import axios from 'axios';
import "../config/env.js";

export const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
export const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
export const PESAPAL_BASE_URL = "https://store.pesapal.com";
const PESAPAL_API_URL = "https://pay.pesapal.com";

// Generate OAuth signature for PesaPal requests
const generateOAuthSignature = (url, params, consumerSecret) => {
    // Sort parameters and create query string
    const sortedParams = Object.keys(params).sort().map(key => 
        `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    ).join('&');
    
    const signatureBase = `POST&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
    const signature = crypto
        .createHmac('sha1', consumerSecret + '&')
        .update(signatureBase)
        .digest('base64');
    
    return signature;
};

// Get OAuth token from PesaPal
const getOAuthToken = async () => {
    const timestamp = new Date().toISOString().replace(/[-:TZ\.]/g, '').slice(0, 14);
    const nonce = crypto.randomBytes(10).toString('hex');
    
    const params = {
        oauth_consumer_key: PESAPAL_CONSUMER_KEY,
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: timestamp,
        oauth_nonce: nonce,
        oauth_version: "1.0",
        oauth_callback: "https://melodymedemo.com/payment-callback",
    };
    
    const signature = generateOAuthSignature(
        `${PESAPAL_API_URL}/api/RequestToken`,
        params,
        PESAPAL_CONSUMER_SECRET
    );
    
    params.oauth_signature = signature;
    
    try {
        const response = await axios.post(
            `${PESAPAL_API_URL}/api/RequestToken`,
            null,
            {
                params: params,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error("Error getting OAuth token:", error.response?.data || error.message);
        throw error;
    }
};

// Create PesaPal payment order
const createPaymentOrder = async (orderTrackingId, amount, description, plan) => {
    const timestamp = new Date().toISOString().replace(/[-:TZ\.]/g, '').slice(0, 14);
    const nonce = crypto.randomBytes(10).toString('hex');
    
    // Prepare the payment request parameters
    const params = {
        oauth_consumer_key: PESAPAL_CONSUMER_KEY,
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: timestamp,
        oauth_nonce: nonce,
        oauth_version: "1.0",
        oauth_token: "", // Will be filled after getting token
        "pesapal_request_data": JSON.stringify({
            "pesapal_transaction_tracking_id": orderTrackingId,
            "pesapal_merchant_reference": orderTrackingId,
            "amount": amount,
            "currency": "USD",
            "description": description,
            "type": "MERCHANT",
            "payment_method": "",
            "user": {
                "email": "",
                "phone_number": "",
                "first_name": "",
                "last_name": ""
            },
            "callback_url": "https://melodymedemo.com/api/payment-callback",
            "redirect_mode": "POST",
            "no_of_days": 5
        })
    };
    
    try {
        // First get the OAuth token
        const tokenData = await getOAuthToken();
        
        if (!tokenData.token) {
            throw new Error("Failed to get OAuth token");
        }
        
        params.oauth_token = tokenData.token;
        
        const signature = generateOAuthSignature(
            `${PESAPAL_API_URL}/api/PostOrderXML`,
            params,
            PESAPAL_CONSUMER_SECRET
        );
        
        params.oauth_signature = signature;
        
        const response = await axios.post(
            `${PESAPAL_API_URL}/api/PostOrderXML`,
            null,
            {
                params: params,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error("Error creating payment order:", error.response?.data || error.message);
        throw error;
    }
};

// Get payment status
const getPaymentStatus = async (orderTrackingId) => {
    const timestamp = new Date().toISOString().replace(/[-:TZ\.]/g, '').slice(0, 14);
    const nonce = crypto.randomBytes(10).toString('hex');
    
    const params = {
        oauth_consumer_key: PESAPAL_CONSUMER_KEY,
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: timestamp,
        oauth_nonce: nonce,
        oauth_version: "1.0",
        oauth_token: "", // Will be filled after getting token
        pesapal_merchant_reference: orderTrackingId,
        pesapal_transaction_tracking_id: orderTrackingId
    };
    
    try {
        // First get the OAuth token
        const tokenData = await getOAuthToken();
        
        if (!tokenData.token) {
            throw new Error("Failed to get OAuth token");
        }
        
        params.oauth_token = tokenData.token;
        
        const signature = generateOAuthSignature(
            `${PESAPAL_API_URL}/api/QueryPaymentDetails`,
            params,
            PESAPAL_CONSUMER_SECRET
        );
        
        params.oauth_signature = signature;
        
        const response = await axios.get(
            `${PESAPAL_API_URL}/api/QueryPaymentDetails`,
            {
                params: params,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error("Error getting payment status:", error.response?.data || error.message);
        throw error;
    }
};

// Generate embed code URL for PesaPal
export const getPesaPalEmbedUrl = (pageUrl) => {
    return `${PESAPAL_BASE_URL}/embed-code?pageUrl=${encodeURIComponent(pageUrl)}`;
};

// Generate share URL for PesaPal
export const getPesaPalShareUrl = () => {
    return `${PESAPAL_BASE_URL}/send`;
};

export { getOAuthToken, createPaymentOrder, getPaymentStatus };