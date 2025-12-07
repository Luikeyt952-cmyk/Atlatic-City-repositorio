// src/services/customerService.js
const API_URL = "http://localhost:8000/api/customers/";

export async function createCustomer(data) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // "Authorization": `Bearer ${token}`,  // cuando tengas JWT
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Error al registrar cliente");
  }

  return response.json();
}
