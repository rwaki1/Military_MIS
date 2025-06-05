import React, { useState, useEffect } from "react";
import "./App.css";
import AddPersonnelForm from "./components/AddPersonnelForm";
import PersonnelCard from "./components/PersonnelCard";
import axios from "axios";

function App() {
  const [personnelList, setPersonnelList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRegion, setFilterRegion] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [showStatusCount, setShowStatusCount] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  // Dropdown data
  const [grades, setGrades] = useState([]);
  const [roles, setRoles] = useState([]);
  const [regions, setRegions] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch personnel list
        const personnelRes = await axios.get(`${process.env.REACT_APP_API_URL}/personnel`);
        const updatedPersonnel = personnelRes.data.map((p) => ({
          ...p,
          photoURL: p.photo ? `${process.env.REACT_APP_API_URL}/uploads/${p.photo}` : null,
          grade: p.grade_name || p.grade || "",
          role: p.role_name || p.role || "",
          region: p.region_name || p.region || "",
          region_id: p.region_id || null,
          brigade: p.brigade_name || p.brigade || "",
          battalion: p.battalion_name || p.battalion || "",
        }));
        setPersonnelList(updatedPersonnel);

        setActiveCount(updatedPersonnel.filter((p) => p.status === "Active").length);
        setInactiveCount(updatedPersonnel.filter((p) => p.status === "Inactive").length);

        // Fetch dropdown data (only grades, roles, and regions)
        const [gradesRes, rolesRes, regionsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/grades`),
          axios.get(`${process.env.REACT_APP_API_URL}/roles`),
          axios.get(`${process.env.REACT_APP_API_URL}/regions`),
        ]);

        setGrades(gradesRes.data || []);
        setRoles(rolesRes.data || []);
        setRegions(regionsRes.data || []);

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddPersonnel = (newPerson) => {
    const photoURL = newPerson.photo ? `${process.env.REACT_APP_API_URL}/uploads/${newPerson.photo}` : null;
    const updatedList = [...personnelList, { ...newPerson, photoURL }];
    setPersonnelList(updatedList);

    setActiveCount(updatedList.filter((p) => p.status === "Active").length);
    setInactiveCount(updatedList.filter((p) => p.status === "Inactive").length);
  };

  // Filter personnel list
  const filteredList = personnelList.filter((person) => {
    const searchLower = searchTerm.toLowerCase();

    const nameMatches = person.name?.toLowerCase().includes(searchLower) || false;
    const gradeMatches = person.grade?.toLowerCase().includes(searchLower) || false;
    const statusMatches = !filterStatus || person.status === filterStatus;
    const regionMatches = !filterRegion || person.region_id === parseInt(filterRegion, 10);

    return (nameMatches || gradeMatches) && statusMatches && regionMatches;
  });

  const PersonnelList = ({ personnelList, viewMode }) => {
    if (viewMode === "table") {
      return (
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
            {personnelList.map((person, index) => (
              <tr key={index}>
                <td>{person.name}</td>
                <td>{person.grade}</td>
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
      );
    }

    // Card view
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-around",
        }}
      >
        {personnelList.map((person, index) => (
          <PersonnelCard key={index} person={person} />
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="logo-container">
          <img src="/lion-de-sarambwe.jpg" alt="Lion de Sarambwe Logo" className="logo" />
          <span className="logo-text">LION DE SARAMBWE MIS</span>
        </div>
      </header>

      <AddPersonnelForm
        onAdd={handleAddPersonnel}
        grades={grades}
        roles={roles}
        regions={regions}
        isLoading={isLoading}
      />

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

        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            marginLeft: "10px",
          }}
        >
          <option value="">Select Region</option>
          {regions.length === 0 ? (
            <option value="">No regions available</option>
          ) : (
            regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.region_name || region.name}
              </option>
            ))
          )}
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
        <button onClick={() => setShowStatusCount((prev) => !prev)} className="view-button">
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
        <PersonnelList personnelList={filteredList} viewMode={viewMode} />
      </div>
    </div>
  );
}

export default App;
