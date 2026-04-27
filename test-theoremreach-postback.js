/**
 * Test script for TheoremReach postback endpoint
 * 
 * Usage:
 * 1. Replace USER_ID with a valid user ID from your database
 * 2. Replace SECRET_KEY with your THEOREMREACH_SECRET_KEY
 * 3. Run: node test-theoremreach-postback.js
 */

const crypto = require('crypto');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Change to https://rewardoxy.app for production
const USER_ID = 'YOUR_USER_ID_HERE'; // Replace with actual user ID
const SECRET_KEY = '3b77cff8a08ae8c642f5661b3f7b857801895837'; // Your TheoremReach secret key
const TRANSACTION_ID = `test_${Date.now()}`;
const REWARD = 700; // 700 coins = $1 USD
const PLACEMENT_ID = '84246d7d-8e8b-4797-9cb2-faaafa56ad98';

// Build query parameters (sorted alphabetically)
const params = new URLSearchParams();
params.append('placement_id', PLACEMENT_ID);
params.append('reward', REWARD.toString());
params.append('transaction_id', TRANSACTION_ID);
params.append('user_id', USER_ID);

// Sort parameters alphabetically
const sortedParams = Array.from(params.entries())
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([key, value]) => `${key}=${value}`)
  .join('&');

console.log('Sorted params:', sortedParams);

// Generate signature
const signature = crypto
  .createHmac('sha256', SECRET_KEY)
  .update(sortedParams)
  .digest('hex');

console.log('Generated signature:', signature);

// Add signature to params
params.append('signature', signature);

// Build full URL
const url = `${BASE_URL}/api/theoremreach-postback?${params.toString()}`;

console.log('\nTest URL:', url);
console.log('\nSending test postback...\n');

// Send request
fetch(url)
  .then(response => {
    console.log('Status:', response.status);
    return response.text();
  })
  .then(body => {
    console.log('Response:', body);
    console.log('\n✅ Test completed!');
    console.log('\nCheck your database for the transaction:');
    console.log(`SELECT * FROM theoremreach_transactions WHERE tx_id = '${TRANSACTION_ID}';`);
    console.log('\nCheck user balance:');
    console.log(`SELECT coins_balance, total_earned FROM users WHERE id = '${USER_ID}';`);
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
