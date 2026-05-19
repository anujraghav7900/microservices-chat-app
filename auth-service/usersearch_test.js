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
    const searchOptions = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/users/CHAT7543',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    const searchResult = await request(searchOptions);
    console.log('SEARCH', searchResult.status, searchResult.response);
  } catch (error) {
    console.error('ERROR', error.message);
    process.exit(1);
  }
})();