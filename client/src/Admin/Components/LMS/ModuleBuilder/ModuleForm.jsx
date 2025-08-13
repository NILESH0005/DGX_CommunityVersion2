import React, { useState, useEffect } from 'react';

export default function ModuleForm({ onSuccess, onBack, editData, isSaved }) {
  const [name, setName] = useState(editData?.name || '');
  const [description, setDescription] = useState(editData?.description || '');
  const [banner, setBanner] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now());

  useEffect(() => {
    if (editData) {
      setName(editData.name || '');
      setDescription(editData.description || '');
      setBanner(editData.banner || null);
    }
  }, [editData]);

  const handleSubmit = async (saveToServer = false) => {
    const formData = {
      name,
      description,
      banner,
      isDraft: !saveToServer
    };

    if (saveToServer) {
      // console.log("Saving to server:", formData);
      setFileKey(Date.now());
    }
    
    onSuccess(formData, saveToServer);
  };

  return (
    <div className="bg-white shadow p-6 rounded-xl">
      <h2 className="text-2xl font-semibold mb-4">Module Information</h2>

      <div className="space-y-4">
        <input
          type="text"
          className="w-full border p-2 rounded"
          placeholder="Module Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="file"
          key={`banner-${fileKey}`}
          onChange={(e) => setBanner(e.target.files[0])}
        />

        <div className="flex justify-end pt-4 space-x-2">
          <button
            onClick={() => handleSubmit(false)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            {isSaved ? 'Edit Draft' : 'Save Locally'}
          </button>
          <button
            onClick={() => handleSubmit(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {isSaved ? 'Update' : 'Save & Next'}
          </button>
        </div>
      </div>
    </div>
  );
}