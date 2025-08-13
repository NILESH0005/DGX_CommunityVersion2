import React, { useState, useEffect } from 'react';

export default function SubmoduleForm({ moduleId, setSubmodule, onSuccess, onBack, editData, isSaved }) {
  const [submodules, setSubmodules] = useState(editData?.submodules || []);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [banner, setBanner] = useState(null);
  const [selectedId, setSelectedId] = useState(editData?.selected?.id || null);
  const [fileKey, setFileKey] = useState(Date.now());

  useEffect(() => {
    if (editData?.submodules) {
      setSubmodules(editData.submodules);
    }
    if (editData?.selected) {
      setSelectedId(editData.selected.id);
    }
  }, [editData]);

  const handleAddSubmodule = () => {
    if (!name.trim()) return;
    const newSubmodule = {
      id: Date.now(),
      name,
      description,
      banner,
    };
    setSubmodules([...submodules, newSubmodule]);
    setName('');
    setDescription('');
    setBanner(null);
    setFileKey(Date.now());
  };

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleNext = (saveToServer = false) => {
    if (!selectedId) return alert('Please select a submodule to proceed.');
    const selected = submodules.find((sm) => sm.id === selectedId);
    setSubmodule(selected);
    
    onSuccess({
      submodules,
      selected,
      isDraft: !saveToServer
    }, saveToServer);
  };

  return (
    <div className="bg-white shadow p-6 rounded-xl">
      <h2 className="text-2xl font-semibold mb-4">Submodules for Module</h2>

      <div className="space-y-4 mb-4">
        <input
          type="text"
          className="w-full border p-2 rounded"
          placeholder="Submodule Name"
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
          key={`submodule-banner-${fileKey}`}
          onChange={(e) => setBanner(e.target.files[0])}
        />
        <button
          onClick={handleAddSubmodule}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Add Submodule
        </button>
      </div>

      {submodules.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Available Submodules</h3>
          <ul className="space-y-2">
            {submodules.map((sm) => (
              <li
                key={sm.id}
                className={`border rounded p-3 cursor-pointer ${selectedId === sm.id ? 'bg-blue-100 border-blue-400' : 'hover:bg-gray-50'}`}
                onClick={() => handleSelect(sm.id)}
              >
                <div className="font-medium">{sm.name}</div>
                <div className="text-sm text-gray-600">{sm.description}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button onClick={onBack} className="px-4 py-2 bg-gray-300 rounded">
          Back
        </button>
        <div className="space-x-2">
          <button 
            onClick={() => handleNext(false)} 
            className="px-4 py-2 bg-gray-200 rounded"
          >
            {isSaved ? 'Edit Draft' : 'Save Locally'}
          </button>
          <button 
            onClick={() => handleNext(true)} 
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {isSaved ? 'Update' : 'Save & Next'}
          </button>
        </div>
      </div>
    </div>
  );
}