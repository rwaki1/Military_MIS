import React, { useState, useEffect } from "react";

function AddPersonnelForm({ onAdd, grades, roles, regions }) {
  // Form states
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [status, setStatus] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [armyNumber, setArmyNumber] = useState("");
  const [photo, setPhoto] = useState(null);

  const [role, setRole] = useState("");
  const [region, setRegion] = useState("");
  const [brigade, setBrigade] = useState("");
  const [battalion, setBattalion] = useState("");

  const [brigades, setBrigades] = useState([]);
  const [battalions, setBattalions] = useState([]);

  const [weaponSerialNumber, setWeaponSerialNumber] = useState("");
  const [radioSerialNumber, setRadioSerialNumber] = useState("");

  // Fetch brigades when region changes
  useEffect(() => {
    if (!region) {
      setBrigades([]);
      setBrigade("");
      setBattalions([]);
      setBattalion("");
      return;
    }

    fetch(`http://localhost:5000/api/brigades?region_id=${region}`)
      .then((res) => res.json())
      .then((data) => {
        setBrigades(data);
        setBrigade("");
        setBattalions([]);
        setBattalion("");
      })
      .catch((err) => {
        console.error("Failed to fetch brigades", err);
        setBrigades([]);
      });
  }, [region]);

  // Fetch battalions when brigade changes
  useEffect(() => {
    if (!brigade) {
      setBattalions([]);
      setBattalion("");
      return;
    }

    fetch(`http://localhost:5000/api/battalions?brigade_id=${brigade}`)
      .then((res) => res.json())
      .then((data) => {
        setBattalions(data);
        setBattalion("");
      })
      .catch((err) => {
        console.error("Failed to fetch battalions", err);
        setBattalions([]);
      });
  }, [brigade]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("grade_id", grade);
    formData.append("status", status);
    formData.append("date_of_birth", dateOfBirth);
    formData.append("army_number", armyNumber);
    if (photo) formData.append("photo", photo);
    formData.append("role_id", role);
    formData.append("region_id", region);
    formData.append("brigade_id", brigade);
    formData.append("battalion_id", battalion);
    formData.append("weapon_serial_number", weaponSerialNumber);
    formData.append("radio_serial_number", radioSerialNumber);

    console.log("📤 Submitting form with values:", {
      name,
      grade,
      status,
      dateOfBirth,
      armyNumber,
      role,
      region,
      brigade,
      battalion,
      weaponSerialNumber,
      radioSerialNumber,
    });

    try {
      const response = await fetch("http://localhost:5000/api/personnel", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to add personnel");
      }

      const data = await response.json();
      onAdd(data);

      // Reset form
      setName("");
      setGrade("");
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
      setBrigades([]);
      setBattalions([]);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      <h2>Add New Personnel</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name: </label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <label>Grade: </label>
          <select value={String(grade)} onChange={(e) => setGrade(e.target.value)} required>
            <option value="">Select Grade</option>
            {grades.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.grade_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Status: </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} required>
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label>Date of Birth: </label>
          <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
        </div>

        <div>
          <label>Army Number: </label>
          <input type="text" value={armyNumber} onChange={(e) => setArmyNumber(e.target.value)} required />
        </div>

        <div>
          <label>Role: </label>
          <select value={String(role)} onChange={(e) => setRole(e.target.value)} required>
            <option value="">Select Role</option>
            {roles.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.role_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Region: </label>
          <select value={String(region)} onChange={(e) => setRegion(e.target.value)} required>
            <option value="">Select Region</option>
            {regions.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.region_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Brigade: </label>
          <select value={String(brigade)} onChange={(e) => setBrigade(e.target.value)} required>
            <option value="">Select Brigade</option>
            {brigades.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.brigade_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Battalion: </label>
          <select value={String(battalion)} onChange={(e) => setBattalion(e.target.value)} required>
            <option value="">Select Battalion</option>
            {battalions.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.battalion_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Weapon Serial #: </label>
          <input type="text" value={weaponSerialNumber} onChange={(e) => setWeaponSerialNumber(e.target.value)} />
        </div>

        <div>
          <label>Radio Serial #: </label>
          <input type="text" value={radioSerialNumber} onChange={(e) => setRadioSerialNumber(e.target.value)} />
        </div>

        <div>
          <label>Photo: </label>
          <input type="file" onChange={(e) => setPhoto(e.target.files[0])} accept="image/*" />
        </div>

        <button type="submit">Add Personnel</button>
      </form>
    </div>
  );
}

export default AddPersonnelForm;
