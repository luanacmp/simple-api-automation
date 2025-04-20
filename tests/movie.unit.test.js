const { db } = require('../db');
const {
    addMovie,
    getMovieById,
    deleteMovie
} = require('../models/movie');

describe('🎯 Unit Tests for Movie Model', () => {
    let movieId;
    const mockMovie = {
        title: 'Unit Test Movie',
        rating: '9.9',
        genre: 'Test',
        userId: 999 // mock user ID
    };

    beforeAll((done) => {
        db.serialize(() => {
            db.run('DELETE FROM movies WHERE userId = ?', [mockMovie.userId], done);
        });
    });

    it('should insert a movie into the database', async () => {
        movieId = await addMovie(
            mockMovie.title,
            mockMovie.rating,
            mockMovie.genre,
            mockMovie.userId
        );

        expect(movieId).toBeDefined();
        expect(typeof movieId).toBe('number');
    });

    it('should retrieve the movie by ID and userId', async () => {
        const movie = await getMovieById(movieId, mockMovie.userId);

        expect(movie).toBeDefined();
        expect(movie.title).toBe(mockMovie.title);
        expect(movie.genre).toBe(mockMovie.genre);
        expect(movie.rating).toBe(mockMovie.rating);
    });

    it('should delete the movie by ID', async () => {
        const deleted = await deleteMovie(movieId);
        expect(deleted).toBe(1); // 1 row affected

        const check = await getMovieById(movieId, mockMovie.userId);
        expect(check).toBeUndefined();
    });
});
