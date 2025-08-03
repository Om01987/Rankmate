import React from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './QuestionList.css';

function QuestionList({ sectionedDetails, detailsHtml, openSections, toggleSection, stats }) {
  return (
    <div className="question-list-root">
      {/* Sectioned Wrong/Unattempted Questions */}
      {sectionedDetails && (
        <>
          {/* Wrong by section */}
          {sectionedDetails.wrong.some(sec => sec.questions.length > 0) && (
            <>
              <div className={`question-list-toggle wrong`} onClick={() => toggleSection('wrong')}>
                ❌ WRONG ANSWERS BY SECTION
                {openSections.wrong ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {openSections.wrong && (
                <>
                  {sectionedDetails.wrong.map((sec, idx) => (
                    sec.questions.length > 0 && (
                      <div key={idx} className="question-list-section wrong">
                        <div className="question-list-section-title wrong">{sec.section}</div>
                        <div>{sec.questions.map((q, i) => <div key={i} dangerouslySetInnerHTML={{ __html: q }} />)}</div>
                      </div>
                    )
                  ))}
                </>
              )}
            </>
          )}
          {/* Unattempted by section */}
          {sectionedDetails.unattempted.some(sec => sec.questions.length > 0) && (
            <>
              <div className={`question-list-toggle unattempted`} onClick={() => toggleSection('unattempted')}>
                ⏸️ UNATTEMPTED QUESTIONS BY SECTION
                {openSections.unattempted ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {openSections.unattempted && (
                <>
                  {sectionedDetails.unattempted.map((sec, idx) => (
                    sec.questions.length > 0 && (
                      <div key={idx} className="question-list-section unattempted">
                        <div className="question-list-section-title unattempted">{sec.section}</div>
                        <div>{sec.questions.map((q, i) => <div key={i} dangerouslySetInnerHTML={{ __html: q }} />)}</div>
                      </div>
                    )
                  ))}
                </>
              )}
            </>
          )}
        </>
      )}
      {/* Flat Wrong/Unattempted Questions */}
      {detailsHtml && (
        <>
          {detailsHtml.wrongQuestions && detailsHtml.wrongQuestions.length > 0 && (
            <>
              <div className={`question-list-toggle wrong`} onClick={() => toggleSection('wrong')}>
                ❌ WRONG ANSWERS ({stats?.wrong})
                {openSections.wrong ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {openSections.wrong && (
                <div className="question-list-flat wrong">
                  <div dangerouslySetInnerHTML={{ __html: detailsHtml.wrongQuestions }} />
                </div>
              )}
            </>
          )}
          {detailsHtml.unattemptedQuestions && detailsHtml.unattemptedQuestions.length > 0 && (
            <>
              <div className={`question-list-toggle unattempted`} onClick={() => toggleSection('unattempted')}>
                ⏸️ UNATTEMPTED QUESTIONS ({stats?.nil})
                {openSections.unattempted ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              {openSections.unattempted && (
                <div className="question-list-flat unattempted">
                  <div dangerouslySetInnerHTML={{ __html: detailsHtml.unattemptedQuestions }} />
                </div>
              )}
            </>
          )}
          {(!detailsHtml.wrongQuestions || detailsHtml.wrongQuestions.length === 0) && 
           (!detailsHtml.unattemptedQuestions || detailsHtml.unattemptedQuestions.length === 0) && (
            <div className="question-list-perfect">
              <p>
                🎉 <strong>PERFECT SCORE!</strong> All questions were answered correctly! 🎉
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default QuestionList; 