import { Router } from 'express';
import { listProviderDefinitions } from '../services/providerRegistry.js';
import { requireAppUser } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAppUser);

router.get('/providers', (_req, res) => {
	res.json({ data: listProviderDefinitions() });
});

export default router;
