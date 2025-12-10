import React from "react";

// Same doodle avatars as in AvatarPicker
const doodleAvatars = [
  // Simple face doodles
  <svg key="0" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="35" cy="40" r="5" fill="#333"/>
    <circle cx="65" cy="40" r="5" fill="#333"/>
    <path d="M 30 65 Q 50 75 70 65" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round"/>
  </svg>,
  
  <svg key="1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="35" cy="40" r="5" fill="#333"/>
    <circle cx="65" cy="40" r="5" fill="#333"/>
    <path d="M 30 65 Q 50 55 70 65" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round"/>
  </svg>,

  <svg key="2" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="35" cy="40" r="5" fill="#333"/>
    <circle cx="65" cy="40" r="5" fill="#333"/>
    <line x1="30" y1="65" x2="70" y2="65" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
  </svg>,

  // Person doodles
  <svg key="3" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="30" r="15" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <path d="M 50 45 L 50 75" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <path d="M 50 55 L 30 70" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <path d="M 50 55 L 70 70" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <path d="M 50 75 L 30 95" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <path d="M 50 75 L 70 95" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
  </svg>,

  <svg key="4" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="25" r="12" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="50" cy="50" rx="20" ry="25" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <path d="M 40 65 L 35 90" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <path d="M 60 65 L 65 90" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
  </svg>,

  // Star
  <svg key="5" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M 50 10 L 55 40 L 85 40 L 62 58 L 70 90 L 50 70 L 30 90 L 38 58 L 15 40 L 45 40 Z" 
          fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,

  // Heart
  <svg key="6" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M 50 30 Q 30 20 20 35 Q 10 50 30 70 Q 50 85 50 85 Q 50 85 70 70 Q 90 50 80 35 Q 70 20 50 30 Z" 
          fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,

  // Lightning
  <svg key="7" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M 45 10 L 25 50 L 40 50 L 35 90 L 75 40 L 55 40 L 60 10 Z" 
          fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,

  // Circle with pattern
  <svg key="8" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="35" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="50" cy="50" r="20" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="50" cy="50" r="5" fill="#333"/>
  </svg>,

  // Square with smile
  <svg key="9" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="60" height="60" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" rx="5"/>
    <circle cx="35" cy="40" r="4" fill="#333"/>
    <circle cx="65" cy="40" r="4" fill="#333"/>
    <path d="M 30 60 Q 50 70 70 60" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round"/>
  </svg>,

  // Triangle
  <svg key="10" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M 50 15 L 85 80 L 15 80 Z" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="50" cy="50" r="8" fill="#333"/>
  </svg>,

  // Diamond
  <svg key="11" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M 50 15 L 85 50 L 50 85 L 15 50 Z" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,

  // Hexagon
  <svg key="12" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M 50 10 L 80 25 L 80 55 L 50 70 L 20 55 L 20 25 Z" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,

  // Sun
  <svg key="13" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="20" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <line x1="50" y1="10" x2="50" y2="30" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <line x1="50" y1="70" x2="50" y2="90" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <line x1="10" y1="50" x2="30" y2="50" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <line x1="70" y1="50" x2="90" y2="50" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <line x1="20" y1="20" x2="30" y2="30" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <line x1="70" y1="70" x2="80" y2="80" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <line x1="80" y1="20" x2="70" y2="30" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <line x1="30" y1="70" x2="20" y2="80" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
  </svg>,

  // Moon
  <svg key="14" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M 70 20 Q 50 20 35 35 Q 20 50 35 65 Q 50 80 70 80 Q 65 60 65 50 Q 65 40 70 20" 
          fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,

  // Cloud
  <svg key="15" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M 30 50 Q 20 50 20 60 Q 20 70 30 70 L 70 70 Q 80 70 80 60 Q 80 50 70 50 Q 70 40 60 40 Q 50 30 40 40 Q 30 40 30 50" 
          fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,

  // Flower
  <svg key="16" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="15" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="50" cy="30" rx="8" ry="15" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="50" cy="70" rx="8" ry="15" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="30" cy="50" rx="15" ry="8" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="70" cy="50" rx="15" ry="8" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
  </svg>,

  // Rocket
  <svg key="17" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M 50 10 L 60 40 L 50 50 L 40 40 Z" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <ellipse cx="50" cy="50" rx="10" ry="30" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <path d="M 40 80 L 35 90 L 40 90 Z" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M 60 80 L 65 90 L 60 90 Z" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="50" cy="40" r="3" fill="#333"/>
  </svg>,

  // Cat face
  <svg key="18" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="35" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <path d="M 35 30 L 30 20 M 65 30 L 70 20" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="40" cy="45" r="4" fill="#333"/>
    <circle cx="60" cy="45" r="4" fill="#333"/>
    <path d="M 40 60 Q 50 65 60 60" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M 50 50 L 50 65" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
  </svg>,

  // Dog face
  <svg key="19" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="50" rx="30" ry="35" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="30" cy="40" rx="8" ry="12" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="70" cy="40" rx="8" ry="12" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="40" cy="45" r="3" fill="#333"/>
    <circle cx="60" cy="45" r="3" fill="#333"/>
    <ellipse cx="50" cy="65" rx="8" ry="5" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
  </svg>,

  // Bird
  <svg key="20" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="50" rx="20" ry="15" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <path d="M 60 50 L 75 40 L 80 50 L 75 60 Z" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="35" cy="45" r="3" fill="#333"/>
    <path d="M 30 50 Q 25 45 20 50" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>,

  // Fish
  <svg key="21" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="50" rx="30" ry="20" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
    <path d="M 20 50 L 10 40 L 10 60 Z" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="60" cy="45" r="4" fill="#333"/>
    <path d="M 30 40 Q 35 35 40 40" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round"/>
  </svg>,

  // House
  <svg key="22" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M 50 15 L 20 40 L 20 80 L 80 80 L 80 40 Z" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="35" y="55" width="15" height="20" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
    <rect x="55" y="55" width="15" height="15" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
  </svg>,

  // Tree
  <svg key="23" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M 50 20 Q 30 30 30 50 Q 30 70 50 60 Q 70 70 70 50 Q 70 30 50 20" 
          fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="45" y="60" width="10" height="30" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
  </svg>
];

const AvatarDoodle = ({ index }) => {
  if (index === null || index === undefined || index < 0 || index >= doodleAvatars.length) {
    return <span style={{ fontSize: "1.5rem" }}>👤</span>;
  }
  
  return (
    <div style={{ width: "35px", height: "35px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {doodleAvatars[index]}
    </div>
  );
};

export default AvatarDoodle;

