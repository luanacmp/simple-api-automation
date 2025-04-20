const { db } = require('../db');
const {
    createUser,
    getUserByEmail
} = require('../models/user');

describe('👤 Unit Tests for User Model', () => {
    const testEmail = `user${Date.now()}@test.com`;
    const testUser = {
        name: 'Test User',
        email: testEmail,
        password: '123456'
    };

    beforeAll((done) => {
        db.serialize(() => {
            db.run('DELETE FROM users WHERE email = ?', [testEmail], done);
        });
    });

    it('should create a new user', async () => {
        const userId = await createUser(testUser.name, testUser.email, testUser.password);
        expect(userId).toBeDefined();
        expect(typeof userId).toBe('number');
    });

    it('should retrieve the user by email', async () => {
        const user = await getUserByEmail(testUser.email);
        expect(user).toBeDefined();
        expect(user.name).toBe(testUser.name);
        expect(user.email).toBe(testUser.email);
        expect(user.password).toBe(testUser.password);
    });

    it('should return undefined for nonexistent email', async () => {
        const user = await getUserByEmail('not-found@test.com');
        expect(user).toBeUndefined();
    });
});
