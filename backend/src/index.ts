import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import employeesRouter from './routes/employees';
import emailsRouter from './routes/emails';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/employees', employeesRouter);
app.use('/emails', emailsRouter);

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});