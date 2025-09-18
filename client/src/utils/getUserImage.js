import images from "../../public/images.js";

export const getUserImage = (user) => {
  if (!user) return images.defaultProfile;

  // Case 1: stored as URL or file path
  if (user.ProfilePicture && user.ProfilePicture.startsWith("http")) {
    return user.ProfilePicture;
  }

  // Case 2: stored as relative path in DB (e.g. /uploads/xyz.png)
  if (user.ProfilePicture && !user.ProfilePicture.startsWith("data:")) {
    return `${import.meta.env.VITE_API_BASE_URL}${user.ProfilePicture}`;
  }

  // Case 3: stored as Base64 string
  if (user.ProfilePicture && user.ProfilePicture.startsWith("data:")) {
    return user.ProfilePicture;
  }

  // Fallback
  return images.defaultProfile;
};
