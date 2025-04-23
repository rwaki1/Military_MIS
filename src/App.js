// src/App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import AddPersonnelForm from "./components/AddPersonnelForm";
import axios from "axios";

function App() {
  const [personnelList, setPersonnelList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // 🔄 Fetch personnel from the backend on first load
  useEffect(() => {
    axios.get("http://localhost:5000/api/personnel")
      .then((res) => {
        const updated = res.data.map((p) => ({
          ...p,
          photoURL: p.photo ? `http://localhost:5000/uploads/${p.photo}` : null,
        }));
        setPersonnelList(updated);
      })
      .catch((err) => {
        console.error("Error fetching personnel:", err.message);
      });
  }, []);

  const handleAddPersonnel = (newPerson) => {
    const photoURL = newPerson.photo ? `http://localhost:5000/uploads/${newPerson.photo}` : null;
    setPersonnelList([
      ...personnelList,
      { ...newPerson, photoURL },
    ]);
  };

  const filteredList = personnelList.filter((person) => {
    const nameMatches =
      person.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const rankMatches =
      person.rank?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const statusMatches =
      !filterStatus || person.status === filterStatus;

    return (nameMatches || rankMatches) && statusMatches;
  });

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <img
            src="/lion-de-sarambwe.jpg"
            alt="Lion de Sarambwe Logo"
            className="logo"
          />
          <span className="logo-text">LION DE SARAMBWE MIS</span>
        </div>
      </header>

      {/* Add Form */}
      <AddPersonnelForm onAdd={handleAddPersonnel} />

      {/* Search + Filter */}
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <input
          type="text"
          placeholder="Search by name or rank"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px",
            width: "220px",
            marginRight: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Personnel List */}
      <div className="personnel-list">
        <h2>Personnel List</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Rank</th>
              <th>Status</th>
              <th>Role</th> {/* Added Role column */}
              <th>Army Number</th> {/* Added Army Number column */}
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((person, index) => (
              <tr key={index}>
                <td>{person.name}</td>
                <td>{person.rank}</td>
                <td>
                  <span
                    style={{
                      color: person.status === "Active" ? "#2ecc71" : "#e74c3c",
                      fontWeight: "bold",
                    }}
                  >
                    {person.status}
                  </span>
                </td>
                <td>{person.role}</td> {/* Display role */}
                <td>{person.army_number}</td> {/* Display army number */}
                <td>
                  {person.photoURL ? (
                    <img
                      src={person.photoURL}
                      alt="Profile"
                      style={{
                        borderRadius: "50%",
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    "No Photo"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
