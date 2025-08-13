import React, { useState } from "react";
import { FiTrash, FiEdit } from "react-icons/fi";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const QuizQuestionTable = ({ questions, handleEdit, handleDelete }) => {
  const [modalImage, setModalImage] = useState(null); // State to store the image URL for the modal

  // Function to open the modal with the clicked image
  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
  };

  // Function to close the modal
  const closeImageModal = () => {
    setModalImage(null);
  };

  return (
    <div className="mt-6">
      {questions.length > 0 ? (
        questions.map((question) => (
          <div key={question.id} className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h3 className="text-lg font-bold">{question.text}</h3>
            {question.image && (
              <img
                src={question.image}
                alt="Question"
                className="w-full h-40 object-cover rounded-md border mt-2"
              />
            )}
            <div className="mt-2">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={question.correctAnswers.includes(index)}
                    readOnly
                    className="cursor-pointer"
                  />
                  <span>{option}</span>
                  {/* Render option image if it exists */}
                  {question.optionImages[index] && (
                    <img
                      src={question.optionImages[index]}
                      alt={`Option ${index + 1}`}
                      className="w-16 h-10 object-cover rounded-md border cursor-pointer"
                      onClick={() => openImageModal(question.optionImages[index])}
                    />
                  )}
                </div>
              ))}
            </div>
            {/* <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleEdit(question.id)}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
              >
                <FiEdit size={16} />
              </button>
              <button
                onClick={() => handleDelete(question.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                <FiTrash size={16} />
              </button>
            </div> */}
          </div>
        ))
      ) : null}

      {/* Modal for displaying the image */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
          onClick={closeImageModal}
        >
          <div className="bg-white p-4 rounded-lg max-w-[90%] max-h-[90%] overflow-auto">
            <img
              src={modalImage}
              alt="Enlarged Option"
              className="w-full h-auto object-contain"
            />
            <button
              onClick={closeImageModal}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizQuestionTable;