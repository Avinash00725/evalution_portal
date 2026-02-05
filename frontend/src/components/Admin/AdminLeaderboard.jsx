import { useState, useEffect } from 'react';
import { getAllLeaderboards, getTeamAnalytics } from '../../services/adminService';
import Loader from '../Loader';
import Modal from '../Modal';
import { getEventLabel } from '../../utils/helpers';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminLeaderboard = () => {
  const [leaderboards, setLeaderboards] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('poster-presentation');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const eventTypes = [
    { value: 'poster-presentation', label: 'Poster Presentation' },
    { value: 'paper-presentation', label: 'Paper Presentation' },
    { value: 'startup-expo', label: 'Startup Expo' },
  ];

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      const data = await getAllLeaderboards();
      setLeaderboards(data);
    } catch (error) {
      alert('Failed to fetch leaderboards');
    } finally {
      setLoading(false);
    }
  };

  const viewAnalytics = async (teamId) => {
    setLoadingAnalytics(true);
    setShowAnalytics(true);
    try {
      const data = await getTeamAnalytics(teamId);
      setAnalytics(data);
    } catch (error) {
      alert('Failed to fetch analytics');
      setShowAnalytics(false);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const downloadPDF = () => {
    if (!analytics) return;

    const doc = new jsPDF();
    const { team, evaluations } = analytics;

    // Title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Team Evaluation Report', 105, 20, { align: 'center' });

    // Team Info
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Team Name: ${team.name}`, 14, 35);
    doc.text(`Event: ${getEventLabel(team.eventType)}`, 14, 42);
    doc.text(`Total Members: ${team.totalMembers}`, 14, 49);

    // Members
    doc.setFontSize(10);
    doc.text('Team Members:', 14, 59);
    team.members.forEach((member, idx) => {
      doc.text(`${idx + 1}. ${member.name} (${member.email})`, 20, 66 + idx * 7);
    });

    let yPos = 66 + team.members.length * 7 + 15;

    // Judge Evaluations Table
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Judge Evaluations', 14, yPos);
    yPos += 10;

    // Create table data
    const tableHeaders = [
      'Judge',
      'R1-Q1', 'R1-Q2', 'R1-Q3', 'R1-Q4', 'R1-Q5', 'R1 Total',
      'R2-Q1', 'R2-Q2', 'R2-Q3', 'R2-Q4', 'R2-Q5', 'R2 Total',
      'Total'
    ];

    const tableData = evaluations.map((evaluation) => {
      const round1 = evaluation.rounds.find(r => r.roundNumber === 1);
      const round2 = evaluation.rounds.find(r => r.roundNumber === 2);

      const row = [evaluation.judgeName];

      // Round 1 scores
      if (round1) {
        round1.questions.forEach(q => row.push(q.score.toString()));
        row.push(round1.totalScore.toString());
      } else {
        row.push('-', '-', '-', '-', '-', '-');
      }

      // Round 2 scores
      if (round2 && round2.questions.length > 0) {
        round2.questions.forEach(q => row.push(q.score.toString()));
        row.push(round2.totalScore.toString());
      } else {
        row.push('-', '-', '-', '-', '-', '-');
      }

      row.push(evaluation.totalScore.toString());
      return row;
    });

    // Calculate averages
    const averageRow = ['Average'];
    
    // Round 1 question averages
    for (let qNum = 1; qNum <= 5; qNum++) {
      const scores = evaluations
        .map(e => e.rounds.find(r => r.roundNumber === 1))
        .filter(r => r)
        .map(r => r.questions.find(q => q.questionNumber === qNum)?.score || 0);
      const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '-';
      averageRow.push(avg);
    }

    // Round 1 total average
    const round1Scores = evaluations
      .map(e => e.rounds.find(r => r.roundNumber === 1))
      .filter(r => r)
      .map(r => r.totalScore);
    averageRow.push(
      round1Scores.length > 0
        ? (round1Scores.reduce((a, b) => a + b, 0) / round1Scores.length).toFixed(2)
        : '-'
    );

    // Round 2 question averages
    for (let qNum = 1; qNum <= 5; qNum++) {
      const scores = evaluations
        .map(e => e.rounds.find(r => r.roundNumber === 2))
        .filter(r => r && r.questions.length > 0)
        .map(r => r.questions.find(q => q.questionNumber === qNum)?.score || 0);
      const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '-';
      averageRow.push(avg);
    }

    // Round 2 total average
    const round2Scores = evaluations
      .map(e => e.rounds.find(r => r.roundNumber === 2))
      .filter(r => r && r.questions.length > 0)
      .map(r => r.totalScore);
    averageRow.push(
      round2Scores.length > 0
        ? (round2Scores.reduce((a, b) => a + b, 0) / round2Scores.length).toFixed(2)
        : '-'
    );

    // Overall average
    const totalScores = evaluations.map(e => e.totalScore);
    averageRow.push(
      totalScores.length > 0
        ? (totalScores.reduce((a, b) => a + b, 0) / totalScores.length).toFixed(2)
        : '-'
    );

    tableData.push(averageRow);

    // Generate table using autoTable
    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
      startY: yPos,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 30 },
      },
      didParseCell: function(data) {
        // Highlight average row
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fillColor = [219, 234, 254];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Remarks section
    if (evaluations.some(e => e.remarks)) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Judge Remarks', 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      evaluations.forEach((evaluation) => {
        if (evaluation.remarks) {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFont(undefined, 'bold');
          doc.text(`${evaluation.judgeName}:`, 14, yPos);
          yPos += 7;
          doc.setFont(undefined, 'normal');
          const remarks = doc.splitTextToSize(evaluation.remarks, 180);
          doc.text(remarks, 20, yPos);
          yPos += remarks.length * 6 + 10;
        }
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    doc.save(`${team.name}_Evaluation_Report.pdf`);
  };

  if (loading) return <Loader />;

  const currentLeaderboard = leaderboards[selectedEvent] || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Leaderboard & Analytics</h2>

      {/* Event Selector */}
      <div className="flex flex-wrap gap-2">
        {eventTypes.map((event) => (
          <button
            key={event.value}
            onClick={() => setSelectedEvent(event.value)}
            className={`px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base ${
              selectedEvent === event.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {event.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="card overflow-x-auto">
        <h3 className="text-xl font-semibold mb-4">{getEventLabel(selectedEvent)}</h3>
        {currentLeaderboard.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rank
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Team Name
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Members
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Round 1
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Round 2
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentLeaderboard.map((team, index) => (
                <tr key={team.teamId} className={index < 3 ? 'bg-yellow-50' : ''}>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{team.teamName}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{team.totalMembers}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{team.round1Marks}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{team.round2Marks}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-primary-600">{team.totalMarks}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => viewAnalytics(team.teamId)}
                      className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                    >
                      View Analytics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No teams evaluated for this event yet.
          </p>
        )}
      </div>

      {/* Analytics Modal */}
      <Modal
        isOpen={showAnalytics}
        onClose={() => {
          setShowAnalytics(false);
          setAnalytics(null);
        }}
        title="Team Analytics"
        size="xl"
      >
        {loadingAnalytics ? (
          <Loader message="Loading analytics..." />
        ) : analytics ? (
          <div className="space-y-6">
            {/* Team Info */}
            <div className="border-b pb-4">
              <h3 className="text-xl font-bold text-gray-900">{analytics.team.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {getEventLabel(analytics.team.eventType)} • {analytics.team.totalMembers} members
              </p>
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Team Members:</p>
                <div className="space-y-1">
                  {analytics.team.members.map((member, idx) => (
                    <p key={idx} className="text-sm text-gray-600">
                      {idx + 1}. {member.name} ({member.email})
                      {member.role && ` - ${member.role}`}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Evaluations */}
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900">Judge Evaluations</h4>
              
              {/* Judge Evaluations Table */}
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Judge Name
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase" colSpan="5">
                        Round 1 (Q1-Q5)
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        R1 Total
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase" colSpan="5">
                        Round 2 (Q1-Q5)
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        R2 Total
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analytics.evaluations.map((evaluation, idx) => {
                      const round1 = evaluation.rounds.find(r => r.roundNumber === 1);
                      const round2 = evaluation.rounds.find(r => r.roundNumber === 2);
                      
                      return (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {evaluation.judgeName}
                          </td>
                          {/* Round 1 Questions */}
                          {round1 ? (
                            <>
                              {round1.questions.map((q) => (
                                <td key={`r1-q${q.questionNumber}`} className="px-2 py-3 text-center text-sm text-gray-700">
                                  {q.score}
                                </td>
                              ))}
                              <td className="px-4 py-3 text-center text-sm font-semibold text-primary-600">
                                {round1.totalScore}
                              </td>
                            </>
                          ) : (
                            <>
                              <td colSpan="5" className="px-2 py-3 text-center text-sm text-gray-400">-</td>
                              <td className="px-4 py-3 text-center text-sm text-gray-400">-</td>
                            </>
                          )}
                          {/* Round 2 Questions */}
                          {round2 && round2.questions.length > 0 ? (
                            <>
                              {round2.questions.map((q) => (
                                <td key={`r2-q${q.questionNumber}`} className="px-2 py-3 text-center text-sm text-gray-700">
                                  {q.score}
                                </td>
                              ))}
                              <td className="px-4 py-3 text-center text-sm font-semibold text-primary-600">
                                {round2.totalScore}
                              </td>
                            </>
                          ) : (
                            <>
                              <td colSpan="5" className="px-2 py-3 text-center text-sm text-gray-400">-</td>
                              <td className="px-4 py-3 text-center text-sm text-gray-400">-</td>
                            </>
                          )}
                          <td className="px-4 py-3 text-center text-sm font-bold text-primary-700">
                            {evaluation.totalScore}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Average Row */}
                    <tr className="bg-primary-50 font-semibold">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        Average
                      </td>
                      {/* Round 1 Average */}
                      {[1, 2, 3, 4, 5].map((qNum) => {
                        const scores = analytics.evaluations
                          .map(e => e.rounds.find(r => r.roundNumber === 1))
                          .filter(r => r)
                          .map(r => r.questions.find(q => q.questionNumber === qNum)?.score || 0);
                        const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '-';
                        return (
                          <td key={`avg-r1-q${qNum}`} className="px-2 py-3 text-center text-sm text-primary-700">
                            {avg}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center text-sm text-primary-700">
                        {(() => {
                          const round1Scores = analytics.evaluations
                            .map(e => e.rounds.find(r => r.roundNumber === 1))
                            .filter(r => r)
                            .map(r => r.totalScore);
                          return round1Scores.length > 0
                            ? (round1Scores.reduce((a, b) => a + b, 0) / round1Scores.length).toFixed(2)
                            : '-';
                        })()}
                      </td>
                      {/* Round 2 Average */}
                      {[1, 2, 3, 4, 5].map((qNum) => {
                        const scores = analytics.evaluations
                          .map(e => e.rounds.find(r => r.roundNumber === 2))
                          .filter(r => r && r.questions.length > 0)
                          .map(r => r.questions.find(q => q.questionNumber === qNum)?.score || 0);
                        const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '-';
                        return (
                          <td key={`avg-r2-q${qNum}`} className="px-2 py-3 text-center text-sm text-primary-700">
                            {avg}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center text-sm text-primary-700">
                        {(() => {
                          const round2Scores = analytics.evaluations
                            .map(e => e.rounds.find(r => r.roundNumber === 2))
                            .filter(r => r && r.questions.length > 0)
                            .map(r => r.totalScore);
                          return round2Scores.length > 0
                            ? (round2Scores.reduce((a, b) => a + b, 0) / round2Scores.length).toFixed(2)
                            : '-';
                        })()}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-primary-800">
                        {(() => {
                          const totalScores = analytics.evaluations.map(e => e.totalScore);
                          return totalScores.length > 0
                            ? (totalScores.reduce((a, b) => a + b, 0) / totalScores.length).toFixed(2)
                            : '-';
                        })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Remarks Section */}
              <div className="space-y-3">
                <h5 className="font-semibold text-gray-900">Judge Remarks</h5>
                {analytics.evaluations.map((evaluation, idx) => (
                  evaluation.remarks && (
                    <div key={idx} className="border-l-4 border-primary-500 pl-4 py-2 bg-gray-50">
                      <p className="text-sm font-medium text-gray-700">{evaluation.judgeName}:</p>
                      <p className="text-sm text-gray-600 mt-1">{evaluation.remarks}</p>
                    </div>
                  )
                ))}
                {!analytics.evaluations.some(e => e.remarks) && (
                  <p className="text-sm text-gray-500 italic">No remarks provided</p>
                )}
              </div>
            </div>

            <button onClick={downloadPDF} className="w-full btn-primary">
              Download PDF Report
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AdminLeaderboard;
