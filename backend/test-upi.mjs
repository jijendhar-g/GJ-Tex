import fetch from 'node-fetch';

const testUpi = async () => {
    const payload = {
        key: 'b71846ce-1b65-40f2-b81e-ece9c4124d67',
        client_txn_id: `GJTEX_${Date.now()}_test`,
        amount: "1500.00",
        p_info: "Test Order",
        customer_name: "Test User",
        customer_email: "test@example.com",
        customer_mobile: "9999999999",
        redirect_url: 'http://localhost:5173/checkout',
        udf1: '',
        udf2: '',
        udf3: ''
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2));

    try {
        const response = await fetch('https://merchant.upigateway.com/api/create_order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log('Raw response:', text);
        try {
            console.log('Parsed JSON:', JSON.parse(text));
        } catch (e) { }
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

testUpi();
