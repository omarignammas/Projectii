import api from './api';

export const focusRoomService = {
  async getAllRooms({
    page = 1,
    size = 20,
    sortField = 'createdAt',
    direction = 'DESC',
  } = {}) {
    const response = await api.get('/focus-rooms', {
      params: { page, size, sortField, direction },
    });
    return response.data;
  },

  async getRoomByCode(code) {
    const response = await api.get(`/focus-rooms/${code}`);
    return response.data;
  },

  async createRoom(roomData) {
    const response = await api.post('/focus-rooms', roomData);
    return response.data;
  },

  async joinRoom(code) {
    const response = await api.post(`/focus-rooms/${code}/join`);
    return response.data;
  },

  async rematchRoom(code) {
    const response = await api.post(`/focus-rooms/${code}/rematch`);
    return response.data;
  },

  async inviteToRoom(code, userId) {
    const response = await api.post(`/focus-rooms/${code}/invite`, { userId });
    return response.data;
  },

  async getSessionReport(code) {
    const response = await api.get(`/focus-rooms/${code}/report`);
    return response.data;
  },
};

export default focusRoomService;
