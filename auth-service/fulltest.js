const http = require('http');

function makeRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: data
                });
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    try {
        console.log('\n=== STEP 1: Register User ===');
        const registerResp = await makeRequest('POST', '/api/auth/register', {
            name: "Test User",
            email: "testuser@example.com",
            password: "password123"
        });
        console.log('Status:', registerResp.status);
        console.log('Response:', registerResp.body);

        console.log('\n=== STEP 2: Login ===');
        const loginResp = await makeRequest('POST', '/api/auth/login', {
            email: "testuser@example.com",
            password: "password123"
        });
        console.log('Status:', loginResp.status);
        console.log('Response:', loginResp.body);

        const loginData = JSON.parse(loginResp.body);
        const token = loginData.token;

        if (!token) {
            console.error('No token received!');
            process.exit(1);
        }

        console.log('Token:', token);

        console.log('\n=== STEP 3: Access Protected Route (/profile) ===');
        const profileResp = await makeRequest('GET', '/profile', null);
        console.log('Status (without token):', profileResp.status);
        console.log('Response:', profileResp.body);

        // Now with token
        const optionsWithToken = {
            hostname: 'localhost',
            port: 5001,
            path: '/profile',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };

        const profileResp2 = await new Promise((resolve, reject) => {
            const req = http.request(optionsWithToken, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    resolve({
                        status: res.statusCode,
                        body: data
                    });
                });
            });
            req.on('error', reject);
            req.end();
        });

        console.log('Status (with token):', profileResp2.status);
        console.log('Response:', profileResp2.body);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

runTests();
