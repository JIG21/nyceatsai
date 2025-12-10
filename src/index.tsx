import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/futuristic.css";

// Mount the aurora and grid-overlay at the top-level so it appears behind everything.
const rootEl = document.getElementById("root")!;
const root = createRoot(rootEl);

root.render(
  <React.StrictMode>
    <div className="futuristic-aurora" aria-hidden="true" />
    <div className="grid-overlay" aria-hidden="true" />
    <div className="app-shell">
      <App />
    </div>
  </React.StrictMode>
);
