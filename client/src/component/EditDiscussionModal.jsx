import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditDiscussionModal = ({ 
  isOpen, 
  onRequestClose, 
  discussion, 
  onUpdate 
}) => {
  const [title, setTitle] = useState(discussion?.Title || '');
  const [content, setContent] = useState(discussion?.Content || '');
  const [tags, setTags] = useState(discussion?.Tag ? (typeof discussion.Tag === 'string' ? discussion.Tag.split(',') : discussion.Tag) : []);
  const [links, setLinks] = useState(discussion?.ResourceUrl ? (typeof discussion.ResourceUrl === 'string' ? discussion.ResourceUrl.split(',') : discussion.ResourceUrl) : []);
  const [privacy, setPrivacy] = useState(discussion?.Visibility || '');
  const [tagInput, setTagInput] = useState('');
  const [linkInput, setLinkInput] = useState('');
  const [errors, setErrors] = useState({
    title: '',
    content: '',
    tags: '',
    privacy: ''
  });

  useEffect(() => {
    if (discussion) {
      setTitle(discussion.Title);
      setContent(discussion.Content);
      setTags(discussion.Tag ? (typeof discussion.Tag === 'string' ? discussion.Tag.split(',') : discussion.Tag) : []);
      setLinks(discussion.ResourceUrl ? (typeof discussion.ResourceUrl === 'string' ? discussion.ResourceUrl.split(',') : discussion.ResourceUrl) : []);
      setPrivacy(discussion.Visibility || '');
    }
  }, [discussion]);

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      setErrors({ ...errors, tags: '' });
    } else if (tags.length >= 5) {
      setErrors({ ...errors, tags: 'Maximum 5 tags allowed' });
    }
  };

  const handleAddLink = () => {
    if (linkInput.trim()) {
      // Add https:// if not present
      let formattedLink = linkInput.trim();
      if (!formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
        formattedLink = `https://${formattedLink}`;
      }

      // Validate URL
      const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (urlRegex.test(formattedLink)) {
        setLinks([...links, formattedLink]);
        setLinkInput('');
      } else {
        setErrors({ ...errors, links: 'Please enter a valid URL (e.g., https://example.com)' });
      }
    }
  };

  const removeTag = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
    if (newTags.length === 0) {
      setErrors({ ...errors, tags: 'At least one tag is required' });
    }
  };

  const removeLink = (index) => {
    const newLinks = [...links];
    newLinks.splice(index, 1);
    setLinks(newLinks);
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      title: '',
      content: '',
      tags: '',
      privacy: ''
    };

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      valid = false;
    }

    if (!content.trim() || content === '<p><br></p>') {
      newErrors.content = 'Content is required';
      valid = false;
    }

    if (tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
      valid = false;
    }

    if (!privacy || privacy === '') {
      newErrors.privacy = 'Please select a privacy option';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const updatedDiscussion = {
      ...discussion,
      Title: title,
      Content: content,
      Tag: tags.join(','),
      ResourceUrl: links.join(','),
      Visibility: privacy
    };

    onUpdate(updatedDiscussion);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Discussion</h2>
          <button 
            onClick={onRequestClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.title ? 'border-red-500' : ''
              }`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors({ ...errors, title: '' });
              }}
            />
            {errors.title && (
              <p className="text-red-500 text-xs italic">{errors.title}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              className={`border rounded-lg ${
                errors.content ? 'border-red-500' : ''
              }`}
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  ['blockquote', 'code-block'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link', 'formula'],
                  ['clean'],
                ],
              }}
            />
            {errors.content && (
              <p className="text-red-500 text-xs italic">{errors.content}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Tags <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.tags ? 'border-red-500' : ''
                }`}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-DGXgreen text-white px-4 py-2 rounded-lg"
              >
                Add
              </button>
            </div>
            {errors.tags && (
              <p className="text-red-500 text-xs italic">{errors.tags}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center bg-DGXgreen text-white rounded-full px-3 py-1"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-2 text-white hover:text-red-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Links
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                className="w-full px-3 py-2 border rounded-lg"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddLink();
                  }
                }}
                placeholder="Enter full URL (e.g., https://example.com)"
              />
              <button
                type="button"
                onClick={handleAddLink}
                className="bg-DGXblue text-white px-4 py-2 rounded-lg"
              >
                Add
              </button>
            </div>
            {errors.links && (
              <p className="text-red-500 text-xs italic">{errors.links}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {links.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center bg-DGXblue text-white rounded-full px-3 py-1"
                >
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:underline truncate max-w-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {link}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeLink(index)}
                    className="ml-2 text-white hover:text-red-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Privacy <span className="text-red-500">*</span>
            </label>
            <select
              value={privacy}
              onChange={(e) => {
                setPrivacy(e.target.value);
                setErrors({ ...errors, privacy: '' });
              }}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.privacy ? 'border-red-500' : ''
              }`}
            >
              <option value="">-- Select Privacy --</option>
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
            {errors.privacy && (
              <p className="text-red-500 text-xs italic">{errors.privacy}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg"
              onClick={onRequestClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDiscussionModal;