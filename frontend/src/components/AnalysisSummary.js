import React from 'react';
import './AnalysisSummary.css';

function AnalysisSummary({ stats }) {
  return (
    <div className="analysis-summary-container">
      <h2 className="analysis-summary-title">📊 ANALYSIS SUMMARY</h2>
      <div className="analysis-summary-grid">
        <div className="analysis-summary-item">
          <span className="analysis-summary-label">Total Questions</span>
          <span className="analysis-summary-value analysis-summary-total">{stats.total}</span>
        </div>
        <div className="analysis-summary-item analysis-summary-correct">
          <span className="analysis-summary-label">✅ Correct</span>
          <span className="analysis-summary-value">{stats.match}</span>
        </div>
        <div className="analysis-summary-item analysis-summary-wrong">
          <span className="analysis-summary-label">❌ Wrong</span>
          <span className="analysis-summary-value">{stats.wrong}</span>
        </div>
        <div className="analysis-summary-item analysis-summary-unattempted">
          <span className="analysis-summary-label">⏸️ Unattempted</span>
          <span className="analysis-summary-value">{stats.nil}</span>
        </div>
      </div>
      <div className="analysis-summary-scorecard">
        <span className="analysis-summary-score-label">Final Score</span>
        <span className="analysis-summary-score-value">{stats.marks}</span>
      </div>
    </div>
  );
}

export default AnalysisSummary; 