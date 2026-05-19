const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, response: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function test() {
  try {
    const base = 'localhost';
    const port = 5001;

    const users = [
      { name: 'Anuj', userId: 'anuj123', email: 'anuj@gmail.com', password: '123456' },
      { name: 'Rahul', userId: 'rahul123', email: 'rahul@gmail.com', password: '123456' }
    ];

    console.log('=== REGISTER USERS ===');
    for (const user of users) {
      const body = JSON.stringify(user);
      const options = {
        hostname: base,
        port,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
      };
      const result = await request(options, body);
      console.log(user.userId, result.status, result.response);
    }

    console.log('\n=== LOGIN AS USER 1 ===');
    const loginBody = JSON.stringify({ email: users[0].email, password: users[0].password });
    const loginOptions = {
      hostname: base,
      port,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginBody) }
    };
    const loginResult = await request(loginOptions, loginBody);
    console.log('LOGIN', loginResult.status, loginResult.response);
    const loginJson = JSON.parse(loginResult.response);
    const token = loginJson.token;
    if (!token) throw new Error('No token returned');

    const authHeader = { Authorization: `Bearer ${token}` };

    console.log('\n=== SEARCH USER ===');
    const searchOptions = {
      hostname: base,
      port,
      path: `/api/users/search/${users[0].userId}`,
      method: 'GET',
      headers: authHeader
    };
    const searchResult = await request(searchOptions);
    console.log('SEARCH', searchResult.status, searchResult.response);

    console.log('\n=== CREATE PRIVATE CHAT ===');
    const privateBody = JSON.stringify({ userId: users[1].userId });
    const privateOptions = {
      hostname: base,
      port,
      path: '/api/chats/private',
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(privateBody) }
    };
    const privateChatResult = await request(privateOptions, privateBody);
    console.log('PRIVATE CHAT', privateChatResult.status, privateChatResult.response);
    const privateChatJson = JSON.parse(privateChatResult.response);
    const privateChatId = privateChatJson.chatId;

    console.log('\n=== CREATE GROUP CHAT ===');
    const groupBody = JSON.stringify({ groupName: 'College Friends', members: [users[1].userId] });
    const groupOptions = {
      hostname: base,
      port,
      path: '/api/chats/group',
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(groupBody) }
    };
    const groupChatResult = await request(groupOptions, groupBody);
    console.log('GROUP CHAT', groupChatResult.status, groupChatResult.response);
    const groupChatJson = JSON.parse(groupChatResult.response);
    const groupChatId = groupChatJson.chatId;

    console.log('\n=== SEND MESSAGE ===');
    const messageBody = JSON.stringify({ chatId: privateChatId, message: 'Hello Bro' });
    const messageOptions = {
      hostname: base,
      port,
      path: '/api/messages',
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(messageBody) }
    };
    const messageResult = await request(messageOptions, messageBody);
    console.log('SEND MESSAGE', messageResult.status, messageResult.response);

    console.log('\n=== GET MESSAGES ===');
    const getMessagesOptions = {
      hostname: base,
      port,
      path: `/api/messages/${privateChatId}`,
      method: 'GET',
      headers: authHeader
    };
    const getMessagesResult = await request(getMessagesOptions);
    console.log('GET MESSAGES', getMessagesResult.status, getMessagesResult.response);

    console.log('\n=== TEST COMPLETE ===');
  } catch (error) {
    console.error('ERROR', error.message);
    process.exit(1);
  }
}

test();