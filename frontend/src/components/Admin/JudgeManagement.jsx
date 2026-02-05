import { useState, useEffect } from 'react';
import { getAllJudges, createJudge, updateJudge, deleteJudge } from '../../services/adminService';
import Modal from '../Modal';
import Loader from '../Loader';
import { getEventLabel, getEventColor } from '../../utils/helpers';

const JudgeManagement = () => {
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJudge, setEditingJudge] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    assignedEvent: 'poster-presentation',
  });

  useEffect(() => {
    fetchJudges();
  }, []);

  const fetchJudges = async () => {
    try {
      const data = await getAllJudges();
      setJudges(data);
    } catch (error) {
      alert('Failed to fetch judges');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJudge) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateJudge(editingJudge._id, updateData);
        alert('Judge updated successfully');
      } else {
        await createJudge(formData);
        alert('Judge created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchJudges();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save judge');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this judge?')) {
      try {
        await deleteJudge(id);
        alert('Judge deleted successfully');
        fetchJudges();
      } catch (error) {
        alert('Failed to delete judge');
      }
    }
  };

  const handleEdit = (judge) => {
    setEditingJudge(judge);
    setFormData({
      name: judge.name,
      email: judge.email,
      password: '',
      assignedEvent: judge.assignedEvent,
    });
    setShowModal(true);
  };

  const toggleJudgeStatus = async (judge) => {
    try {
      await updateJudge(judge._id, { isActive: !judge.isActive });
      fetchJudges();
    } catch (error) {
      alert('Failed to update judge status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      assignedEvent: 'poster-presentation',
    });
    setEditingJudge(null);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Judge Management</h2>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary w-full sm:w-auto"
        >
          + Add Judge
        </button>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {judges.map((judge) => (
          <div key={judge._id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{judge.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{judge.email}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded ${
                  judge.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {judge.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mt-3">
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getEventColor(judge.assignedEvent)}`}>
                {getEventLabel(judge.assignedEvent)}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => toggleJudgeStatus(judge)}
                className={`w-full text-white text-sm py-2 px-3 rounded transition ${
                  judge.isActive
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {judge.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <div className="flex gap-2">
              <button
                onClick={() => handleEdit(judge)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(judge._id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded transition"
              >
                Delete
              </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {judges.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No judges found. Add your first judge to get started.</p>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingJudge ? 'Edit Judge' : 'Add New Judge'}
      >
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Enter judge name"
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="label">
              Password {editingJudge && '(leave blank to keep current)'}
            </label>
            <input
              type="password"
              required={!editingJudge}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field"
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="label">Assigned Event</label>
            <select
              value={formData.assignedEvent}
              onChange={(e) => setFormData({ ...formData, assignedEvent: e.target.value })}
              className="input-field"
              required
            >
              <option value="poster-presentation">Poster Presentation</option>
              <option value="paper-presentation">Paper Presentation</option>
              <option value="startup-expo">Startup Expo</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button type="submit" className="w-full sm:flex-1 btn-primary">
              {editingJudge ? 'Update Judge' : 'Create Judge'}
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

export default JudgeManagement;
