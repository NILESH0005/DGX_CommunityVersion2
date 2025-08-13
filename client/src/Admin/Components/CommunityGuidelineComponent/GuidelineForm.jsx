import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's CSS

const GuidelineForm = () => {
  const [heading, setHeading] = useState('');
  const [subHeading, setSubHeading] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Do something with the submitted data
    // console.log({
    //   heading,
    //   subHeading,
    //   description,
    // });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="heading"><b>Heading</b></label>
        <div style={{ width: '100%', height: '150px' }}>
          <ReactQuill
            value={heading}
            onChange={setHeading}
            style={{ height: '100%' }}
            modules={{
              toolbar: [
                ['bold', 'italic', 'underline'],
                [{ header: [1, 2, false] }],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['clean'],
              ],
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px' , marginTop:'50px'}}>
        <label htmlFor="subHeading"><b>Subheading</b></label>
        <div style={{ width: '100%', height: '100px' }}>
          <ReactQuill
            value={subHeading}
            onChange={setSubHeading}
            style={{ height: '100%' }}
            modules={{
              toolbar: [
                ['bold', 'italic'],
                [{ header: [3, 4, false] }],
                ['clean'],
              ],
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '20px', marginTop:'50px' }}>
        <label htmlFor="description"><b>Description</b></label>
        <div style={{ width: '100%', height: '200px' }}>
          <ReactQuill
            value={description}
            onChange={setDescription}
            style={{ height: '100%' }}
            modules={{
              toolbar: [
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean'],
              ],
            }}
          />
        </div>
      </div>

      <button 
        type="submit" 
        style={{
          padding: '10px 20px', 
          backgroundColor: '#007BFF',
          marginTop:'25px', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer',
          fontSize: '16px',
          transition: 'background-color 0.3s, transform 0.3s',
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007BFF'}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98'} 
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        Submit
      </button>
    </form>
  );
};

// Make sure to export GuidelineForm as default
export default GuidelineForm;
