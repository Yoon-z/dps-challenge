import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import dbmplRoutes from './dbmanuplation';
import word3Routes from './reportword3';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers['authorization'];

	if (!authHeader) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	const token = authHeader.split(' ')[1];

	if (token !== process.env.AUTH_TOKEN) {
		return res.status(403).json({ error: 'Forbidden' });
	}
	next();
};
app.use(express.json());
app.use(authenticateToken);
app.use('/dbmpl', dbmplRoutes);
app.use('/w3', word3Routes);

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
