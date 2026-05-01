import { useState } from 'react';
import './App.css';

function App() {
  const [requirements, setRequirements] = useState('');
  const [status, setStatus] = useState('idle');
  const [generatedFile, setGeneratedFile] = useState('');
  const [prototypeUrl, setPrototypeUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading_xml');

    try {
      const response = await fetch('http://localhost:5000/api/generate-xml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawRequirements: requirements }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedFile(data.file); // Save the file name we got back
        setStatus('xml_success');
      } else {
        setStatus('idle');
        alert("Something went wrong on the server!");
      }
    } catch (error) {
      console.error(error);
      setStatus('idle');
      alert("Failed to connect to the backend.");
    }
  };

  const handleBuildPrototype = async () => {
    setStatus('building_prototype');

    try {
      const response = await fetch('http://localhost:5000/api/build-prototype', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: generatedFile }),
      });

      const data = await response.json();

      if (response.ok) {
        setPrototypeUrl(data.url);
        setStatus('prototype_ready');
      } else {
        setStatus('xml_success');
        alert("Failed to build the prototype.");
      }
    } catch (error) {
      console.error(error);
      setStatus('xml_success');
      alert("Backend connection failed during build.");
    }
  };

  // UI States
  if (status === 'loading_xml') {
    return <div className="card"><h2>🛠️ Generating Architecture XML...</h2></div>;
  }

  if (status === 'xml_success') {
    return (
      <div className="card">
        <h2>✅ Specifications Generated!</h2>
        <p>Your XML file ({generatedFile}) is ready for the Execution Engine.</p>
        <button onClick={handleBuildPrototype} style={{ marginTop: '20px', backgroundColor: '#4CAF50', color: 'white', padding: '15px', fontSize: '18px' }}>
          🚀 Test My Prototype
        </button>
      </div>
    );
  }

  if (status === 'building_prototype') {
    return <div className="card"><h2>⚙️ Engine is building your codebase...</h2><p>Please wait while the server spins up.</p></div>;
  }

  if (status === 'prototype_ready') {
    return (
      <div className="card">
        <h2>🎉 Prototype is Live!</h2>
        <p>Your system has been successfully compiled and deployed locally.</p>
        <a href={prototypeUrl} target="_blank" rel="noopener noreferrer">
          <button style={{ marginTop: '20px', padding: '15px', fontSize: '18px' }}>
            Open Prototype in New Tab
          </button>
        </a>
        <br />
        <button onClick={() => setStatus('idle')} style={{ marginTop: '20px', background: 'transparent', border: '1px solid white' }}>
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h1>Rapid Prototyping System</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="e.g., I want a hospital management system..."
          rows="8" required
        />
        <button type="submit" style={{ padding: '12px' }}>Generate Architecture</button>
      </form>
    </div>
  );
}

export default App;