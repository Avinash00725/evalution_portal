import Team from '../models/Team.js';
import Judge from '../models/Judge.js';
import Evaluation from '../models/Evaluation.js';

export const createTeam = async (req, res) => {
  try {
    const { name, eventType, members, description } = req.body;

    const teamExists = await Team.findOne({ name });
    if (teamExists) {
      return res.status(400).json({ message: 'Team name already exists' });
    }

    const team = await Team.create({
      name,
      eventType,
      members,
      description
    });

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find({}).sort({ createdAt: -1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const { name, eventType, members, description } = req.body;

    team.name = name || team.name;
    team.eventType = eventType || team.eventType;
    team.members = members || team.members;
    team.description = description || team.description;

    const updatedTeam = await team.save();
    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    await Evaluation.deleteMany({ team: team._id });
    await team.deleteOne();
    
    res.json({ message: 'Team and associated evaluations removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createJudge = async (req, res) => {
  try {
    const { name, email, password, assignedEvent } = req.body;

    const judgeExists = await Judge.findOne({ email });
    if (judgeExists) {
      return res.status(400).json({ message: 'Judge email already exists' });
    }

    const judge = await Judge.create({
      name,
      email,
      password,
      assignedEvent
    });

    res.status(201).json({
      _id: judge._id,
      name: judge.name,
      email: judge.email,
      assignedEvent: judge.assignedEvent,
      isActive: judge.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllJudges = async (req, res) => {
  try {
    const judges = await Judge.find({}).select('-password').sort({ createdAt: -1 });
    res.json(judges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJudge = async (req, res) => {
  try {
    const judge = await Judge.findById(req.params.id);

    if (!judge) {
      return res.status(404).json({ message: 'Judge not found' });
    }

    const { name, email, assignedEvent, isActive } = req.body;

    judge.name = name || judge.name;
    judge.email = email || judge.email;
    judge.assignedEvent = assignedEvent || judge.assignedEvent;
    judge.isActive = isActive !== undefined ? isActive : judge.isActive;

    const updatedJudge = await judge.save();
    
    res.json({
      _id: updatedJudge._id,
      name: updatedJudge.name,
      email: updatedJudge.email,
      assignedEvent: updatedJudge.assignedEvent,
      isActive: updatedJudge.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJudge = async (req, res) => {
  try {
    const judge = await Judge.findById(req.params.id);

    if (!judge) {
      return res.status(404).json({ message: 'Judge not found' });
    }

    await judge.deleteOne();
    res.json({ message: 'Judge removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { eventType } = req.params;

    const teams = await Team.find({ eventType });
    
    const leaderboard = await Promise.all(
      teams.map(async (team) => {
        const evaluations = await Evaluation.find({ team: team._id })
          .populate('judge', 'name');

        const round1Total = evaluations.reduce((sum, evaluation) => {
          const round1 = evaluation.rounds.find(r => r.roundNumber === 1);
          return sum + (round1 ? round1.totalScore : 0);
        }, 0);

        const round2Total = evaluations.reduce((sum, evaluation) => {
          const round2 = evaluation.rounds.find(r => r.roundNumber === 2);
          return sum + (round2 ? round2.totalScore : 0);
        }, 0);

        return {
          teamId: team._id,
          teamName: team.name,
          totalMembers: team.totalMembers,
          round1Marks: round1Total,
          round2Marks: round2Total,
          totalMarks: round1Total + round2Total,
          evaluations: evaluations
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
