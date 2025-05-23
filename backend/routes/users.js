const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - password
 *               - nic
 *               - role
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               nic:
 *                 type: string
 *               contact_number:
 *                 type: string
 *               address:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user, first_responder]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Missing required fields or user already exists
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login and return access & refresh tokens
 *     tags: [Users]
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
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful with JWT tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 expiresIn:
 *                   type: integer
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     full_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/users/refresh-token:
 *   post:
 *     summary: Get a new access token using a refresh token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 expiresIn:
 *                   type: integer
 *       401:
 *         description: Refresh token missing
 *       403:
 *         description: Invalid or expired refresh token
 */

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Logout user by invalidating refresh token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Refresh token required
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile (requires auth)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data returned
 *       401:
 *         description: Missing or invalid token
 */

router.post('/register', usersController.registerUser);
router.post('/login', usersController.loginUser);
router.post('/refresh-token', usersController.refreshToken);
router.post('/logout', usersController.logoutUser);
/*router.get('/profile', usersController.verifyToken, usersController.getProfile);*/
router.get('/profile', usersController.verifyToken, usersController.getProfile);


module.exports = router;
