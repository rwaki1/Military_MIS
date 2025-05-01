import React, { useState } from "react";

function AddPersonnelForm({ onAdd }) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState(""); // Changed from rank to grade
  const [status, setStatus] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [armyNumber, setArmyNumber] = useState("");
  const [photo, setPhoto] = useState(null);

  // Assignment fields
  const [role, setRole] = useState("");
  const [region, setRegion] = useState("");
  const [brigade, setBrigade] = useState("");
  const [battalion, setBattalion] = useState("");
  const [weaponSerialNumber, setWeaponSerialNumber] = useState("");
  const [radioSerialNumber, setRadioSerialNumber] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("grade", grade); // Corrected from rank to grade
    formData.append("status", status);
    formData.append("date_of_birth", dateOfBirth);
    formData.append("army_number", armyNumber);
    formData.append("photo", photo);

    // Assignment data
    formData.append("role", role);
    formData.append("region", region);
    formData.append("brigade", brigade);
    formData.append("battalion", battalion);
    formData.append("weapon_serial_number", weaponSerialNumber);
    formData.append("radio_serial_number", radioSerialNumber);

    try {
      const response = await fetch("http://localhost:5000/api/personnel", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to add personnel and assignment");
      }

      const data = await response.json();
      onAdd(data); // Notify parent component about the success

      // Reset form fields after successful submission
      setName("");
      setGrade(""); // Reset grade field
      setStatus("");
      setDateOfBirth("");
      setArmyNumber("");
      setPhoto(null);
      setRole("");
      setRegion("");
      setBrigade("");
      setBattalion("");
      setWeaponSerialNumber("");
      setRadioSerialNumber("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      <h2>Add New Personnel</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name: </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Grade: </label>
          <input
            type="text"
            value={grade} // Corrected from rank to grade
            onChange={(e) => setGrade(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Status: </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label>Date of Birth: </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Army Number: </label>
          <input
            type="text"
            value={armyNumber}
            onChange={(e) => setArmyNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Role: </label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Region: </label>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </div>
        <div>
          <label>Brigade: </label>
          <input
            type="text"
            value={brigade}
            onChange={(e) => setBrigade(e.target.value)}
          />
        </div>
        <div>
          <label>Battalion: </label>
          <input
            type="text"
            value={battalion}
            onChange={(e) => setBattalion(e.target.value)}
          />
        </div>
        <div>
          <label>Weapon Serial #: </label>
          <input
            type="text"
            value={weaponSerialNumber}
            onChange={(e) => setWeaponSerialNumber(e.target.value)}
          />
        </div>
        <div>
          <label>Radio Serial #: </label>
          <input
            type="text"
            value={radioSerialNumber}
            onChange={(e) => setRadioSerialNumber(e.target.value)}
          />
        </div>
        <div>
          <label>Photo: </label>
          <input
            type="file"
            onChange={(e) => setPhoto(e.target.files[0])}
            accept="image/*"
          />
        </div>
        <button type="submit">Add Personnel</button>
      </form>
    </div>
  );
}

export default AddPersonnelForm;
