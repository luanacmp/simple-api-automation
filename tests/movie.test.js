const request = require('supertest');
const app = require('../app');

let token;
let testUserId;
let movieIdToTest;

beforeAll(async () => {
    // Login with the user created in seed.js
    const res = await request(app)
        .post('/login')
        .send({ email: 'filme@test.com', password: '1234' });

    token = res.body.access_token;

    // Fetch all movies from the user
    const moviesRes = await request(app)
        .get('/movies?userId=1') // Change if user ID is not 1
        .set('Authorization', `Bearer ${token}`);

    testUserId = res.body.userId || 1;
    movieIdToTest = moviesRes.body[0]?.id; // Picks the first movie
});

describe('🎬 Movie API using seeded data', () => {
    it('should return all movies for the user', async () => {
        const res = await request(app)
            .get(`/movies?userId=${testUserId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it("should partially update a movie's title using PATCH", async () => {
        const res = await request(app)
            .patch(`/movies/${movieIdToTest}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Matrix Reloaded' });

        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('Matrix Reloaded');
    });

    it('should ignore unknown fields in PATCH request', async () => {
        const res = await request(app)
            .patch(`/movies/${movieIdToTest}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ foo: 'bar' });

        expect(res.statusCode).toBe(200);
        expect(res.body).not.toHaveProperty('foo');
    });

    it('should do nothing if no fields are sent in PATCH', async () => {
        const original = await request(app)
            .get(`/movies/${movieIdToTest}?userId=${testUserId}`)
            .set('Authorization', `Bearer ${token}`);

        const res = await request(app)
            .patch(`/movies/${movieIdToTest}`)
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe(original.body.title);
        expect(res.body.rating).toBe(original.body.rating);
    });

    it('should return 404 when PATCHing a non-existent movie', async () => {
        const fakeId = 99999;

        const res = await request(app)
            .patch(`/movies/${fakeId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Ghost Movie' });

        expect(res.statusCode).toBe(404); // Ajustado corretamente
    });
});
