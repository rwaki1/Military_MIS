import React, { useState } from 'react';

function AddPersonnelForm({ onAdd }) {
  const [name, setName] = useState('');
  const [rank, setRank] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState(''); // Added state for role
  const [armyNumber, setArmyNumber] = useState(''); // Added state for army number
  const [photo, setPhoto] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('rank', rank);
    formData.append('status', status);
    formData.append('role', role);  // Append role field to form data
    formData.append('army_number', armyNumber);  // Append army_number field to form data
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      const response = await fetch('http://localhost:5000/api/personnel', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add personnel');
      }

      const data = await response.json();
      onAdd(data); // Assuming 'onAdd' function is being used to update the UI with new personnel
      setName('');
      setRank('');
      setStatus('');
      setRole('');
      setArmyNumber('');
      setPhoto(null);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center', margin: '20px' }}>
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
          <label>Rank: </label>
          <input
            type="text"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            required
          />
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
          <label>Role: </label> {/* New field for role */}
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)} // Handle role state change
            required
          />
        </div>
        <div>
          <label>Army Number: </label> {/* New field for army number */}
          <input
            type="text"
            value={armyNumber}
            onChange={(e) => setArmyNumber(e.target.value)} // Handle army number state change
            required
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
