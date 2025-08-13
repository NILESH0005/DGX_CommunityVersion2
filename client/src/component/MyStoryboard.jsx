
import React, { useState, useEffect } from 'react';
import { FaThumbsUp, FaComment, FaTrash, FaEdit } from 'react-icons/fa';
import { images } from '../constant/index.js';

const MyStoryboard = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: { id: 'user1', name: 'Zeeshan', profilePic: 'https://via.placeholder.com/50' },
      certificate: 'Certificate in Web Development',
      caption: 'Completed an amazing course! #webdevelopment',
      image: images.Certificate1, // Use the image from import
      link: 'https://example.com/certificate1',
      fileType: 'image',
      file: images.Certificate1, // Use the image from import
      likes: 0,
      comments: [],
      createdAt: new Date(), // Add creation time
    },
    {
      id: 2,
      user: { id: 'user2', name: 'Anshul', profilePic: 'https://via.placeholder.com/50' },
      certificate: 'Certificate in Data Science',
      caption: 'Data Science is the future! #datascience',
      image: images.Certificate2, // Use the image from import
      link: 'https://example.com/certificate2',
      fileType: 'image',
      file: images.Certificate2, // Use the image from import
      likes: 0,
      comments: [],
      createdAt: new Date(), // Add creation time
    },
  ]);

  const [newPost, setNewPost] = useState({ user: '', certificate: '', caption: '', image: null, link: '', fileType: '', file: '' });
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [activeReplyTo, setActiveReplyTo] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [timestamps, setTimestamps] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimestamps(() => {
        const now = new Date();
        return posts.reduce((acc, post) => {
          acc[post.id] = {
            postTime: formatTimeElapsed(now - new Date(post.createdAt)),
            comments: post.comments.map(comment => ({
              id: comment.id,
              time: formatTimeElapsed(now - new Date(comment.createdAt)),
            })),
          };
          return acc;
        }, {});
      });
    }, 1000);


    return () => clearInterval(intervalId);
  }, [posts]);

  const formatTimeElapsed = (ms) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds} sec${seconds !== 1 ? 's' : ''} ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hr${hours !== 1 ? 's' : ''} ago`;
  };

  const formatText = (text) => {
    return text
      .split(' ')
      .map(word => {
        if (word.startsWith('#')) {
          return `<span class="text-blue-600 text-xl font-semibold">${word}</span>`;
        } else if (word.startsWith('@')) {
          const username = word.substring(1); // Remove '@'
          return `<a href="/profile/${username}" class="text-blue-600 text-xl font-semibold">@${username}</a>`;
        } else {
          return word;
        }
      })
      .join(' ');
  };


  const handleLike = (id) => {
    setPosts(posts.map(post => post.id === id ? { ...post, likes: post.likes + 1 } : post));
  };

  const handleAddComment = (id, parentCommentId = null) => {
    const updatedPosts = posts.map(post => {
      if (post.id === id) {
        const updatedComments = parentCommentId
          ? post.comments.map(comment => comment.id === parentCommentId
            ? { ...comment, replies: [...comment.replies, { id: Date.now(), text: replyInputs[parentCommentId], createdAt: new Date(), user: { id: 'replyUser', name: 'Reply User' } }] }
            : comment
          )
          : [...post.comments, { id: Date.now(), text: commentInputs[id], createdAt: new Date(), user: { id: 'commentUser', name: 'Comment User' }, replies: [] }];
        return { ...post, comments: updatedComments };
      }
      return post;
    });
    setPosts(updatedPosts);
    setCommentInputs({ ...commentInputs, [id]: '' });
    setReplyInputs({ ...replyInputs, [parentCommentId]: '' });
    setActiveReplyTo(null);
  };

  const handleEditComment = (postId, commentId, newText) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const updatedComments = post.comments.map(comment =>
          comment.id === commentId ? { ...comment, text: newText } : comment
        );
        return { ...post, comments: updatedComments };
      }
      return post;
    });
    setPosts(updatedPosts);
  };

  const handleDeleteComment = (postId, commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          const updatedComments = post.comments.filter(comment => comment.id !== commentId);
          return { ...post, comments: updatedComments };
        }
        return post;
      });
      setPosts(updatedPosts);
    }
  };

  const validateFields = () => {
    let isValid = true;
    const newErrors = {};

    if (!newPost.certificate.trim()) {
      newErrors.certificate = 'Certificate title is required';
      isValid = false;
    }
    // if (!newPost.caption.trim()) {
    //   newErrors.caption = 'Caption is required';
    //   isValid = false;
    // }
    if (!newPost.file) {
      newErrors.file = 'Image is required';
      isValid = false;
    }
    // if (!newPost.link.trim()) {
    //   newErrors.link = 'Link is required';
    //   isValid = false;
    // }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddPost = () => {
    if (!validateFields()) {
      return;
    }

    const newId = posts.length ? posts[posts.length - 1].id + 1 : 1;
    const post = { id: newId, ...newPost, likes: 0, comments: [], user: { id: 'newUser', name: 'New User', profilePic: 'https://via.placeholder.com/50' }, createdAt: new Date() };
    setPosts([post, ...posts]);
    setNewPost({ user: '', certificate: '', caption: '', image: null, link: '', fileType: '', file: '' });
    setShowCreatePost(false);
    setPreviewImage(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxSize = 400;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imageDataUrl = canvas.toDataURL(file.type);

        setNewPost((prevPost) => ({
          ...prevPost,
          file: imageDataUrl,
          fileType: 'image',
          originalDimensions: { width: originalWidth, height: originalHeight },
          dimensions: { width, height },
        }));

        setPreviewImage(imageDataUrl);
      };
    }
  };



  const handleCancel = () => {
    setNewPost({
      user: '',
      certificate: '',
      caption: '',
      image: null,
      link: '',
      fileType: '',
      file: ''
    });
    setShowCreatePost(false);
    setPreviewImage(null);
    setErrors({});
  };


  const handleCaptionChange = (e) => {
    const text = e.target.value;
    const formattedCaption = formatText(text);
    setNewPost({ ...newPost, caption: formattedCaption });
  };

  const handleCommentChange = (id, value) => {
    setCommentInputs({ ...commentInputs, [id]: value });
  };

  const handleReplyChange = (commentId, value) => {
    setReplyInputs({ ...replyInputs, [commentId]: value });
  };

  const handleImageClick = (file) => {
    setFullScreenImage(file);
  };

  const closeFullScreen = () => {
    setFullScreenImage(null);
  };

  return (
    <div className="p-6 bg-slate-200 min-h-screen flex justify-center items-center">
      <div className="w-full max-w-[1600px] p-10">
        <h1 className="text-6xl font-serif mb-10 text-black font-bold text-center bg-DGXgreen bg-clip-text text-transparent animate-gradient">
          Storyboard
        </h1>
        <button
          onClick={() => setShowCreatePost(true)}
          className="mb-10 bg-gradient-to-r from-DGXgreen to-DGXblue text-white font-medium p-3 rounded-full shadow-lg block mx-auto transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
        >
          Create Post
        </button>

        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
            <div className="bg-white p-4 rounded shadow-lg w-full max-w-[900px] border-2 border-DGXgreen overflow-y-auto" style={{ boxShadow: `0 4px 6px var(--DGXgray)` }}>
              <h2 className="text-xl font-semibold mb-2 text-DGXblack m-2">Create a New Post</h2>
              <input
                type="text"
                value={newPost.certificate}
                onChange={(e) => setNewPost({ ...newPost, certificate: e.target.value })}
                placeholder="Certificate Title"
                className={`border m-2 p-2 w-full mb-2  ${errors.certificate ? 'border-red-500' : 'border-gray-300'} rounded border-DGXgray text-DGXblack`}
              />
              {errors.certificate && <p className="text-red-500 text-sm mt-1">{errors.certificate}</p>}
              <textarea
                value={newPost.caption.replace(/<[^>]+>/g, '')}
                onChange={handleCaptionChange}
                placeholder="Caption (use # for hashtags)"
                className={`border p-2 m-2 w-full mb-2 rounded border-DGXgray text-DGXblack`}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={`border p-2 m-2 w-full mb-2 ${errors.file ? 'border-red-500' : 'border-gray-300'} rounded border-DGXgray text-DGXblack`}
              />
              {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
              {previewImage && (
                <div className="my-4 m-2 flex justify-center">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-200 h-200 object-cover border-2 border-DGXgreen rounded"
                  />
                </div>
              )}
              <input
                type="text"
                value={newPost.link}
                onChange={(e) => setNewPost({ ...newPost, link: e.target.value })}
                placeholder="Link to Certificate"
                className="border m-2 p-2 w-full mb-2 rounded border-DGXgray text-DGXblack"
              />
              <div className="flex justify-between">
                <button
                  onClick={handleAddPost}
                  className="bg-DGXblue m-2 text-white p-2 rounded hover:bg-DGXgreen"
                >
                  Post
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-red-500 m-2 text-white p-2 rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}


        {posts.map(post => (
          <div key={post.id} className="grid grid-cols-1 lg:grid-cols-7 mb-6 p-4 border border-DGXgray rounded shadow-sm bg-white">
            <div className="lg:col-span-5">
              <div className="flex items-center mb-4">
                <img src={post.user.profilePic} alt={post.user.name} className="w-10 h-10 rounded-full mr-4" />
                <div>
                  <p className="text-DGXblack font-bold">{post.user.name}</p>
                  <p className="text-DGXgray text-sm">{timestamps[post.id]?.postTime}</p>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-DGXblack mb-2">{post.certificate}</h2>
              <div className="mb-4" dangerouslySetInnerHTML={{ __html: formatText(post.caption) }} />
              <div className="flex justify-center items-center m-8 mb-0 p-2 border-2 border-DGXgreen bg-gray-100 w-full lg:w-3/5 mx-auto">
                {post.fileType === 'image' && (
                  <img
                    src={post.file}
                    alt="Image"
                    onClick={() => handleImageClick(post.file)}
                    className="max-w-full max-h-60 object-contain"
                  />
                )}
              </div>
              <button onClick={() => handleLike(post.id)} className="flex items-center justify-center text-DGXblue mr-4 mt-4 lg:mt-0">
                <FaThumbsUp className="mr-1" /> {post.likes} Likes
              </button>
              <div className="flex items-center mt-4 lg:mt-0">
                <FaComment className="mr-1 text-DGXgray" />
                <input
                  type="text"
                  value={commentInputs[post.id] || ''}
                  onChange={(e) => handleCommentChange(post.id, e.target.value)}
                  placeholder="Add a comment"
                  className="border p-2 rounded border-DGXgray text-DGXblack w-full lg:w-50"
                />
                <button onClick={() => handleAddComment(post.id)} className="bg-DGXblue text-white p-2 rounded ml-2">
                  Post
                </button>
              </div>
            </div>

            <div className="lg:col-span-2 mt-4 lg:mt-0">
              {post.comments.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-DGXblack">Comments:</h3>
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="border-b border-DGXgray mb-2 pb-2">
                      <div className="flex items-center mb-2">
                        <p className="text-DGXblack font-bold mr-2">{comment.user.name}:</p>
                        {comment.isEditing ? (
                          <input
                            type="text"
                            value={comment.text}
                            onChange={(e) => handleEditComment(post.id, comment.id, e.target.value)}
                            className="border p-2 rounded border-DGXgray text-DGXblack w-full"
                          />
                        ) : (
                          <p className="text-DGXblack" dangerouslySetInnerHTML={{ __html: formatText(comment.text) }} />
                        )}
                        <button
                          onClick={() =>
                            setPosts(
                              posts.map((p) =>
                                p.id === post.id
                                  ? {
                                    ...p,
                                    comments: p.comments.map((c) =>
                                      c.id === comment.id ? { ...c, isEditing: !c.isEditing } : c
                                    ),
                                  }
                                  : p
                              )
                            )
                          }
                          className="ml-4 text-DGXblue"
                        >
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDeleteComment(post.id, comment.id)} className="ml-2 text-red-500">
                          <FaTrash />
                        </button>
                      </div>
                      <p className="text-DGXgray text-sm">
                        {timestamps[post.id]?.comments.find((c) => c.id === comment.id)?.time}
                      </p>
                      {comment.replies.length > 0 && (
                        <div className="ml-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="border-t border-DGXgray mt-2 pt-2">
                              <p className="text-DGXblack">{reply.user.name}:</p>
                              <p className="text-DGXgray" dangerouslySetInnerHTML={{ __html: formatText(reply.text) }} />
                            </div>
                          ))}
                        </div>
                      )}
                      {activeReplyTo === comment.id ? (
                        <div className="ml-4 mt-2">
                          <input
                            type="text"
                            value={replyInputs[comment.id] || ''}
                            onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                            placeholder="Reply"
                            className="border p-2 rounded border-DGXgray text-DGXblack w-full"
                          />
                          <button onClick={() => handleAddComment(post.id, comment.id)} className="bg-DGXblue text-white p-2 rounded ml-2">
                            Reply
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setActiveReplyTo(comment.id)} className="bg-DGXblue text-white p-2 rounded mt-2">
                          Reply
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>




        ))}

        {fullScreenImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="p-4 rounded shadow-lg w-full h-full relative flex items-center justify-center">
              <button onClick={closeFullScreen} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded">
                Close
              </button>
              <img
                src={fullScreenImage}
                alt="Full Size"
                className=""
                style={{
                  maxWidth: '90%',
                  maxHeight: '90%',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyStoryboard;
