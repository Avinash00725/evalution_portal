import express from 'express';
import {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  createJudge,
  getAllJudges,
  updateJudge,
  deleteJudge,
  getLeaderboard,
  getAllLeaderboards,
  getTeamAnalytics
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.route('/teams')
  .get(getAllTeams)
  .post(createTeam);

router.route('/teams/:id')
  .get(getTeamById)
  .put(updateTeam)
  .delete(deleteTeam);

router.route('/judges')
  .get(getAllJudges)
  .post(createJudge);

router.route('/judges/:id')
  .put(updateJudge)
  .delete(deleteJudge);

router.get('/leaderboard/:eventType', getLeaderboard);
router.get('/leaderboards/all', getAllLeaderboards);
router.get('/analytics/team/:teamId', getTeamAnalytics);

export default router;
