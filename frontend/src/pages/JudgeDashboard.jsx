import { useState } from 'react';
import TeamsView from '../components/Judge/TeamsView';
import MarkingSection from '../components/Judge/MarkingSection';
import JudgeLeaderboard from '../components/Judge/JudgeLeaderboard';

const JudgeDashboard = () => {
  const [activeTab, setActiveTab] = useState('marking');

  const tabs = [
    { id: 'teams', label: 'All Teams' },
    { id: 'marking', label: 'Marking' },
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
          {activeTab === 'teams' && <TeamsView />}
          {activeTab === 'marking' && <MarkingSection />}
          {activeTab === 'leaderboard' && <JudgeLeaderboard />}
        </div>
      </div>
    </div>
  );
};

export default JudgeDashboard;
