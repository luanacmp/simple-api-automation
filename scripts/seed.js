const axios = require('axios');

const API = 'http://localhost:3000';

const user = {
    name: 'Mock User',
    email: `mock${Date.now()}@test.com`,
    password: '123456'
};

const movies = [
    { title: 'Matrix', rating: '9.0', genre: 'Action' },
    { title: 'Inception', rating: '8.9', genre: 'Sci-Fi' },
    { title: 'Barbie', rating: '7.5', genre: 'Comedy' },
    { title: 'Interstellar', rating: '9.2', genre: 'Drama' },
    { title: 'The Batman', rating: '8.4', genre: 'Action' },
];

(async () => {
    try {
        // 1. Register the user
        await axios.post(`${API}/register`, user);
        console.log('✅ User registered:', user.email);

        // 2. Log in
        const login = await axios.post(`${API}/login`, {
            email: user.email,
            password: user.password
        });

        const token = login.data.access_token;
        console.log('🔐 JWT token:', token);

        // 3. Create movies using the token
        for (const movie of movies) {
            const res = await axios.post(`${API}/movies`, movie, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('🎬 Movie created:', res.data.title);
        }

        console.log('🚀 Seed completed successfully!');
    } catch (err) {
        console.error('❌ Error during seed:', err.response?.data || err.message);
    }
})();
