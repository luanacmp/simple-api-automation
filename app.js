const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const jwt = require('jsonwebtoken');
const { ensureUserTable } = require('./db');
const { createUser, getUserByEmail } = require('./models/User');
const { addMovie, getMovies, getMovieById, updateMovie, deleteMovie } = require('./models/Movie');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(express.json());

async function startServer() {
    await ensureUserTable();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
}

startServer();

const SECRET_KEY = 'your-secret-key';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'CRUD API with Registration and Login',
        version: '1.0.0',
        description: 'A simple CRUD API with user registration and login functionality documented with Swagger',
    },
    servers: [
        {
            url: `https://1494-2a01-11-f10-6e10-5061-de11-2740-b8fb.ngrok-free.app`,
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./app.js'], // Path to the API docs (JSDoc comments)
};

const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    console.log(token);
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Luana Pereira"
 *               email:
 *                 type: string
 *                 example: "example@email.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Luana Pereira"
 *                 email:
 *                   type: string
 *                   example: "example@email.com"
 *                 userId:
 *                   type: string
 *                   example: "670ea4b16bb5f624dca7822d"
 *       400:
 *         description: Bad request - Various reasons including missing fields or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - "Email is required"
 *                     - "Name is required"
 *                     - "Password is required"
 *                     - "Password should contain at least 4 characters"
 *                     - "User already exists"
 */
app.post('/register', async (req, res) => {
    try {
        const { name, email,  password } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }
        // if (password.length < 4) {
        //     return res.status(400).json({ message: 'Password should contain at least 4 characters' });
        // }
        let user = await getUserByEmail(email);
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        user = await createUser(name, email, password);
        return res.status(201).json({
            id: user,
            name,
            email,
        });
    } catch (e) {
        return res.status(500).json({ message: e });
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "example@email.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   example: "Luana Pereira"
 *                 token:
 *                   type: string
 *                   example: "kjhsdjgasj765879ayshkfjbasdf"
 *       400:
 *         description: Bad request - Various reasons including missing fields or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - "Email is required"
 *                     - "Password is required"
 *                     - "Password should contain at least 4 characters"
 *                     - "Invalid email or password"
 */
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // if (!email) return res.status(400).json({ message: 'Email is required' });
        if (!password) return res.status(400).json({ message: 'Password is required' });
        if (password.length < 4) return res.status(400).json({ message: 'Password should contain at least 4 characters' });
        const user = await getUserByEmail(email);
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ email, userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
        return res.status(201).json({ access_token: token });
    } catch (e) {
        return res.status(500).json({ message: e });
    }
});

// CRUD Endpoints (with JWT protection)

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Get all movies
 *     responses:
 *       201:
 *         description: Movies list successfully fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "1"
 *                   title:
 *                     type: string
 *                     example: "Friends"
 *                   rating:
 *                     type: number
 *                     example: 8.9
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - "Unauthorized"
 */
app.get('/movies', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        return res.json(await getMovies(userId));
    } catch (error) {
        return res.status(500).json({ message: e });
    }
});

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Get movie by ID
 *     responses:
 *       201:
 *         description: Movies by ID successfully fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "1"
 *                 title:
 *                   type: string
 *                   example: "Friends"
 *                 rating:
 *                   type: number
 *                   example: 8.9
 *       404:
 *         description: 404 Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - "Movie with an ID 2 not found"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - "Unauthorized"
 */
app.get('/movies/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const id = req.params.id;
        // const movie = res.json(await Movie.findOne({_id: id, userId}));
        const movie = await getMovieById(id, userId);
        if (movie) {
            return res.json(movie);
        } else {
            return res.status(404).json({ message: `Movie with ID ${id} is not found` });
        }
    } catch (e) {
        return res.status(500).json({ message: e });
    }
});

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Add movie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - rating
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Black Widow"
 *               rating:
 *                 type: string
 *                 example: "8.4"
 *     responses:
 *       201:
 *         description: Movie successfully added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "2"
 *                 title:
 *                   type: string
 *                   example: "Black Widow"
 *                 rating:
 *                   type: string
 *                   example: "8.4"
 *       400:
 *         description: Bad request - Various reasons including missing fields or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - "Title is required"
 *                     - "Rating is required"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - "Unauthorized"
 */
app.post('/movies', authenticateToken, async (req, res) => {
    try {
        const { title, rating, genre } = req.body;
        // if (!title) {
        //     return res.status(400).json({ message: 'Title is required' });
        // }
        // if (!rating) {
        //     return res.status(400).json({ message: 'Rating is required' });
        // }
        const userId = req.user.userId;
        const movie = await addMovie(title, rating, genre, userId);
        return res.status(201).json({
            id: movie, title, rating, genre, userId
        });
    } catch (e) {
        return res.status(500).json({ message: e });
    }
});

/**
 * @swagger
 * /movies/{id}:
 *   put:
 *     summary: Update a movie by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         example: 2
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Captain America"
 *               rating:
 *                 type: string
 *                 rating: "7.6"
 *     responses:
 *       201:
 *         description: Movie successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "2"
 *                 title:
 *                   type: string
 *                   example: "Captain America"
 *                 rating:
 *                   type: string
 *                   example: "8.4"
 *       400:
 *         description: Bad request - Various reasons including missing fields or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - "Title is required"
 *                     - "Rating is required"
 *       404:
 *         description: 404 Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - "Movie with an ID 2 not found"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - "Unauthorized"
 */
app.put('/movies/:id', authenticateToken, async (req, res) => {
    try {
        const { title, rating, genre } = req.body;
        // if (!title) {
        //     return res.status(400).json({ message: 'Title is required' });
        // }
        if (!rating) {
            return res.status(400).json({ message: 'Rating is required' });
        }
        const id = req.params.id;
        const userId = req.user.userId;
        const movie = await getMovieById(id, userId);
        if (movie) {
            await updateMovie(req.body, id);
            return res.json({...movie, ...req.body});
        } else {
            return res.status(404).json({ message: `Movie with ID ${id} is not found` });
        }
    } catch (e) {
        return res.status(500).json({ message: e });
    }
});

/**
 * @swagger
 * /movies/{id}:
 *   patch:
 *     summary: Update the movie with dynamic properties
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         example: 2
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties:
 *               type: string
 *     responses:
 *       201:
 *         description: Movie successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "2"
 *                 title:
 *                   type: string
 *                   example: "Captain America"
 *                 rating:
 *                   type: string
 *                   example: "8.4"
 *       404:
 *         description: 404 Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - "Movie with an ID 2 not found"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - "Unauthorized"
 */
app.patch('/movies/:id', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user.userId;
        const movie = await getMovieById(id, userId);
        // if (!movie) {
        //     return res.status(404).json({ message: `Movie with ID ${id} is not found` });
        // }
        const data = req.body;
        await updateMovie(data, id);
        return res.status(200).json({...movie, ...data});
    } catch (e) {
        return res.status(500).json({ message: e });
    }
});

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Delete the movie by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: "2"
 *     responses:
 *       201:
 *         description: Movie deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "2"
 *       404:
 *         description: 404 Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - "Movie with an ID 2 not found"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum:
 *                     - "Unauthorized"
*/
app.delete('/movies/:id', authenticateToken, async (req, res) => {
    const id = req.params.id;
    const userId = req.user.userId;
    if (!(await getMovieById(id, userId))) {
        return res.status(404).json({ message: `Movie with ID ${id} is not found` });
    }
    await deleteMovie(id);
    return res.status(200).json({id});
});
