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

    // Step 2: Test Private Chat API
    console.log('\n=== STEP 2: Test Private Chat API ===');
    const privateChatBody = JSON.stringify({ receiverUserId: 'rohit007' });
    const privateChatOptions = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/chats/private',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(privateChatBody)
      }
    };

    const privateChatResult = await request(privateChatOptions, privateChatBody);
    console.log('PRIVATE CHAT', privateChatResult.status, privateChatResult.response);

    // Step 3: Create another user for group chat
    console.log('\n=== STEP 3: Create User aman99 ===');
    const createUserBody = JSON.stringify({
      name: 'Aman Singh',
      email: 'aman@example.com',
      userId: 'aman99',
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

    // Step 4: Test Group Chat API
    console.log('\n=== STEP 4: Test Group Chat API ===');
    const groupChatBody = JSON.stringify({
      chatName: 'College Friends',
      members: ['rohit007', 'aman99']
    });
    const groupChatOptions = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/chats/group',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(groupChatBody)
      }
    };

    const groupChatResult = await request(groupChatOptions, groupChatBody);
    console.log('GROUP CHAT', groupChatResult.status, groupChatResult.response);

  } catch (error) {
    console.error('ERROR', error.message);
    process.exit(1);
  }
})();