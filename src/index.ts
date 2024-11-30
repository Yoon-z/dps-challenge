import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import db from './services/db.service';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Get all projects
app.get('/projects', (req: Request, res: Response) => {
	const selectProjectsQuery = `
        SELECT * FROM projects;
    `;

	try {
		const projects = db.query(selectProjectsQuery);

		res.status(200).json({
			message: 'Projects retrieved successfully.',
			data: projects,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'Failed to retrieve projects',
			error:
				error instanceof Error
					? error.message
					: 'An unknown error occurred',
		});
	}
});

// Delete specific project by id
app.delete('/delete/:id', (req: Request, res: Response) => {
	const projectId = req.params.id;

	const deleteProjectQuery = `
        DELETE FROM projects 
        WHERE id = @id;
    `;

	try {
		db.run(deleteProjectQuery, { id: projectId });
		res.status(200).json({
			message: `Project with id:${projectId} deleted successfully.`,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'Failed to delete project',
			error:
				error instanceof Error
					? error.message
					: 'An unknown error occurred',
		});
	}
});

// Create new project
app.post('/createproject', (req: Request, res: Response) => {
	const { name, description } = req.body;

	const insertProjectQuery = `
        INSERT INTO projects (name, description) 
        VALUES (@name, @description);
    `;

	try {
		const result = db.run(insertProjectQuery, { name, description });

		res.status(201).json({
			message: 'Project created successfully.',
			projectId: result.lastInsertRowid,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'Failed to create project',
			error:
				error instanceof Error
					? error.message
					: 'An unknown error occurred',
		});
	}
});

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
