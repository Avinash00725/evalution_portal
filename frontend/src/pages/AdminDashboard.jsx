import { useState } from 'react';
import TeamManagement from '../components/Admin/TeamManagement';
import JudgeManagement from '../components/Admin/JudgeManagement';
import AdminLeaderboard from '../components/Admin/AdminLeaderboard';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('teams');

  const tabs = [
    { id: 'teams', label: 'Teams' },
    { id: 'judges', label: 'Judges' },
    { id: 'leaderboard', label: 'Leaderboard' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-max px-6 py-4 text-sm sm:text-base font-medium transition ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'teams' && <TeamManagement />}
          {activeTab === 'judges' && <JudgeManagement />}
          {activeTab === 'leaderboard' && <AdminLeaderboard />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
