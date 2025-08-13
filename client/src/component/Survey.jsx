import React, { useState } from 'react';

const Survey = () => {
  const [responses, setResponses] = useState({});
  const questions = [
    { id: 1, question: "How satisfied are you with our service?" },
    { id: 2, question: "Would you recommend us to a friend?" },
    // Add more questions as needed
  ];

  const handleChange = (id, value) => {
    setResponses({ ...responses, [id]: value });
  };

  return (
    <div className="p-4 bg-DGXwhite text-DGXblack max-w-lg mx-auto my-4 rounded shadow-lg">
      <h1 className="text-2xl font-bold text-DGXblue mb-4">Survey</h1>
      {questions.map((q) => (
        <div key={q.id} className="mb-4">
          <p className="mb-2">{q.question}</p>
          <input
            type="text"
            className="border border-DGXgreen p-2 w-full rounded"
            onChange={(e) => handleChange(q.id, e.target.value)}
          />
        </div>
      ))}
      <button className="bg-DGXgreen text-DGXwhite p-2 mt-4 rounded hover:bg-green-700">
        Submit
      </button>
    </div>
  );
};

export default Survey;
