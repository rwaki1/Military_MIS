import React from "react";
import "./PersonnelCard.css";

const PersonnelCard = ({ person }) => {
  return (
    <div className="personnel-card">
      <div className="top-row">
        <div className="logo-container">
          <img
            src="/lion-de-sarambwe.jpg"
            alt="Lion Logo"
            className="lion-logo-img"
          />
        </div>

        <div className="name-container">
          <span className="name-on-logo">{person.name}</span>
        </div>

        <div className="profile-photo-container">
          <img
            src={person.photoURL || "/default-profile.png"}
            alt="Profile"
            className="personnel-photo"
          />
        </div>
      </div>

      <div className="personnel-info">
        <p><strong>Grade:</strong> {person.grade}</p>
        <p><strong>Date of Birth:</strong> {person.date_of_birth}</p>
        <p><strong>Region:</strong> {person.region}</p>
      </div>
    </div>
  );
};

export default PersonnelCard;
