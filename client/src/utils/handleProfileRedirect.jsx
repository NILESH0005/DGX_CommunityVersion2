import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Utility function to handle profile image clicks and redirect to user profile
 */
export const handleProfileRedirect = (userId, navigate) => {
  if (!userId || userId === 'undefined' || userId === 'null') {
    console.error('User ID is required for profile redirect');
    return;
  }
  
  // Redirect to UserDetails page with user ID as path parameter
  navigate(`/userprofile/profile/${userId}`);
};

/**
 * ProfileImage component with built-in redirect functionality
 */
export const ProfileImage = ({ 
  userId, 
  src, 
  alt, 
  style, 
  className, 
  imgStyle, 
  imgClassName, 
  ...imgProps 
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    handleProfileRedirect(userId, navigate);
  };
  
  return (
    <div 
      onClick={handleClick}
      style={{ cursor: 'pointer', display: 'inline-block', ...style }}
      className={className}
    >
     
    </div>
  );
};

/**
 * ProfileLink component for text-based profile redirects
 */
export const ProfileLink = ({ userId, children, style, className }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    handleProfileRedirect(userId, navigate);
  };
  
  return (
    <span 
      onClick={handleClick}
      style={{ cursor: 'pointer', ...style }}
      className={className}
    >
      {children}
    </span>
  );
};

export default handleProfileRedirect;