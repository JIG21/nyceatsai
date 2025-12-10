// Top-level integration: import the futuristic theme and render App
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/futuristic.css';

// Note: add to your index.html for stronger display:
// <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <div className="app-shell">
      <div className="futuristic-aurora" aria-hidden="true"/>
      <div className="container">
        <App />
      </div>
    </div>
  </React.StrictMode>
);