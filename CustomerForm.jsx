// src/components/CustomerForm.jsx
import { useState } from "react";
import { createCustomer } from "../services/customerService";

export default function CustomerForm() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    document_type: "DNI",
    document_number: "",
    email: "",
    phone: "",
    birth_date: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await createCustomer(formData);
      setMessage("Cliente registrado correctamente ✅");
      // limpiar formulario
      setFormData({
        first_name: "",
        last_name: "",
        document_type: "DNI",
        document_number: "",
        email: "",
        phone: "",
        birth_date: "",
      });
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Registro de Cliente</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombres:</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Apellidos:</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Tipo Documento:</label>
          <select
            name="document_type"
            value={formData.document_type}
            onChange={handleChange}
          >
            <option value="DNI">DNI</option>
            <option value="CE">CE</option>
            <option value="PAS">PASAPORTE</option>
          </select>
        </div>

        <div>
          <label>N° Documento:</label>
          <input
            type="text"
            name="document_number"
            value={formData.document_number}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Correo:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Teléfono:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Fecha de nacimiento:</label>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Registrar Cliente"}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

