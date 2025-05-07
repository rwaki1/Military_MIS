import React, { useState, useEffect } from "react";
import "./App.css";
import AddPersonnelForm from "./components/AddPersonnelForm";
import PersonnelCard from "./components/PersonnelCard";
import axios from "axios";

function App() {
  const [personnelList, setPersonnelList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [viewMode, setViewMode] = useState("table"); // Default to table view
  const [showStatusCount, setShowStatusCount] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/personnel")
      .then((res) => {
        const updated = res.data.map((p) => ({
          ...p,
          photoURL: p.photo ? `http://localhost:5000/uploads/${p.photo}` : null,
        }));
        setPersonnelList(updated);

        const active = updated.filter((p) => p.status === "Active").length;
        const inactive = updated.filter((p) => p.status === "Inactive").length;
        setActiveCount(active);
        setInactiveCount(inactive);
      })
      .catch((err) => {
        console.error("Error fetching personnel:", err.message);
      });
  }, []);

  const handleAddPersonnel = (newPerson) => {
    const photoURL = newPerson.photo
      ? `http://localhost:5000/uploads/${newPerson.photo}`
      : null;
    setPersonnelList([...personnelList, { ...newPerson, photoURL }]);
  };

  const filteredList = personnelList.filter((person) => {
    const nameMatches =
      person.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const gradeMatches =
      person.grade?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const statusMatches =
      !filterStatus || person.status === filterStatus;

    return (nameMatches || gradeMatches) && statusMatches;
  });

  return (
    <div className="dashboard-container">
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

      <AddPersonnelForm onAdd={handleAddPersonnel} />

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <input
          type="text"
          placeholder="Search by name or grade"
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

      <div className="button-container" style={{ marginTop: "20px" }}>
        <button
          onClick={() => setViewMode("table")}
          className={`view-button ${viewMode === "table" ? "active" : ""}`}
        >
          Table View
        </button>
        <button
          onClick={() => setViewMode("cards")}
          className={`view-button ${viewMode === "cards" ? "active" : ""}`}
        >
          Card View
        </button>
        <button
          onClick={() => setShowStatusCount((prev) => !prev)}
          className="view-button"
        >
          {showStatusCount ? "Hide Status Count" : "Show Status Count"}
        </button>
      </div>

      {showStatusCount && (
        <div className="status-count" style={{ textAlign: "center", marginTop: "20px" }}>
          <h3>Status Count</h3>
          <p>Active Personnel: {activeCount}</p>
          <p>Inactive Personnel: {inactiveCount}</p>
        </div>
      )}

      <div className="personnel-list">
        <h2>Personnel List</h2>

        {viewMode === "table" ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Grade</th>
                <th>Status</th>
                <th>Date of Birth</th>
                <th>Role</th>
                <th>Region</th>
                <th>Brigade</th>
                <th>Battalion</th>
                <th>Weapon SN</th>
                <th>Radio SN</th>
                <th>Photo</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((person, index) => (
                <tr key={index}>
                  <td>{person.name}</td>
                  <td>{person.grade}</td>
                  <td>
                    <span
                      style={{
                        color:
                          person.status === "Active"
                            ? "#2ecc71"
                            : "#e74c3c",
                        fontWeight: "bold",
                      }}
                    >
                      {person.status}
                    </span>
                  </td>
                  <td>{person.date_of_birth}</td>
                  <td>{person.role}</td>
                  <td>{person.region}</td>
                  <td>{person.brigade}</td>
                  <td>{person.battalion}</td>
                  <td>{person.weapon_serial_number}</td>
                  <td>{person.radio_serial_number}</td>
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
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            {filteredList.map((person, index) => (
              <PersonnelCard key={index} person={person} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
