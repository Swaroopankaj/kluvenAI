const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  getConfigs: async () => {
    const res = await fetch(`${API_BASE_URL}/api/configs`);
    return res.json();
  },

  getConfig: async (configId: string) => {
    const res = await fetch(`${API_BASE_URL}/api/config/${configId}`);
    return res.json();
  },

  processDocument: async (file: File, configId: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('config_id', configId);
    const res = await fetch(`${API_BASE_URL}/api/process`, { method: 'POST', body: form });
    return res.json();
  },

  exportCSV: async (data: any, configId: string) => {
    const form = new FormData();
    form.append('data', JSON.stringify(data));
    form.append('config_id', configId);
    const res = await fetch(`${API_BASE_URL}/api/export-csv`, { method: 'POST', body: form });
    return res.json();
  },
};
