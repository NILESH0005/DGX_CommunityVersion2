import React, { useState } from 'react';
import { compressImage } from '../../../../utils/compressImage';

const UnitCreator = ({ subModuleId, onCancel, onCreate }) => {
    const [newUnit, setNewUnit] = useState({
        name: '',
        description: '',
        image: null
    });
    const [errors, setErrors] = useState({});
    const [isCompressing, setIsCompressing] = useState(false);

    const handleCreate = async () => {
        if (!newUnit.name.trim()) {
            setErrors({ name: 'Unit name is required' });
            return;
        }

        try {
            setIsCompressing(true);
            let compressedImage = null;
            if (newUnit.image) {
                compressedImage = await compressImage(newUnit.image);
            }

            const unit = {
                id: uuidv4(),
                name: newUnit.name.trim(),
                description: newUnit.description.trim(),
                image: compressedImage
            };

            onCreate(subModuleId, unit);
            onCancel(); 
        } catch (error) {
            // console.error('Error creating unit:', error);
        } finally {
            setIsCompressing(false);
        }
    };

    return (
        <div className="card bg-base-100 shadow-md">
            <div className="card-body">
                <h2 className="card-title text-xl mb-4">Create New Unit</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., React Components"
                            className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                            value={newUnit.name}
                            onChange={(e) => {

                                setNewUnit({ ...newUnit, name: e.target.value });
                                if (errors.name) setErrors({ ...errors, name: null });
                            }}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            placeholder="Brief description of this unit..."
                            className="textarea textarea-bordered w-full h-24"
                            value={newUnit.description}
                            onChange={(e) => setNewUnit({ ...newUnit, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Image
                        </label>
                        <div className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100">
                            {newUnit.image ? (
                                <>
                                    <img
                                        src={URL.createObjectURL(newUnit.image)}
                                        alt="Preview"
                                        className="h-24 object-contain mb-2 rounded-lg"
                                    />
                                    <button
                                        onClick={() => setNewUnit({ ...newUnit, image: null })}
                                        className="btn btn-xs btn-ghost text-red-500"
                                    >
                                        Remove Image
                                    </button>
                                </>
                            ) : (
                                <>
                                    <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <p className="text-xs text-gray-500 mb-2">Drag & drop or click to upload</p>
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="unit-image-upload"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) setNewUnit({ ...newUnit, image: file });
                                        }}
                                    />
                                    <label
                                        htmlFor="unit-image-upload"
                                        className="btn btn-xs btn-outline"
                                    >
                                        Select Image
                                    </label>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <button
                        onClick={onCancel}
                        className="btn btn-outline btn-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isCompressing}
                        className="btn btn-primary btn-sm"
                    >
                        {isCompressing ? (
                            <>
                                <span className="loading loading-spinner loading-xs"></span>
                                Creating...
                            </>
                        ) : 'Create Unit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnitCreator;