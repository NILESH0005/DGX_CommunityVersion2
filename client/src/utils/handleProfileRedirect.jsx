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
  alt = "Profile", 
  style, 
  className, 
  imgClassName, 
  ...imgProps 
}) => {
  const navigate = useNavigate();
  
  
  const handleClick = () => {
    handleProfileRedirect(userId, navigate);
  };
  
  return (
    <img
      src={src}
      alt={alt}
      onClick={handleClick}
      className={`${className} cursor-pointer ${imgClassName || ""}`}
      style={style}
      {...imgProps}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "/default-profile.png"; // 👈 fallback image
      }}
    />
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