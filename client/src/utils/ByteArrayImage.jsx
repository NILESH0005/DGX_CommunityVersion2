import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const ByteArrayImage = ({ byteArray, className, fallbackComponent }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!byteArray) {
      setImageSrc(null);
      return;
    }

    const processImage = async () => {
      try {
        // Handle different input formats
        let bytes;
        if (typeof byteArray === 'string') {
          // Handle hex string format (like "0xFFD8FFE000...")
          if (byteArray.startsWith('0x')) {
            bytes = hexStringToBytes(byteArray);
          } 
          // Handle base64 string
          else if (isBase64(byteArray)) {
            setImageSrc(`data:image/jpeg;base64,${byteArray}`);
            return;
          }
        } 
        // Handle Buffer objects
        else if (byteArray.type === 'Buffer' && Array.isArray(byteArray.data)) {
          bytes = byteArray.data;
        }
        // Handle direct byte arrays
        else if (Array.isArray(byteArray)) {
          bytes = byteArray;
        }

        if (!bytes || bytes.length === 0) {
          throw new Error('Empty image data');
        }

        // Convert to base64
        const binary = bytes.map(b => String.fromCharCode(b)).join('');
        const base64 = window.btoa(binary);
        setImageSrc(`data:image/jpeg;base64,${base64}`);
        setError(false);
      } catch (err) {
        // console.error('Image processing error:', err);
        setError(true);
        setImageSrc(null);
      }
    };

    processImage();
  }, [byteArray]);

  // Helper function to convert hex string to byte array
  const hexStringToBytes = (hexString) => {
    try {
      if (!hexString.startsWith('0x')) return null;
      const hex = hexString.substring(2);
      const bytes = [];
      for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
      }
      return bytes;
    } catch (err) {
      // console.error('Hex conversion error:', err);
      return null;
    }
  };

  // Helper function to check if string is base64
  const isBase64 = (str) => {
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  };

  if (error || !imageSrc) {
    return fallbackComponent || (
      <div className={`flex items-center justify-center text-gray-400 text-sm h-full ${className || ''}`}>
        {byteArray ? 'Error loading image' : 'No Image'}
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt="Content"
      className={className || "w-full h-full object-cover"}
      onError={() => setError(true)}
    />
  );
};

ByteArrayImage.propTypes = {
  byteArray: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.shape({
      type: PropTypes.string,
      data: PropTypes.array
    })
  ]),
  className: PropTypes.string,
  fallbackComponent: PropTypes.node
};

export default ByteArrayImage;