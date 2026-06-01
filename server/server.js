import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import connectDB  from './src/config/mongodb.js';
import authRouter from './src/routes/authRoute.js';


const app = express();
const PORT = process.env.PORT || 4000;
connectDB(); // Connect to MongoDB

app.use(express.json()); // all req and res will be in json format
app.use(cors({
    credentials: true, // allow cookies to be sent in cross-origin requests
}));
app.use(cookieParser()); // to parse cookies from incoming requests

// Define routes
app.get('/ping', (req, res) => {
    res.send('Hello from the server!');
});

app.use('/api/auth',authRouter); // all auth related routes will be prefixed with /api/auth

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});