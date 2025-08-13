import React, { useState, useEffect } from 'react';

export default function UnitForm({ submodule, moduleId, onBack, isSaved, onSuccess }) {
  const [units, setUnits] = useState(submodule?.units || [{ name: '', description: '', files: [] }]);
  const [fileKeys, setFileKeys] = useState([Date.now()]);

  useEffect(() => {
    if (submodule?.units) {
      setUnits(submodule.units);
      setFileKeys(submodule.units.map(() => Date.now()));
    }
  }, [submodule]);

  const handleUnitChange = (index, field, value) => {
    const updated = [...units];
    updated[index][field] = value;
    setUnits(updated);
  };

  const addUnit = () => {
    setUnits([...units, { name: '', description: '', files: [] }]);
    setFileKeys([...fileKeys, Date.now()]);
  };

  const removeUnit = (index) => {
    setUnits(units.filter((_, i) => i !== index));
    setFileKeys(fileKeys.filter((_, i) => i !== index));
  };

  const uploadUnits = async (publish = false) => {
    if (publish) {
      // console.log("Publishing units:", units);
      setFileKeys(units.map(() => Date.now()));
      onSuccess(true);
    }
  };

  return (
    <div className="bg-white shadow p-6 rounded-xl">
      <h2 className="text-2xl font-semibold mb-4">
        Add Units to: <span className="text-blue-600">{submodule?.name}</span>
      </h2>

      {units.map((unit, idx) => (
        <div key={idx} className="border p-4 rounded mb-4 relative">
          <input
            type="text"
            className="w-full border p-2 mb-2 rounded"
            placeholder="Unit Name"
            value={unit.name}
            onChange={(e) => handleUnitChange(idx, 'name', e.target.value)}
          />
          <textarea
            className="w-full border p-2 mb-2 rounded"
            placeholder="Description"
            value={unit.description}
            onChange={(e) => handleUnitChange(idx, 'description', e.target.value)}
          />
          <input
            type="file"
            multiple
            key={`unit-files-${fileKeys[idx]}`}
            onChange={(e) =>
              handleUnitChange(idx, 'files', Array.from(e.target.files))
            }
          />
          {units.length > 1 && (
            <button
              onClick={() => removeUnit(idx)}
              className="absolute top-2 right-2 text-sm text-red-500"
            >
              Remove
            </button>
          )}
        </div>
      ))}

      <button
        onClick={addUnit}
        className="mb-4 px-4 py-2 bg-green-200 rounded"
      >
        Add Another Unit
      </button>

      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Back
        </button>

        <div className="space-x-2">
          <button
            onClick={() => uploadUnits(false)}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            {isSaved ? 'Edit Draft' : 'Save as Draft'}
          </button>
          <button
            onClick={() => uploadUnits(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {isSaved ? 'Update' : 'Publish Module'}
          </button>
        </div>
      </div>
    </div>
  );
}