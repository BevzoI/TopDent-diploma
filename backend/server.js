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
import groupsRoutes from "./routes/groupsRoutes.js"; // 🔥 ОБОВʼЯЗКОВО

const app = express();

await connectDB();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => { res.send('Api work!') });

app.use('/news', newsRouters);
app.use('/auth', authRouters);
app.use('/users', usersRouters);
app.use('/weekend', weekendRouters);
app.use('/poll', pollRouters);
app.use('/events', eventRoutes);
app.use("/courses", courseRoutes);
app.use("/chat", chatRoutes);
app.use("/groups", groupsRoutes); // 🔥 ОБОВʼЯЗКОВО

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;