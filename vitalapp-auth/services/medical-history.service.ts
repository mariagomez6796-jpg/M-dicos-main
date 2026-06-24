const API_URL = "/api/v1";

const getAuthHeaders = (method: string = "GET") => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (method === "POST" || method === "PUT") {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  if (response.ok) {
    if (response.status === 204) return {};
    const text = await response.text();
    if (!text) return { message: "Operación exitosa" };
    return JSON.parse(text);
  }
  const errorBody = await response.text();
  try {
    const errorJson = JSON.parse(errorBody);
    throw new Error(errorJson.message || errorJson.detail || "Error en la solicitud");
  } catch {
    throw new Error(errorBody || response.statusText);
  }
};

const getUserId = (): number | null => {
  const userId = localStorage.getItem('user_id');
  if (userId) return parseInt(userId);
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || null;
  } catch {
    return null;
  }
};

export const getPatients = async () => {
  const response = await fetch(`${API_URL}/patient`, {
    method: 'GET',
    headers: getAuthHeaders("GET"),
  });
  return handleResponse(response);
};

export const getDoctorMedicalHistory = async (doctorId: number) => {
  const response = await fetch(`${API_URL}/doctors/${doctorId}/medical-history`, {
    method: 'GET',
    headers: getAuthHeaders("GET"),
  });
  return handleResponse(response);
};

export const getPatientMedicalHistory = async (patientId: number) => {
  const response = await fetch(`${API_URL}/patients/${patientId}/medical-history`, {
    method: 'GET',
    headers: getAuthHeaders("GET"),
  });
  return handleResponse(response);
};

export const createMedicalHistory = async (patientId: number, data: any) => {
  const response = await fetch(`${API_URL}/patients/${patientId}/medical-history`, {
    method: 'POST',
    headers: getAuthHeaders("POST"),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateMedicalHistory = async (historyId: number, data: any) => {
  const response = await fetch(`${API_URL}/medical-history/${historyId}`, {
    method: 'PUT',
    headers: getAuthHeaders("PUT"),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteMedicalHistory = async (historyId: number) => {
  const response = await fetch(`${API_URL}/medical-history/${historyId}`, {
    method: 'DELETE',
    headers: getAuthHeaders("DELETE"),
  });
  return handleResponse(response);
};

export const getPatientAllergies = async (patientId: number) => {
  const response = await fetch(`${API_URL}/patients/${patientId}/allergies`, {
    method: 'GET',
    headers: getAuthHeaders("GET"),
  });
  return handleResponse(response);
};

export const createAllergy = async (patientId: number, data: any) => {
  const response = await fetch(`${API_URL}/patients/${patientId}/allergies`, {
    method: 'POST',
    headers: getAuthHeaders("POST"),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteAllergy = async (allergyId: number) => {
  const response = await fetch(`${API_URL}/allergies/${allergyId}`, {
    method: 'DELETE',
    headers: getAuthHeaders("DELETE"),
  });
  return handleResponse(response);
};

export const getPatientConditions = async (patientId: number) => {
  const response = await fetch(`${API_URL}/patients/${patientId}/conditions`, {
    method: 'GET',
    headers: getAuthHeaders("GET"),
  });
  return handleResponse(response);
};

export const createCondition = async (patientId: number, data: any) => {
  const response = await fetch(`${API_URL}/patients/${patientId}/conditions`, {
    method: 'POST',
    headers: getAuthHeaders("POST"),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteCondition = async (conditionId: number) => {
  const response = await fetch(`${API_URL}/conditions/${conditionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders("DELETE"),
  });
  return handleResponse(response);
};

export const getCompletePatientHistory = async (patientId: number) => {
  const response = await fetch(`${API_URL}/patients/${patientId}/complete-history`, {
    method: 'GET',
    headers: getAuthHeaders("GET"),
  });
  return handleResponse(response);
};

export const getVitalSigns = async (historyId: number) => {
  const response = await fetch(`${API_URL}/medical-history/${historyId}/vital-signs`, {
    method: 'GET',
    headers: getAuthHeaders("GET"),
  });
  return handleResponse(response);
};

export const createVitalSigns = async (historyId: number, data: any) => {
  const response = await fetch(`${API_URL}/medical-history/${historyId}/vital-signs`, {
    method: 'POST',
    headers: getAuthHeaders("POST"),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export { getUserId };
