// src/Dashboard.js
import React from "react";
import App from "./App";
import "./components/Dashboard.css"; // ✅ make sure this file exists

function Dashboard() {
  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <img
            src="/lion-de-sarambwe.jpg"
            alt="Lion de Sarambwe Logo"
            className="logo"
          />
          <h2 className="sidebar-title">LION MIS</h2>
        </div>
        <nav className="navigation">
          <ul>
            <li className="active">Personnel</li>
            <li>Reports</li>
            <li>Equipment</li>
            <li>Settings</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1>Military Dashboard</h1>
        </header>

        {/* This renders your personnel form and list */}
        <div className="dashboard-main-area">
          <App />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
