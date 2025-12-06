// server.js
import { PORT } from './config.js';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './db.js';
import newsRouters from './routes/newsRouters.js';
import authRouters from './routes/authRouters.js';

const app = express();

await connectDB();

app.use(cors()); // Використовуємо CORS з дозволом для всіх запитів
app.use(bodyParser.json()); // Middleware для обробки JSON
app.use(bodyParser.urlencoded({ extended: true }));

// Початок API
app.get('/', (req, res) => { res.send('Api work!') }); // Health check
app.use('/news', newsRouters);
app.use('/auth', authRouters);


// Vercel або локальний режим
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;

// Якщо запускається на Vercel — експортуємо app
if (!isVercel) {
	// Якщо локально — слухаємо порт
	app.listen(PORT, () => {
		console.log(`Server is running locally at http://localhost:${PORT}`);
	});
}

export default app;
