import { useState, useEffect } from 'react';
import { getAllTeams, createTeam, updateTeam, deleteTeam } from '../../services/adminService';
import Modal from '../Modal';
import Loader from '../Loader';
import { getEventLabel, getEventColor } from '../../utils/helpers';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    eventType: 'poster-presentation',
    description: '',
    members: [{ name: '', email: '', role: '' }],
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const data = await getAllTeams();
      setTeams(data);
    } catch (error) {
      alert('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await updateTeam(editingTeam._id, formData);
        alert('Team updated successfully');
      } else {
        await createTeam(formData);
        alert('Team created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchTeams();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save team');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        await deleteTeam(id);
        alert('Team deleted successfully');
        fetchTeams();
      } catch (error) {
        alert('Failed to delete team');
      }
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      eventType: team.eventType,
      description: team.description || '',
      members: team.members.length > 0 ? team.members : [{ name: '', email: '', role: '' }],
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      eventType: 'poster-presentation',
      description: '',
      members: [{ name: '', email: '', role: '' }],
    });
    setEditingTeam(null);
  };

  const addMember = () => {
    setFormData({
      ...formData,
      members: [...formData.members, { name: '', email: '', role: '' }],
    });
  };

  const removeMember = (index) => {
    const newMembers = formData.members.filter((_, i) => i !== index);
    setFormData({ ...formData, members: newMembers });
  };

  const updateMember = (index, field, value) => {
    const newMembers = [...formData.members];
    newMembers[index][field] = value;
    setFormData({ ...formData, members: newMembers });
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Team Management</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary w-full sm:w-auto"
        >
          + Add Team
        </button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <div key={team._id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${getEventColor(team.eventType)}`}>
                  {getEventLabel(team.eventType)}
                </span>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Members:</span> {team.totalMembers}
              </p>
              {team.description && (
                <p className="text-sm text-gray-600">{team.description}</p>
              )}
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleEdit(team)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(team._id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No teams found. Add your first team to get started.</p>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingTeam ? 'Edit Team' : 'Add New Team'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="label">Team Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Enter team name"
            />
          </div>

          <div>
            <label className="label">Event Type</label>
            <select
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              className="input-field"
              required
            >
              <option value="poster-presentation">Poster Presentation</option>
              <option value="paper-presentation">Paper Presentation</option>
              <option value="startup-expo">Startup Expo</option>
            </select>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows="2"
              placeholder="Team description (optional)"
            />
          </div>

          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
              <label className="label mb-0">Team Members</label>
              <button
                type="button"
                onClick={addMember}
                className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap"
              >
                + Add Member
              </button>
            </div>
            
            <div className="space-y-2 sm:space-y-3 max-h-[40vh] sm:max-h-60 overflow-y-auto pr-1">
              {formData.members.map((member, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-2 sm:p-3 space-y-2 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Member {index + 1}</span>
                    {formData.members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={member.name}
                    onChange={(e) => updateMember(index, 'name', e.target.value)}
                    className="input-field"
                    placeholder="Name"
                  />
                  <input
                    type="email"
                    required
                    value={member.email}
                    onChange={(e) => updateMember(index, 'email', e.target.value)}
                    className="input-field"
                    placeholder="Email"
                  />
                  <input
                    type="text"
                    value={member.role}
                    onChange={(e) => updateMember(index, 'role', e.target.value)}
                    className="input-field"
                    placeholder="Role (optional)"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button type="submit" className="w-full sm:flex-1 btn-primary">
              {editingTeam ? 'Update Team' : 'Create Team'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
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

export default TeamManagement;
