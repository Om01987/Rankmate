import React from 'react';
import './SectionAnalysisTable.css';

function getMarkingScheme(selectedExam, customMarks) {
  if (selectedExam === 'phase13') return { correct: 2, wrong: -0.5 };
  if (selectedExam === 'cgl') return { correct: 2, wrong: -0.25 };
  if (selectedExam === 'ntpc') return { correct: 3, wrong: -1 };
  if (selectedExam === 'chsl') return { correct: 2, wrong: -0.5 };
  if (selectedExam === 'others') {
    return {
      correct: parseFloat(customMarks.correct) || 0,
      wrong: parseFloat(customMarks.wrong) || 0
    };
  }
  return { correct: 1, wrong: -1/3 };
}

function SectionAnalysisTable({ questionDetails, selectedExam, customMarks }) {
  const marking = getMarkingScheme(selectedExam, customMarks);
  const sectionMap = {};
  let totalCorrect = 0, totalWrong = 0, totalUnattempted = 0, totalScore = 0;

  // Group questions by section
  questionDetails.forEach(q => {
    const section = q.section || 'Section';
    if (!sectionMap[section]) {
      sectionMap[section] = [];
    }
    sectionMap[section].push(q);
  });

  const rows = Object.entries(sectionMap).map(([section, questions]) => {
    let correct = 0, wrong = 0, unattempted = 0;
    questions.forEach(q => {
      if (q.chosen === '--') unattempted++;
      else if (q.chosen === q.correct) correct++;
      else wrong++;
    });
    const score = (correct * marking.correct) + (wrong * marking.wrong);
    const total = correct + wrong + unattempted;
    const percentage = total > 0 ? ((score / (total * marking.correct)) * 100).toFixed(1) : '0.0';
    totalCorrect += correct;
    totalWrong += wrong;
    totalUnattempted += unattempted;
    totalScore += score;
    return {
      section,
      total,
      correct,
      wrong,
      unattempted,
      score,
      percentage
    };
  });

  const totalQuestions = totalCorrect + totalWrong + totalUnattempted;
  const totalPercentage = totalQuestions > 0 ? ((totalScore / (totalQuestions * marking.correct)) * 100).toFixed(1) : '0.0';

  return (
    <div className="section-analysis-table-outer">
      <h2 className="section-analysis-table-title">📊 SECTION-WISE ANALYSIS</h2>
      <table className="section-analysis-table-main">
        <thead>
          <tr>
            <th>Section</th>
            <th>Total Questions</th>
            <th>Correct</th>
            <th>Wrong</th>
            <th>Unattempted</th>
            <th>Score</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>{row.section}</td>
              <td>{row.total}</td>
              <td>{row.correct}</td>
              <td>{row.wrong}</td>
              <td>{row.unattempted}</td>
              <td>{row.score.toFixed(1)}</td>
              <td>{row.percentage}%</td>
            </tr>
          ))}
          <tr className="section-analysis-table-total-row">
            <td>TOTAL</td>
            <td>{totalQuestions}</td>
            <td>{totalCorrect}</td>
            <td>{totalWrong}</td>
            <td>{totalUnattempted}</td>
            <td>{totalScore.toFixed(1)}</td>
            <td>{totalPercentage}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default SectionAnalysisTable; 