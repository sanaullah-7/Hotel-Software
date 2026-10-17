import api from "../api/client.js";

/**
 * Service to communicate with Hotel AI Assistant backend APIs.
 */
export const assistantService = {
  askAssistant: (data) => api.post("/hotel/assistant/chat", data),
  getAssistantSummary: () => api.get("/hotel/assistant/summary"),
  getAssistantSuggestions: () => api.get("/hotel/assistant/suggestions"),
};

export default assistantService;
