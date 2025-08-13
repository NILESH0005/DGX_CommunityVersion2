import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill's CSS

const editableData = [
  {
    id: 1,
    title: "Overview",
    description: "Suggest new features and improvements to enhance the platform.",
    imageUrl: "https://via.placeholder.com/150", // Placeholder image URL
  },
  {
    id: 2,
    title: "Providing Feedback",
    description: "Share constructive feedback on features.",
    imageUrl: "https://via.placeholder.com/150", // Placeholder image URL
  },
  // Add more editable items as needed
];

const EditableTable = () => {
  const [data, setData] = useState(editableData);
  const [editIndex, setEditIndex] = useState(null);
  const [editedContent, setEditedContent] = useState({ title: '', description: '', imageUrl: '' });

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedContent({
      title: data[index].title,
      description: data[index].description,
      imageUrl: data[index].imageUrl,
    });
  };

  const handleSave = (index) => {
    const updatedData = data.map((item, idx) => (idx === index ? { ...item, ...editedContent } : item));
    setData(updatedData);
    setEditIndex(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedContent((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id="editable-table" className="mb-8">
      <h2 className="text-2xl text-DGXblack mt-8 text-center font-bold">
        Editable Guidelines and Descriptions
      </h2>

      <table className="min-w-full mt-4 border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="text-left p-4 border-b">Title</th>
            <th className="text-left p-4 border-b">Description</th>
            <th className="text-left p-4 border-b">Image</th>
            <th className="text-left p-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              <td className="p-4 font-bold text-DGXblack">
                {editIndex === index ? (
                  <input
                    type="text"
                    value={editedContent.title}
                    onChange={(e) => setEditedContent((prev) => ({ ...prev, title: e.target.value }))}
                    className="border border-gray-300 p-2 rounded"
                  />
                ) : (
                  item.title
                )}
              </td>
              <td className="p-4 text-[#374151]">
                {editIndex === index ? (
                  <ReactQuill
                    value={editedContent.description}
                    onChange={(value) => setEditedContent((prev) => ({ ...prev, description: value }))}
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['clean'],
                      ],
                    }}
                  />
                ) : (
                  item.description
                )}
              </td>
              <td className="p-4">
                {editIndex === index ? (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mb-2"
                    />
                    {editedContent.imageUrl && (
                      <img src={editedContent.imageUrl} alt="Preview" className="w-32 h-32 object-cover" />
                    )}
                  </>
                ) : (
                  <img src={item.imageUrl} alt="Preview" className="w-32 h-32 object-cover" />
                )}
              </td>
              <td className="p-4">
                {editIndex === index ? (
                  <button
                    onClick={() => handleSave(index)}
                    className="bg-DGXgreen text-white py-2 px-4 rounded"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(index)}
                    className="bg-blue-500 text-white py-2 px-4 rounded"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default EditableTable;
