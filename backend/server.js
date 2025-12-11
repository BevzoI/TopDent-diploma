// server.js
import { PORT } from './config.js';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import connectDB from './db.js';
import newsRouters from './routes/newsRouters.js';
import authRouters from './routes/authRouters.js';
import usersRouters from './routes/usersRouters.js';
import weekendRouters from './routes/weekendRouters.js';
import pollRouters from './routes/pollRouters.js';
import eventRoutes from './routes/eventRoutes.js';
import courseRoutes from "./routes/courseRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

await connectDB();

app.use(cors()); // Використовуємо CORS з дозволом для всіх запитів
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Початок API
app.get('/', (req, res) => { res.send('Api work!') }); // Health check
app.use('/news', newsRouters);
app.use('/auth', authRouters);
app.use('/users', usersRouters);
app.use('/weekend', weekendRouters);
app.use('/poll', pollRouters);
app.use('/events', eventRoutes);
app.use("/courses", courseRoutes);
app.use("/chat", chatRoutes);

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
