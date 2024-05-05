import React from 'react';

import './input.css';

const Input = ({ setMessage, sendMessage, message }) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage(event);
    }
  };

  const handleChange = (event) => {
    setMessage(event.target.value);
  };

  return (
    <form className="form">
      <input
        className="input"
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button className="sendButton" onClick={(e) => sendMessage(e)}>
        Send
      </button>
    </form>
  );
};

export default Input;
