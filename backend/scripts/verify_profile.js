const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const EMAIL = 'test@example.com'; // User created in previous step
const PASSWORD = 'password123';

async function verifyProfile() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        const token = loginRes.data.token;
        console.log('Login successful. Token received.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Get Profile
        console.log('Fetching profile...');
        const profileRes = await axios.get(`${API_URL}/user/profile`, config);
        console.log('Current Name:', profileRes.data.name);

        // 3. Update Profile
        const newName = 'Updated Name ' + Math.floor(Math.random() * 1000);
        console.log(`Updating name to: ${newName}...`);

        // Note: We are testing JSON update here. File upload testing is harder in script without form-data lib setup with streams, 
        // but this verifies the controller logic for text updates at least.
        const updateRes = await axios.put(`${API_URL}/user/profile`, {
            name: newName,
            email: EMAIL
        }, config);
        console.log('Update response name:', updateRes.data.name);

        if (updateRes.data.name === newName) {
            console.log('SUCCESS: Profile name updated successfully.');
        } else {
            console.log('FAILURE: Name did not update.');
        }

    } catch (error) {
        console.error('Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verifyProfile();
