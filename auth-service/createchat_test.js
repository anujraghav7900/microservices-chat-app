const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({status: res.statusCode, body, response: data}));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  try {
    // Step 1: Login with existing user
    console.log('=== STEP 1: Login ===');
    const loginBody = JSON.stringify({ email: 'testuser@example.com', password: 'password123' });
    const loginOptions = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginBody)
      }
    };

    const loginResult = await request(loginOptions, loginBody);
    console.log('LOGIN', loginResult.status, loginResult.response);
    const loginJson = JSON.parse(loginResult.response);
    if (!loginJson.token) {
      console.error('No token in login response');
      process.exit(1);
    }

    const token = loginJson.token;

    // Step 2: Create user with userId "rohit007"
    console.log('\n=== STEP 2: Create User rohit007 ===');
    const createUserBody = JSON.stringify({
      name: 'Rohit Kumar',
      email: 'rohit@example.com',
      userId: 'rohit007',
      password: 'password123'
    });
    const createUserOptions = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(createUserBody)
      }
    };

    const createUserResult = await request(createUserOptions, createUserBody);
    console.log('CREATE USER', createUserResult.status, createUserResult.response);

    // Step 3: Create chat with rohit007
    console.log('\n=== STEP 3: Create Chat ===');
    const createChatBody = JSON.stringify({ receiverUserId: 'rohit007' });
    const createChatOptions = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/chats',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(createChatBody)
      }
    };

    const createChatResult = await request(createChatOptions, createChatBody);
    console.log('CREATE CHAT', createChatResult.status, createChatResult.response);

  } catch (error) {
    console.error('ERROR', error.message);
    process.exit(1);
  }
})();