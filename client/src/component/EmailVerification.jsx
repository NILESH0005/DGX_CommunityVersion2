import React, { useState } from 'react';
import PropTypes from 'prop-types';

const EmailVerification = ({ onEmailSubmit }) => {
  const [email, setEmail] = useState('');

  const handleEmailSubmit = (event) => {
    event.preventDefault();
    onEmailSubmit(email);
  };

  return (
    <form onSubmit={handleEmailSubmit} className="w-full">
      <div className="mb-4">
        <input
          type="email"
          placeholder="Email"
          className="border border-DGXgreen py-2 px-3 w-full rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <button type="submit" className="w-full text-lg bg-DGXgreen hover:bg-[#1d4ed8] rounded-full py-3 text-center font-medium text-DGXwhite">
          Verify Email
        </button>
      </div>
    </form>
  );
};

EmailVerification.propTypes = {
  onEmailSubmit: PropTypes.func.isRequired,
};

export default EmailVerification;
