import React, { useState } from "react";
import "../style/Booking.css";

const Booking = () => {
  const [formData, setFormData] = useState({
    name: "",
    car: "",
    date: "",
    duration: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Booking berhasil untuk ${formData.name}`);
  };

  return (
    <div className="booking-container">
      <h2>Form Booking Mobil</h2>
      <form className="booking-form" onSubmit={handleSubmit}>
        <label>Nama Penyewa:</label>
        <input
          type="text"
          name="name"
          placeholder="Masukkan nama Anda"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Pilih Mobil:</label>
        <select name="car" value={formData.car} onChange={handleChange} required>
          <option value="">-- Pilih Mobil --</option>
          <option value="Toyota Avanza">Toyota Avanza</option>
          <option value="Honda Jazz">Honda Jazz</option>
          <option value="Mitsubishi Pajero">Mitsubishi Pajero</option>
        </select>

        <label>Tanggal Sewa:</label>
        <input type="date" name="date" value={formData.date} onChange={handleChange} required />

        <label>Durasi (Hari):</label>
        <input type="number" name="duration" min="1" value={formData.duration} onChange={handleChange} required />

        <button type="submit">Pesan Sekarang</button>
      </form>
    </div>
  );
};

export default Booking;
