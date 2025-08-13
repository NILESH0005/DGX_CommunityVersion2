
import React, { useState } from 'react';
import CreateQuiz from "./CreateQuiz";
import QuizTable from "./QuizTable";
import UpcomingQuiz from "./UpcomingQuiz";

const QuizPanel = () => {
  const [activeComponent, setActiveComponent] = useState('QuizTable');
  const [quizzes, setQuizzes] = useState([]);

  const handleCreateQuiz = (newQuiz) => {
    const quizWithId = {
      ...newQuiz,
      id: quizzes.length + 1,
      serialNumber: quizzes.length + 1,
      isPrivate: newQuiz.type === "Private",
    };
    setQuizzes([...quizzes, quizWithId]);
    setActiveComponent('QuizTable');
  };

  const navigateToQuizTable = () => {
    setActiveComponent('QuizTable');
  };
  const renderComponent = () => {
    switch (activeComponent) {
      case 'CreateQuiz':
        return <CreateQuiz navigateToQuizTable={navigateToQuizTable} />;
        return <CreateQuiz onCreateQuiz={handleCreateQuiz} />;
      case 'UpcomingQuiz':
        return <UpcomingQuiz />;
      default:
        return <QuizTable quizzes={quizzes} />;
    }
  };

  // Style for active button
  const activeButtonStyle = {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    margin: '5px',
    transition: 'background-color 0.3s ease',
  };

  // Style for inactive button
  const inactiveButtonStyle = {
    backgroundColor: '#f0f0f0',
    color: 'black',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    margin: '5px',
    transition: 'background-color 0.3s ease',
  };
  const hoverStyle = {
    backgroundColor: '#0056b3',
    color: 'white',
  };

  return (
    <div>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
        <button
          style={activeComponent === 'QuizTable' ? activeButtonStyle : inactiveButtonStyle}
          onClick={() => setActiveComponent('QuizTable')}
          onMouseOver={(e) => e.target.style.backgroundColor = hoverStyle.backgroundColor}
          onMouseOut={(e) => e.target.style.backgroundColor = activeComponent === 'QuizTable' ? activeButtonStyle.backgroundColor : inactiveButtonStyle.backgroundColor}
        >
          Show Quiz Table
        </button>
        <button
          style={activeComponent === 'CreateQuiz' ? activeButtonStyle : inactiveButtonStyle}
          onClick={() => setActiveComponent('CreateQuiz')}
          onMouseOver={(e) => e.target.style.backgroundColor = hoverStyle.backgroundColor}
          onMouseOut={(e) => e.target.style.backgroundColor = activeComponent === 'CreateQuiz' ? activeButtonStyle.backgroundColor : inactiveButtonStyle.backgroundColor}
        >
          Create Quiz
        </button>
        {/* <button
          style={activeComponent === 'UpcomingQuiz' ? activeButtonStyle : inactiveButtonStyle}
          onClick={() => setActiveComponent('UpcomingQuiz')}
          onMouseOver={(e) => e.target.style.backgroundColor = hoverStyle.backgroundColor}
          onMouseOut={(e) => e.target.style.backgroundColor = activeComponent === 'UpcomingQuiz' ? activeButtonStyle.backgroundColor : inactiveButtonStyle.backgroundColor}
        >
          Upcoming Quiz
        </button> */}
      </div>
      {renderComponent()}
    </div>
  );
};

export default QuizPanel;