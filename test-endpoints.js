const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

const testEndpoints = async () => {
  try {
    // Test health endpoint
    console.log('\nTesting health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('Health check:', healthResponse.data);

    // Test auth endpoints
    console.log('\nTesting auth endpoints...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'admin@vision-intek.com',
        password: 'admin123'
      });
      console.log('Login successful:', loginResponse.data);
      
      const token = loginResponse.data.token;
      
      // Test protected endpoints with token
      const headers = { Authorization: `Bearer ${token}` };
      
      // Test services endpoint
      console.log('\nTesting services endpoint...');
      const servicesResponse = await axios.get(`${BASE_URL}/api/services`, { headers });
      console.log('Services:', servicesResponse.data.length, 'services found');
      
      // Test products endpoint
      console.log('\nTesting products endpoint...');
      const productsResponse = await axios.get(`${BASE_URL}/api/products`, { headers });
      console.log('Products:', productsResponse.data.length, 'products found');
      
      // Test categories endpoint
      console.log('\nTesting categories endpoint...');
      const categoriesResponse = await axios.get(`${BASE_URL}/api/categories`, { headers });
      console.log('Categories:', categoriesResponse.data.length, 'categories found');
      
      // Test events endpoint
      console.log('\nTesting events endpoint...');
      const eventsResponse = await axios.get(`${BASE_URL}/api/events`, { headers });
      console.log('Events:', eventsResponse.data.length, 'events found');
      
      // Test team endpoint
      console.log('\nTesting team endpoint...');
      const teamResponse = await axios.get(`${BASE_URL}/api/team`, { headers });
      console.log('Team members:', teamResponse.data.length, 'members found');
      
      // Test partners endpoint
      console.log('\nTesting partners endpoint...');
      const partnersResponse = await axios.get(`${BASE_URL}/api/partners`, { headers });
      console.log('Partners:', partnersResponse.data.length, 'partners found');
      
      // Test company endpoint
      console.log('\nTesting company endpoint...');
      const companyResponse = await axios.get(`${BASE_URL}/api/company`, { headers });
      console.log('Company info:', companyResponse.data);
      
      // Test contact endpoint
      console.log('\nTesting contact endpoint...');
      const contactResponse = await axios.get(`${BASE_URL}/api/contact`, { headers });
      console.log('Contact info:', contactResponse.data);
      
      // Test clients endpoint
      console.log('\nTesting clients endpoint...');
      const clientsResponse = await axios.get(`${BASE_URL}/api/clients`, { headers });
      console.log('Clients:', clientsResponse.data.length, 'clients found');
      
    } catch (error) {
      console.error('Auth test failed:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
};

testEndpoints(); 