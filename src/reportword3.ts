import db from './services/db.service';
import { Request, Response, Router } from 'express';

const router = Router();

function countWords(text: string): { [key: string]: number } {
	const words = text
		.toLowerCase()
		.replace(/[^a-z\s]/g, '')
		.split(/\s+/);

	const wordCounts: { [key: string]: number } = {};
	for (const word of words) {
		if (word.length > 0) {
			wordCounts[word] = (wordCounts[word] || 0) + 1;
		}
	}
	return wordCounts;
}

// Get reports where same words in text appear at least 3 times
router.get('/getreport', async (req: Request, res: Response) => {
	try {
		const reports = (await db.query(
			'SELECT id, text, projectId FROM reports',
		)) as { id: string; text: string; projectId: bigint }[];

		const filteredReports = reports.filter(
			(report: { id: string; text: string; projectId: bigint }) => {
				const wordCounts = countWords(report.text);
				return Object.values(wordCounts).some((count) => count >= 3);
			},
		);

		res.status(200).json({
			message: 'Reports retrieved successfully.',
			data: filteredReports,
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
