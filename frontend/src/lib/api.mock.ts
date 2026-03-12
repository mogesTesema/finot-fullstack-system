// ============================================
// MOCK API
// ============================================

export const api = {
  async getServiceGroups() {
    return Promise.resolve(serviceGroups);
  },

  async getServiceGroupById(id: string) {
    const group = serviceGroups.find((g) => g.id === id);
    if (!group) throw new Error("Group not found");
    return Promise.resolve(group);
  },

  async getUserSelection() {
    return Promise.resolve([]);
  },
};
