import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';


const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json()); // all req and res will be in json format
app.use(cors({
    credentials: true, // allow cookies to be sent in cross-origin requests
}));
app.use(cookieParser()); // to parse cookies from incoming requests

// Define routes
app.get('/', (req, res) => {
    res.send('Hello from the server!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});