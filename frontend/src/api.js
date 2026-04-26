import axios from 'axios';

const API_BASE_URL = 'https://fairlens-backend-813365924560.us-central1.run.app/api';

// Get or create a unique user ID for history isolation
let userId = localStorage.getItem('fairlens_user_id');
if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('fairlens_user_id', userId);
}

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'X-User-ID': userId
    }
});

export const runAudit = async (formData) => {
    const response = await api.post('/audit', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getAuditHistory = async () => {
    const response = await api.get('/history');
    return response.data;
};

export const getAuditDetails = async (id) => {
    const response = await api.get(`/audit/${id}`);
    return response.data;
};

export const getSampleUrl = (type) => `${API_BASE_URL}/sample/${type}`;

export default api;
