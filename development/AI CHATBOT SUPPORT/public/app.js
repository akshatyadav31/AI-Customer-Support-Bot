document.addEventListener('DOMContentLoaded', () => {
  const chatMessages = document.getElementById('chat-messages');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');
  
  // Generate a random session ID
  const sessionId = Math.random().toString(36).substring(2, 15);
  
  // Function to add a message to the chat
  function addMessage(content, isUser = false, needsEscalation = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    if (needsEscalation) {
      messageContent.classList.add('escalation');
    }
    messageContent.textContent = content;
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Function to send message to API
  async function sendMessage(message) {
    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          message
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        addMessage(data.response, false, data.needsEscalation);
      } else {
        addMessage(`Sorry, there was an error: ${data.message}`, false, true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('Sorry, there was an error connecting to the server.', false, true);
    }
  }
  
  // Event listeners
  sendButton.addEventListener('click', () => {
    const message = userInput.value.trim();
    if (message) {
      addMessage(message, true);
      sendMessage(message);
      userInput.value = '';
    }
  });
  
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const message = userInput.value.trim();
      if (message) {
        addMessage(message, true);
        sendMessage(message);
        userInput.value = '';
      }
    }
  });
});