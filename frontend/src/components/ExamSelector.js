import React from 'react';
import './ExamSelector.css';

const EXAMS = [
  { label: 'Selection Post Phase 13', value: 'phase13', correct: 2, wrong: -0.5 },
  { label: 'CGL', value: 'cgl', correct: 2, wrong: -0.25 },
  { label: 'NTPC +2', value: 'ntpc', correct: 3, wrong: -1 },
  { label: 'CHSL Tier 1', value: 'chsl', correct: 2, wrong: -0.5 },
  { label: 'Others', value: 'others' }
];

function ExamSelector({ selectedExam, setSelectedExam, customMarks, setCustomMarks }) {
  const handleExamChange = (e) => {
    setSelectedExam(e.target.value);
  };

  const handleCustomChange = (e) => {
    setCustomMarks({ ...customMarks, [e.target.name]: e.target.value });
  };

  return (
    <div className="exam-selector-root">
      <label className="exam-selector-label">Exam:</label>
      <select
        className="exam-selector-dropdown"
        value={selectedExam}
        onChange={handleExamChange}
      >
        {EXAMS.map(exam => (
          <option key={exam.value} value={exam.value}>{exam.label}</option>
        ))}
      </select>
      {selectedExam === 'others' && (
        <div className="exam-selector-custom">
          <input
            className="exam-selector-input"
            type="number"
            step="any"
            name="correct"
            placeholder="Correct marks"
            value={customMarks.correct}
            onChange={handleCustomChange}
          />
          <input
            className="exam-selector-input"
            type="number"
            step="any"
            name="wrong"
            placeholder="Wrong marks"
            value={customMarks.wrong}
            onChange={handleCustomChange}
          />
        </div>
      )}
    </div>
  );
}

export default ExamSelector; 