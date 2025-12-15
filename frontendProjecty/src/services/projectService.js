import api from './api';

export const projectService = {
  async getAllProjects({
    page = 1,
    size = 10,
    sortField = 'id',
    direction = 'ASC',
  } = {}) {
    const response = await api.get('/projects', {
      params: {
        page,
        size,
        sortField,
        direction,
      },
    });

    return response.data; 
  },

  async getProjectById(projectId) {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  async createProject(projectData) {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  async updateProject(projectId, projectData) {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  async deleteProject(projectId) {
    await api.delete(`/projects/${projectId}`);
  },

  async getProjectProgress(projectId) {
    const response = await api.get(`/projects/${projectId}/progress`);
    return response.data;
  },
};

export default projectService;