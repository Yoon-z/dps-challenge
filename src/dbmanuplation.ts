import db from './services/db.service';
import express, { Express, Request, Response, Router } from 'express';

const router = Router();
const app: Express = express();

app.use(express.json());

// Get all projects
router.get('/allprojects', async (req: Request, res: Response) => {
	const selectProjectsQuery = `
        SELECT * FROM projects;
    `;

	try {
		const projects = await db.query(selectProjectsQuery);

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
router.get('/getproject/:id', async (req: Request, res: Response) => {
	const projectId = req.params.id.toString();

	const selectProjectsQuery = `
        SELECT * FROM projects 
        WHERE id = @id;
    `;

	try {
		const project = await db.query(selectProjectsQuery, { id: projectId });

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
router.delete('/deleteproject/:id', async (req: Request, res: Response) => {
	const projectId = req.params.id.toString();

	const deleteProjectQuery = `
        DELETE FROM projects 
        WHERE id = @id;
    `;

	try {
		await db.run(deleteProjectQuery, { id: projectId });

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

		await db.run(reorderIdsQuery);

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

interface CountResult {
	total: number;
}

// Create new project
router.post('/createproject', async (req: Request, res: Response) => {
	const { name, description } = req.body;

	const countQuery = `
        SELECT COUNT(*) AS total 
        FROM projects;
    `;

	try {
		const countResult = (await db.query(countQuery)) as CountResult[];
		const totalCount = countResult[0]?.total;
		const newId = (totalCount + 1).toString();

		if (!newId) {
			throw new Error('Id cannot be null or undefined');
		}

		const insertProjectQuery = `
            INSERT INTO projects (id, name, description) 
            VALUES (@id, @name, @description);
        `;

		const result = await db.run(insertProjectQuery, {
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
router.patch('/updateproject/:id', async (req: Request, res: Response) => {
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
		const result = await db.run(updateQuery, {
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
router.get('/allreports', async (req: Request, res: Response) => {
	const selectReportsQuery = `
        SELECT * FROM reports;
    `;

	try {
		const reports = await db.query(selectReportsQuery);

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
router.get('/getreport/:id', async (req: Request, res: Response) => {
	const reportId = req.params.id.toString();

	const selectReportsQuery = `
        SELECT * FROM reports 
        WHERE id = @id;
    `;

	try {
		const report = await db.query(selectReportsQuery, { id: reportId });

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
router.delete('/deletereport/:id', async (req: Request, res: Response) => {
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
		await db.run(deleteReportQuery, { id: reportId });
		await db.run(reorderIdsQuery);
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
router.post('/createreport', async (req: Request, res: Response) => {
	const { text, projectId } = req.body;

	const countQuery = `
        SELECT COUNT(*) AS total 
        FROM reports;
    `;

	const insertProjectQuery = `
	INSERT INTO reports (id, text, projectId) 
	VALUES (@id, @text, @projectId);
    `;

	const selectProjectsQuery = `
	SELECT * FROM projects
	WHERE id = @id;
	`;

	try {
		const selectResult = await db.query(selectProjectsQuery, {
			id: projectId,
		});
		if (selectResult.length === 0) {
			return res.status(400).json({
				message: "Project doesn't exists",
			});
		}
		const countResult = (await db.query(countQuery)) as CountResult[];
		const totalCount = countResult[0]?.total;
		const newId = (totalCount + 1).toString();

		if (!newId || !projectId) {
			throw new Error('Id and project id cannot be null or undefined');
		}

		const result = await db.run(insertProjectQuery, {
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
router.patch('/updatereport/:id', async (req: Request, res: Response) => {
	const reportId = req.params.id.toString();
	const { text } = req.body;

	const updates = [];
	if (text) updates.push(`text = @text`);

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
		const result = await db.run(updateQuery, {
			id: reportId,
			text,
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

// Get report by project id
router.get('/getreportbyp/:id', async (req: Request, res: Response) => {
	const projectId = req.params.id.toString();

	const selectReportsQuery = `
        SELECT * FROM reports 
        WHERE projectId = @projectId;
    `;

	try {
		const report = await db.query(selectReportsQuery, {
			projectId: projectId,
		});

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

export default router;
