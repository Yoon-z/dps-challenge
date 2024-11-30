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

// Get project by id
app.get('/getproject/:id', (req: Request, res: Response) => {
	const projectId = req.params.id.toString();

	const selectProjectsQuery = `
        SELECT * FROM projects 
        WHERE id = @id;
    `;

	try {
		const project = db.query(selectProjectsQuery, { id: projectId });

		res.status(200).json({
			message: 'Projects retrieved successfully.',
			data: project,
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

		const reorderIdsQuery = `
            UPDATE projects
            SET id = (
                SELECT row_number FROM (
                    SELECT ROW_NUMBER() OVER (ORDER BY id) AS row_number, id
                    FROM projects
                ) AS subquery
                WHERE projects.id = subquery.id
            )
        `;

		db.run(reorderIdsQuery);

		res.status(200).json({
			message: `Project with id:${projectId} deleted successfully and IDs reordered.`,
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
	const projectId = req.params.id.toString();
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

// Get all reports
app.get('/allreports', (req: Request, res: Response) => {
	const selectReportsQuery = `
        SELECT * FROM reports;
    `;

	try {
		const reports = db.query(selectReportsQuery);

		res.status(200).json({
			message: 'Reports retrieved successfully.',
			data: reports,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'Failed to retrieve reports',
			error:
				error instanceof Error
					? error.message
					: 'An unknown error occurred',
		});
	}
});

// Get report by id
app.get('/getreport/:id', (req: Request, res: Response) => {
	const reportId = req.params.id.toString();

	const selectReportsQuery = `
        SELECT * FROM reports 
        WHERE id = @id;
    `;

	try {
		const report = db.query(selectReportsQuery, { id: reportId });

		res.status(200).json({
			message: 'Reports retrieved successfully.',
			data: report,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'Failed to retrieve reports',
			error:
				error instanceof Error
					? error.message
					: 'An unknown error occurred',
		});
	}
});

// Delete specific report by id
app.delete('/deletereport/:id', (req: Request, res: Response) => {
	const reportId = req.params.id.toString();

	const deleteReportQuery = `
        DELETE FROM reports 
        WHERE id = @id;
    `;

	const reorderIdsQuery = `
            UPDATE reports
            SET id = (
                SELECT row_number FROM (
                    SELECT ROW_NUMBER() OVER (ORDER BY id) AS row_number, id
                    FROM reports
                ) AS subquery
                WHERE reports.id = subquery.id
            )
        `;

	try {
		db.run(deleteReportQuery, { id: reportId });
		db.run(reorderIdsQuery);
		res.status(200).json({
			message: `report with id:${reportId} deleted successfully and id is reordered.`,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'Failed to delete report',
			error:
				error instanceof Error
					? error.message
					: 'An unknown error occurred',
		});
	}
});

// Create new report
app.post('/createreport', (req: Request, res: Response) => {
	const { text, projectId } = req.body;

	const countQuery = `
        SELECT COUNT(*) AS total 
        FROM reports;
    `;

	try {
		const countResult = db.query(countQuery) as CountResult[];
		const totalCount = countResult[0]?.total;
		const newId = (totalCount + 1).toString();

		const insertProjectQuery = `
            INSERT INTO reports (id, text, projectId) 
            VALUES (@id, @text, @projectId);
        `;

		const result = db.run(insertProjectQuery, {
			id: newId,
			text,
			projectId,
		});

		res.status(201).json({
			message: 'Report created successfully.',
			result,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'Failed to create report',
			error:
				error instanceof Error
					? error.message
					: 'An unknown error occurred',
		});
	}
});

// Update report text by id
app.patch('/updatereport/:id', (req: Request, res: Response) => {
	const reportId = req.params.id.toString();
	const { text, projectId } = req.body;

	const updates = [];
	if (text) updates.push(`text = @text`);
	if (projectId) updates.push(`projectId = @projectId`);

	if (updates.length === 0) {
		return res.status(400).json({
			message: 'No valid fields provided to update.',
		});
	}
	const updateQuery = `
        UPDATE reports 
        SET ${updates.join(', ')} 
        WHERE id = @id;
    `;

	try {
		const result = db.run(updateQuery, {
			id: reportId,
			text,
			projectId,
		});

		if (result.changes === 0) {
			return res.status(404).json({
				message: `Report with id:${reportId} not found.`,
			});
		}

		res.status(200).json({
			message: `Report with id:${reportId} updated successfully.`,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: 'Failed to update report',
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
