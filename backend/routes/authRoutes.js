import express from 'express';
import { loginAdmin, loginJudge, createInitialAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/admin/login', loginAdmin);
router.post('/judge/login', loginJudge);
router.post('/setup/initial-admin', createInitialAdmin);

export default router;
