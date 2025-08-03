import React from 'react';
import './CandidateProfile.css';

function CandidateProfile({ candidateInfoHtml, candidateBasicInfo, candidatePhotos }) {
  return (
    <div className="candidate-profile-container">
      <h2 className="candidate-profile-title">👤 CANDIDATE PROFILE</h2>
      <div className="candidate-profile-content">
        <div className="candidate-profile-photos">
          <h3 className="candidate-profile-section-title">📸 PHOTOGRAPHS</h3>
          <div dangerouslySetInnerHTML={{ __html: candidatePhotos }} />
        </div>
        <div className="candidate-profile-basic">
          <h3 className="candidate-profile-section-title">📋 BASIC INFORMATION</h3>
          <div dangerouslySetInnerHTML={{ __html: candidateBasicInfo }} />
          <div className="candidate-profile-note">
            <h4 className="candidate-profile-note-title">Note</h4>
            <div className="candidate-profile-note-content">
              <p><strong>Correct Answer</strong> will carry <span className="candidate-profile-green">1 mark</span> per Question.</p>
              <p><strong>Incorrect Answer</strong> will carry <span className="candidate-profile-red">1/3 Negative mark</span> per Question.</p>
              <div className="candidate-profile-note-list">
                <ul>
                  <li>Options shown in <span className="candidate-profile-green">green color</span> with a tick icon are correct.</li>
                  <li>Chosen option on the right of the question indicates the option selected by the candidate.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateProfile; 