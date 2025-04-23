// src/Dashboard.js
import React from "react";
import App from "./App";
import "./components/Dashboard.css";

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
            <li>Settings</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1>Military Dashboard</h1>
          <div className="stats-summary">
            <div className="stat-card">
              <h3>Active Personnel</h3>
              <p>50</p>
            </div>
            <div className="stat-card">
              <h3>Inactive Personnel</h3>
              <p>10</p>
            </div>
            <div className="stat-card">
              <h3>Total Reports</h3>
              <p>100</p>
            </div>
          </div>
        </header>

        {/* Dashboard Cards */}
        <div className="dashboard-cards">
          <div className="card">
            <h3>Personnel Overview</h3>
            <p>View detailed personnel info</p>
          </div>
          <div className="card">
            <h3>Mission Reports</h3>
            <p>Quick access to all reports</p>
          </div>
          <div className="card">
            <h3>Settings</h3>
            <p>Manage system settings</p>
          </div>
        </div>

        {/* This renders your personnel form and list */}
        <div className="dashboard-main-area">
          <App />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
