import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import healthRiskRoute from './routes/health-risk-route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/health-risk', healthRiskRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
