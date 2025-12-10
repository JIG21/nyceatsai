import React from 'react';
import NeonButton from './components/NeonButton';
import NeonLoader from './components/NeonLoader';

const App: React.FC = () => (
  <div className="app-root">
    <header className="header">
      <div className="logo">
        <div className="mark">NY</div>
        <div>
          <h1 className="neon-heading">NycEatsAI</h1>
          <div className="neon-text">Futuristic demo</div>
        </div>
      </div>
      <NeonButton variant="primary">Get Started</NeonButton>
    </header>

    <main className="main">
      <section className="glass-card">
        <h2 className="neon-heading">Welcome</h2>
        <p>Placeholder app wrapper. Replace with your pages or import real app.</p>
        <NeonLoader label="Initializing..." />
      </section>
    </main>

    <footer className="footer">© {new Date().getFullYear()} NycEatsAI</footer>
  </div>
);

export default App;
