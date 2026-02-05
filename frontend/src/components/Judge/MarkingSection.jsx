import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getAssignedTeams,
  createOrUpdateEvaluation,
  getEvaluationForTeam,
  selectTeamForRound2,
} from '../../services/judgeService';
import Loader from '../Loader';
import Modal from '../Modal';
import { getEventLabel } from '../../utils/helpers';

const MarkingSection = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({
    round1: Array(5).fill(5),
    round2: Array(5).fill(5),
    remarks: '',
  });
  const [existingEvaluation, setExistingEvaluation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeRound, setActiveRound] = useState(1);
  const [round1Completed, setRound1Completed] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const data = await getAssignedTeams();
      setTeams(data);
    } catch (error) {
      alert('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const openMarkingModal = async (team) => {
    setSelectedTeam(team);
    setShowModal(true);
    setActiveRound(1);
    setRound1Completed(false);

    try {
      const evaluation = await getEvaluationForTeam(team._id);
      setExistingEvaluation(evaluation);

      const round1 = evaluation.rounds.find((r) => r.roundNumber === 1);
      const round2 = evaluation.rounds.find((r) => r.roundNumber === 2);

      setFormData({
        round1: round1 ? round1.questions.map((q) => q.score) : Array(5).fill(5),
        round2: round2 ? round2.questions.map((q) => q.score) : Array(5).fill(5),
        remarks: evaluation.remarks || '',
      });

      // Check if Round 1 is completed
      if (round1 && round1.questions.length === 5) {
        setRound1Completed(true);
      }
    } catch (error) {
      // No existing evaluation
      setExistingEvaluation(null);
      setFormData({
        round1: Array(5).fill(5),
        round2: Array(5).fill(5),
        remarks: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const rounds = [
        {
          roundNumber: 1,
          questions: formData.round1.map((score, idx) => ({
            questionNumber: idx + 1,
            score: parseInt(score),
          })),
        }
      ];

      // Only include Round 2 if team is selected for Round 2 and we're submitting Round 2
      if (activeRound === 2 && selectedTeam.selectedForRound2) {
        rounds.push({
          roundNumber: 2,
          questions: formData.round2.map((score, idx) => ({
            questionNumber: idx + 1,
            score: parseInt(score),
          })),
        });
      } else if (existingEvaluation) {
        // Keep existing Round 2 data if it exists
        const round2 = existingEvaluation.rounds.find((r) => r.roundNumber === 2);
        if (round2) {
          rounds.push(round2);
        }
      }

      const evaluationData = {
        teamId: selectedTeam._id,
        rounds,
        remarks: formData.remarks,
      };

      await createOrUpdateEvaluation(evaluationData);
      
      if (activeRound === 1) {
        setRound1Completed(true);
        alert('Round 1 evaluation submitted successfully. You can now select this team for Round 2.');
      } else {
        alert('Round 2 evaluation submitted successfully');
        setShowModal(false);
        setSelectedTeam(null);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectForRound2 = async () => {
    try {
      await selectTeamForRound2(selectedTeam._id);
      setActiveRound(2);
      // Update the team object
      setSelectedTeam({ ...selectedTeam, selectedForRound2: true });
      // Update teams list
      setTeams(teams.map(t => 
        t._id === selectedTeam._id ? { ...t, selectedForRound2: true } : t
      ));
      alert('Team selected for Round 2. You can now evaluate Round 2.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to select team for Round 2');
    }
  };

  const updateScore = (round, index, value) => {
    const score = Math.min(10, Math.max(1, parseInt(value) || 1));
    if (round === 1) {
      const newRound1 = [...formData.round1];
      newRound1[index] = score;
      setFormData({ ...formData, round1: newRound1 });
    } else {
      const newRound2 = [...formData.round2];
      newRound2[index] = score;
      setFormData({ ...formData, round2: newRound2 });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Marking Section</h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Assigned Event: <span className="font-medium">{getEventLabel(user.assignedEvent)}</span>
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div key={team._id} className="card hover:shadow-lg transition cursor-pointer" onClick={() => openMarkingModal(team)}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{team.name}</h3>
            <p className="text-sm text-gray-600 mb-3">Members: {team.totalMembers}</p>
            <button
              className="w-full btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                openMarkingModal(team);
              }}
            >
              Mark Team
            </button>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No teams assigned for {getEventLabel(user.assignedEvent)}.
          </p>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTeam(null);
          setActiveRound(1);
        }}
        title={`Evaluate: ${selectedTeam?.name || ''}`}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Team Info */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600">
              <span className="font-medium">Event:</span>{' '}
              {selectedTeam && getEventLabel(selectedTeam.eventType)}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              <span className="font-medium">Members:</span> {selectedTeam?.totalMembers}
            </p>
            {selectedTeam?.selectedForRound2 && (
              <p className="text-xs sm:text-sm text-green-600 mt-1 font-medium">
                ✓ Selected for Round 2
              </p>
            )}
          </div>

          {/* Round Tabs */}
          {round1Completed && (
            <div className="flex gap-2 border-b">
              <button
                type="button"
                onClick={() => setActiveRound(1)}
                className={`px-4 py-2 font-medium transition ${
                  activeRound === 1
                    ? 'border-b-2 border-primary-600 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Round 1
              </button>
              {selectedTeam?.selectedForRound2 && (
                <button
                  type="button"
                  onClick={() => setActiveRound(2)}
                  className={`px-4 py-2 font-medium transition ${
                    activeRound === 2
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Round 2
                </button>
              )}
            </div>
          )}

          {/* Round 1 */}
          {activeRound === 1 && (
            <div className="border rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Round 1
                <span className="text-xs sm:text-sm font-normal text-gray-600 ml-2">
                  (Total: {formData.round1.reduce((a, b) => a + b, 0)}/50)
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {formData.round1.map((score, idx) => (
                  <div key={idx}>
                    <label className="label">Question {idx + 1}</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={score}
                      onChange={(e) => updateScore(1, idx, e.target.value)}
                      className="input-field"
                    />
                    <p className="text-xs text-gray-500 mt-1">Score: 1-10</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Round 2 */}
          {activeRound === 2 && selectedTeam?.selectedForRound2 && (
            <div className="border rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Round 2
                <span className="text-xs sm:text-sm font-normal text-gray-600 ml-2">
                  (Total: {formData.round2.reduce((a, b) => a + b, 0)}/50)
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {formData.round2.map((score, idx) => (
                  <div key={idx}>
                    <label className="label">Question {idx + 1}</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={score}
                      onChange={(e) => updateScore(2, idx, e.target.value)}
                      className="input-field"
                    />
                    <p className="text-xs text-gray-500 mt-1">Score: 1-10</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="label">Remarks (Optional)</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="input-field"
              rows="3"
              placeholder="Enter your feedback and remarks..."
            />
          </div>

          {/* Total Score */}
          <div className="bg-primary-50 p-3 sm:p-4 rounded-lg">
            <p className="text-base sm:text-lg font-bold text-primary-700">
              {activeRound === 1 ? 'Round 1' : 'Round 2'} Score:{' '}
              {activeRound === 1
                ? formData.round1.reduce((a, b) => a + b, 0)
                : formData.round2.reduce((a, b) => a + b, 0)}
              /50
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button type="submit" disabled={submitting} className="w-full sm:flex-1 btn-primary">
              {submitting
                ? 'Submitting...'
                : activeRound === 1
                ? 'Submit Round 1'
                : 'Submit Round 2'}
            </button>
            
            {round1Completed && !selectedTeam?.selectedForRound2 && activeRound === 1 && (
              <button
                type="button"
                onClick={handleSelectForRound2}
                className="w-full sm:flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Select for Round 2
              </button>
            )}
            
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setSelectedTeam(null);
                setActiveRound(1);
              }}
              className="w-full sm:flex-1 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MarkingSection;
