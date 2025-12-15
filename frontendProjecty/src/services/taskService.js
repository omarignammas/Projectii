import api from './api';

export const taskService = {
  async getAllTasks(projectId, {
    page = 1,
    size = 10,
    sortField = 'id',
    direction = 'ASC',
  } = {}) {
    const response = await api.get(`/projects/${projectId}/tasks`, {
      params: {
        page,
        size,
        sortField,
        direction,
      },
    });
    return response.data; 
  },
  
  async getTaskById(projectId, taskId) {
    const response = await api.get(`/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },

  async createTask(projectId, taskData) {
    const response = await api.post(`/projects/${projectId}/tasks`, taskData);
    return response.data;
  },

  async updateTask(projectId, taskId, taskData) {
    const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, taskData);
    return response.data;
  },

  async markTaskCompleted(projectId, taskId) {
    const response = await api.put(`/projects/${projectId}/tasks/${taskId}/complete`);
    return response.data;
  },

  async deleteTask(projectId, taskId) {
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
  },
};

export default taskService;