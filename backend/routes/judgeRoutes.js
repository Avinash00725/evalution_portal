import express from 'express';
import {
  getAssignedTeams,
  getAllTeamsForJudge,
  createOrUpdateEvaluation,
  getEvaluationForTeam,
  getLeaderboardByEvent,
  getAllLeaderboards,
  getTeamAnalytics,
  selectTeamForRound2
} from '../controllers/judgeController.js';
import { protect, judgeOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(judgeOnly);

router.get('/teams/assigned', getAssignedTeams);
router.get('/teams/all', getAllTeamsForJudge);
router.post('/evaluations', createOrUpdateEvaluation);
router.get('/evaluations/team/:teamId', getEvaluationForTeam);
router.get('/leaderboard/:eventType', getLeaderboardByEvent);
router.get('/leaderboards/all', getAllLeaderboards);
router.get('/analytics/team/:teamId', getTeamAnalytics);
router.post('/teams/:teamId/select-round2', selectTeamForRound2);

export default router;
