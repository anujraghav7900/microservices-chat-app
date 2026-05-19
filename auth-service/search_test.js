const http = require('http');

const loginBody = JSON.stringify({ email: 'anuj@gmail.com', password: '123456' });
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

const loginReq = http.request(loginOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('LOGIN', res.statusCode, data);
    try {
      const json = JSON.parse(data);
      const token = json.token;
      const userId = json.user.userId;
      if (!token) {
        console.error('No token returned');
        return;
      }

      const searchOptions = {
        hostname: 'localhost',
        port: 5001,
        path: `/api/users/search/${userId}`,
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const searchReq = http.request(searchOptions, (searchRes) => {
        let searchData = '';
        searchRes.on('data', (chunk) => searchData += chunk);
        searchRes.on('end', () => {
          console.log('SEARCH', searchRes.statusCode, searchData);
        });
      });
      searchReq.on('error', (err) => console.error('SEARCH ERR', err.message));
      searchReq.end();
    } catch (err) {
      console.error('PARSE ERR', err.message);
    }
  });
});

loginReq.on('error', (err) => console.error('LOGIN ERR', err.message));
loginReq.write(loginBody);
loginReq.end();
