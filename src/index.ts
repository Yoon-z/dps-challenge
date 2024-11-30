import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import db from './services/db.service';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Get all projects
app.get('/allprojects', (req: Request, res: Response) => {
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
app.delete('/deleteproject/:id', (req: Request, res: Response) => {
	const projectId = req.params.id.toString();

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

//only for test
app.delete('/deleteprojectname/:name', (req: Request, res: Response) => {
	const name = req.params.name;

	const deleteProjectQuery = `
        DELETE FROM projects 
        WHERE name = @name;
    `;

	try {
		db.run(deleteProjectQuery, { name: name });
		res.status(200).json({
			message: `Project with name:${name} deleted successfully.`,
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

interface CountResult {
	total: number;
}

// Create new project
app.post('/createproject', (req: Request, res: Response) => {
	const { name, description } = req.body;

	const countQuery = `
        SELECT COUNT(*) AS total 
        FROM projects;
    `;

	try {
		const countResult = db.query(countQuery) as CountResult[];
		const totalCount = countResult[0]?.total;
		const newId = (totalCount + 1).toString();

		const insertProjectQuery = `
            INSERT INTO projects (id, name, description) 
            VALUES (@id, @name, @description);
        `;

		const result = db.run(insertProjectQuery, {
			id: newId,
			name,
			description,
		});

		res.status(201).json({
			message: 'Project created successfully.',
			result,
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

// Update project name or description by id
app.patch('/updateproject/:id', (req: Request, res: Response) => {
	const projectId = req.params.id;
	const { name, description } = req.body;

	const updates = [];
	if (name) updates.push(`name = @name`);
	if (description) updates.push(`description = @description`);

	if (updates.length === 0) {
		return res.status(400).json({
			message: 'No valid fields provided to update.',
		});
	}

	const updateQuery = `
        UPDATE projects 
        SET ${updates.join(', ')} 
        WHERE id = @id;
    `;

	try {
		const result = db.run(updateQuery, {
			id: projectId,
			name,
			description,
		});

		if (result.changes === 0) {
			return res.status(404).json({
				message: `Project with id:${projectId} not found.`,
			});
		}

		res.status(200).json({
			message: `Project with id:${projectId} updated successfully.`,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'Failed to update project',
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
