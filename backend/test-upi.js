// Quick test script — run: node test-upi.js
const payload = {
    key: 'b71846ce-1b65-40f2-b81e-ece9c4124d67',
    client_txn_id: 'TEST_' + Date.now(),
    amount: '10.00',
    p_info: 'Test Order',
    customer_name: 'Test User',
    customer_email: 'test@example.com',
    customer_mobile: '9876543210',
    redirect_url: 'http://localhost:5173/checkout',
    udf1: '',
    udf2: '',
    udf3: ''
};

console.log('Sending payload:', JSON.stringify(payload, null, 2));

fetch('https://merchant.upigateway.com/api/create_order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
})
    .then(r => r.text())
    .then(t => {
        console.log('RAW RESPONSE:', t);
        try { console.log('PARSED:', JSON.parse(t)); } catch (e) { }
    })
    .catch(e => console.error('FETCH ERROR:', e));
