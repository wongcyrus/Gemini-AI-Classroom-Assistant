import React from 'react';
import './StudentScreen.css'; // Import styles from StudentScreen.css

const StudentScreen = ({ student, isSharing, screenshotUrl, onClick }) => {
  return (
    <div className={`student-screen ${isSharing ? 'sharing' : 'not-sharing'}`} onClick={onClick}>
      <div className="student-header">
        <h2>{student.name || student.email}</h2>
        <span className={`status-indicator ${isSharing ? 'on' : 'off'}`}></span>
      </div>
      {screenshotUrl ? (
        <div className="screenshot-image" style={{ backgroundImage: `url(${screenshotUrl})` }} role="img" aria-label={`Screenshot from ${student.email}`}></div>
      ) : (
        <div className="no-screenshot-placeholder">
          {isSharing ? 'Connecting...' : 'Not Sharing'}
        </div>
      )}
    </div>
  );
};

export default StudentScreen;
