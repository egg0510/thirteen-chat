import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  timeout: 20000,
});

export const llm = {
  chat: (body: { model: string; mode?: 'chat'|'code'; params?: any; messages: { role: 'user'|'assistant'|'system'; content: string }[]; personaId?: string; vad?: { valence:number; arousal:number; dominance:number } }) =>
    api.post('/llm/chat', body),
};

export const personasApi = {
  list: () => api.get('/personas'),
  updateTemplate: (id: string, payload: { before: string; after: string; reason?: string }) => api.post(`/learning/template/preview`, { persona_id: id, ...payload }),
  commitTemplate: (editId: string) => api.post(`/learning/template/commit`, { edit_id: editId }),
};

export const pluginsApi = {
  run: (name: string, event: string, context: any) => api.post(`/plugins/${name}/execute`, { event, context }),
};

export const secretsApi = {
  save: (payload: { endpoint: string; key: string; model: string }) => api.post('/secrets/save', payload),
  test: () => api.post('/secrets/test', {}),
};
