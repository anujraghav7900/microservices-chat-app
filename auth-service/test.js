const http = require('http');

// Test 1: /test endpoint
const testReq = http.request({
    hostname: 'localhost',
    port: 5001,
    path: '/test',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}, (res) => {
    console.log(`\n/test - Status: ${res.statusCode}`);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Response:', data);
        
        // Test 2: /api/auth/register
        const authReq = http.request({
            hostname: 'localhost',
            port: 5001,
            path: '/api/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }, (res) => {
            console.log(`\n/api/auth/register - Status: ${res.statusCode}`);
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log('Response:', data);
                process.exit(0);
            });
        });
        
        authReq.on('error', err => {
            console.error('Auth request error:', err.message);
            process.exit(1);
        });
        
        authReq.write(JSON.stringify({
            name: "Test User",
            email: "test@example.com",
            password: "password123"
        }));
        authReq.end();
    });
});

testReq.on('error', err => {
    console.error('Test request error:', err.message);
    process.exit(1);
});

testReq.write(JSON.stringify({ test: 'data' }));
testReq.end();
