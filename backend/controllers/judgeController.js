import Evaluation from '../models/Evaluation.js';
import Team from '../models/Team.js';

export const getAssignedTeams = async (req, res) => {
  try {
    const judge = req.user;
    const teams = await Team.find({ eventType: judge.assignedEvent });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTeamsForJudge = async (req, res) => {
  try {
    const teams = await Team.find({}).sort({ eventType: 1, name: 1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createOrUpdateEvaluation = async (req, res) => {
  try {
    const { teamId, rounds, remarks } = req.body;
    const judgeId = req.user._id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.eventType !== req.user.assignedEvent) {
      return res.status(403).json({ message: 'You can only evaluate teams from your assigned event' });
    }

    let evaluation = await Evaluation.findOne({ team: teamId, judge: judgeId });

    if (evaluation) {
      evaluation.rounds = rounds;
      evaluation.remarks = remarks;
      evaluation.evaluatedAt = Date.now();
    } else {
      evaluation = new Evaluation({
        team: teamId,
        judge: judgeId,
        eventType: team.eventType,
        rounds,
        remarks
      });
    }

    await evaluation.save();

    const populatedEvaluation = await Evaluation.findById(evaluation._id)
      .populate('team', 'name members totalMembers eventType')
      .populate('judge', 'name email');

    res.json(populatedEvaluation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEvaluationForTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const judgeId = req.user._id;

    const evaluation = await Evaluation.findOne({ team: teamId, judge: judgeId })
      .populate('team', 'name members totalMembers eventType')
      .populate('judge', 'name email');

    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaderboardByEvent = async (req, res) => {
  try {
    const { eventType } = req.params;

    const teams = await Team.find({ eventType });
    
    const leaderboard = await Promise.all(
      teams.map(async (team) => {
        const evaluations = await Evaluation.find({ team: team._id })
          .populate('judge', 'name');

        // Calculate average for Round 1
        const round1Evaluations = evaluations.filter(e => 
          e.rounds.find(r => r.roundNumber === 1)
        );
        const round1Total = round1Evaluations.reduce((sum, evaluation) => {
          const round1 = evaluation.rounds.find(r => r.roundNumber === 1);
          return sum + (round1 ? round1.totalScore : 0);
        }, 0);
        const round1Average = round1Evaluations.length > 0 
          ? round1Total / round1Evaluations.length 
          : 0;

        // Calculate average for Round 2
        const round2Evaluations = evaluations.filter(e => 
          e.rounds.find(r => r.roundNumber === 2 && r.questions.length > 0)
        );
        const round2Total = round2Evaluations.reduce((sum, evaluation) => {
          const round2 = evaluation.rounds.find(r => r.roundNumber === 2);
          return sum + (round2 ? round2.totalScore : 0);
        }, 0);
        const round2Average = round2Evaluations.length > 0 
          ? round2Total / round2Evaluations.length 
          : 0;

        return {
          teamId: team._id,
          teamName: team.name,
          totalMembers: team.totalMembers,
          selectedForRound2: team.selectedForRound2,
          round1Marks: parseFloat(round1Average.toFixed(2)),
          round2Marks: parseFloat(round2Average.toFixed(2)),
          totalMarks: parseFloat((round1Average + round2Average).toFixed(2)),
          judgeCount: evaluations.length
        };
      })
    );

    leaderboard.sort((a, b) => b.totalMarks - a.totalMarks);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllLeaderboards = async (req, res) => {
  try {
    const eventTypes = ['poster-presentation', 'paper-presentation', 'startup-expo'];
    
    const leaderboards = {};

    for (const eventType of eventTypes) {
      const teams = await Team.find({ eventType });
      
      const leaderboard = await Promise.all(
        teams.map(async (team) => {
          const evaluations = await Evaluation.find({ team: team._id })
            .populate('judge', 'name');

          // Calculate average for Round 1
          const round1Evaluations = evaluations.filter(e => 
            e.rounds.find(r => r.roundNumber === 1)
          );
          const round1Total = round1Evaluations.reduce((sum, evaluation) => {
            const round1 = evaluation.rounds.find(r => r.roundNumber === 1);
            return sum + (round1 ? round1.totalScore : 0);
          }, 0);
          const round1Average = round1Evaluations.length > 0 
            ? round1Total / round1Evaluations.length 
            : 0;

          // Calculate average for Round 2
          const round2Evaluations = evaluations.filter(e => 
            e.rounds.find(r => r.roundNumber === 2 && r.questions.length > 0)
          );
          const round2Total = round2Evaluations.reduce((sum, evaluation) => {
            const round2 = evaluation.rounds.find(r => r.roundNumber === 2);
            return sum + (round2 ? round2.totalScore : 0);
          }, 0);
          const round2Average = round2Evaluations.length > 0 
            ? round2Total / round2Evaluations.length 
            : 0;

          return {
            teamId: team._id,
            teamName: team.name,
            totalMembers: team.totalMembers,
            selectedForRound2: team.selectedForRound2,
            round1Marks: parseFloat(round1Average.toFixed(2)),
            round2Marks: parseFloat(round2Average.toFixed(2)),
            totalMarks: parseFloat((round1Average + round2Average).toFixed(2)),
            judgeCount: evaluations.length
          };
        })
      );

      leaderboard.sort((a, b) => b.totalMarks - a.totalMarks);
      leaderboards[eventType] = leaderboard;
    }

    res.json(leaderboards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeamAnalytics = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const evaluations = await Evaluation.find({ team: teamId })
      .populate('judge', 'name email assignedEvent');

    const analytics = evaluations.map(evaluation => {
      return {
        judgeName: evaluation.judge.name,
        judgeEmail: evaluation.judge.email,
        rounds: evaluation.rounds,
        remarks: evaluation.remarks,
        totalScore: evaluation.totalScore,
        evaluatedAt: evaluation.evaluatedAt
      };
    });

    res.json({
      team: {
        name: team.name,
        eventType: team.eventType,
        members: team.members,
        totalMembers: team.totalMembers,
        selectedForRound2: team.selectedForRound2
      },
      evaluations: analytics
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const selectTeamForRound2 = async (req, res) => {
  try {
    const { teamId } = req.params;
    const judgeId = req.user._id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.eventType !== req.user.assignedEvent) {
      return res.status(403).json({ message: 'You can only select teams from your assigned event' });
    }

    // Check if judge has evaluated Round 1 for this team
    const evaluation = await Evaluation.findOne({ team: teamId, judge: judgeId });
    if (!evaluation) {
      return res.status(400).json({ message: 'Please complete Round 1 evaluation first' });
    }

    const round1 = evaluation.rounds.find(r => r.roundNumber === 1);
    if (!round1 || round1.questions.length === 0) {
      return res.status(400).json({ message: 'Round 1 evaluation is incomplete' });
    }

    team.selectedForRound2 = true;
    await team.save();

    res.json({ message: 'Team selected for Round 2', team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

