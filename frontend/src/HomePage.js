import React, { useState } from 'react';

const HomePage = () => {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleStartSession = () => {
    setSessionStarted(true);
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h1>Home Page</h1>
      {!sessionStarted ? (
        <button onClick={handleStartSession}>Start Session</button>
      ) : (
        <div>
          <label htmlFor="prompt">Type your prompt:</label>
          <input
            id="prompt"
            type="text"
            value={prompt}
            onChange={handlePromptChange}
            style={{ width: '100%', marginTop: '1rem' }}
            placeholder="Enter your prompt here"
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;import React, { useState } from 'react';

const HomePage = () => {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleStartSession = () => {
    setSessionStarted(true);
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async () => {
    // Replace with your backend API endpoint
    const res = await fetch('/api/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setResponse(data.reply);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h1>Home Page</h1>
      {!sessionStarted ? (
        <button onClick={handleStartSession}>Start Session</button>
      ) : (
        <div>
          <label htmlFor="prompt">Type your prompt:</label>
          <input
            id="prompt"
            type="text"
            value={prompt}
            onChange={handlePromptChange}
            style={{ width: '100%', marginTop: '1rem' }}
            placeholder="Enter your prompt here"
          />
          <button onClick={handleSubmit} style={{ marginTop: '1rem' }}>
            Submit
          </button>
          {response && (
            <div style={{ marginTop: '1rem' }}>
              <strong>Response:</strong> {response}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;