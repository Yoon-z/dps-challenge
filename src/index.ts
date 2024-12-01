import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import dbmplRoutes from './dbmanuplation';
import word3Routes from './reportword3';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers['authorization'];
	if (!token) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	if (token !== process.env.AUTH_TOKEN) {
		return res.status(403).json({ error: 'Forbidden' });
	}
	next();
};
app.use(authenticateToken);
app.use('/dbmpl', dbmplRoutes);
app.use('/w3', word3Routes);
app.use(express.json());

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
