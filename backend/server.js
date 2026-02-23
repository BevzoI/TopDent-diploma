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
import groupsRoutes from "./routes/groupsRoutes.js"; // 🔥 ДОДАНО

const app = express();

await connectDB();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/', (req, res) => { 
  res.send('Api work!') 
});

// API routes
app.use('/news', newsRouters);
app.use('/auth', authRouters);
app.use('/users', usersRouters);
app.use('/groups', groupsRoutes); // 🔥 ДОДАНО
app.use('/weekend', weekendRouters);
app.use('/poll', pollRouters);
app.use('/events', eventRoutes);
app.use("/courses", courseRoutes);
app.use("/chat", chatRoutes);

// Local / Vercel
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;

if (!isVercel) {
	app.listen(PORT, () => {
		console.log(`Server is running locally at http://localhost:${PORT}`);
	});
}

export default app;