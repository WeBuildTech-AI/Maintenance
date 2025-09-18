import { projectId, publicAnonKey } from './supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9d2931f1`;

class ApiClient {
  private getAuthHeaders(token?: string) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || publicAnonKey}`,
    };
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Auth methods
  async signup(userData: { email: string; password: string; name: string; role?: string; department?: string }) {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  // Work Orders
  async getWorkOrders(token?: string) {
    const response = await fetch(`${BASE_URL}/workorders`, {
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async createWorkOrder(workOrder: any, token: string) {
    const response = await fetch(`${BASE_URL}/workorders`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(workOrder),
    });
    return this.handleResponse(response);
  }

  async updateWorkOrder(id: string, updates: any, token: string) {
    const response = await fetch(`${BASE_URL}/workorders/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(updates),
    });
    return this.handleResponse(response);
  }

  // Assets
  async getAssets(token?: string) {
    const response = await fetch(`${BASE_URL}/assets`, {
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async createAsset(asset: any, token: string) {
    const response = await fetch(`${BASE_URL}/assets`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(asset),
    });
    return this.handleResponse(response);
  }

  // Inventory
  async getInventory(token?: string) {
    const response = await fetch(`${BASE_URL}/inventory`, {
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async createInventoryItem(item: any, token: string) {
    const response = await fetch(`${BASE_URL}/inventory`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(item),
    });
    return this.handleResponse(response);
  }

  // Tickets/Helpdesk
  async getTickets(token?: string) {
    const response = await fetch(`${BASE_URL}/tickets`, {
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async createTicket(ticket: any, token: string) {
    const response = await fetch(`${BASE_URL}/tickets`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(ticket),
    });
    return this.handleResponse(response);
  }

  // Calibrations
  async getCalibrations(token?: string) {
    const response = await fetch(`${BASE_URL}/calibrations`, {
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async createCalibration(calibration: any, token: string) {
    const response = await fetch(`${BASE_URL}/calibrations`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(calibration),
    });
    return this.handleResponse(response);
  }

  // Logbook
  async getLogbookEntries(token?: string) {
    const response = await fetch(`${BASE_URL}/logbook`, {
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  async createLogbookEntry(entry: any, token: string) {
    const response = await fetch(`${BASE_URL}/logbook`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(entry),
    });
    return this.handleResponse(response);
  }

  // Health check
  async healthCheck() {
    const response = await fetch(`${BASE_URL}/health`);
    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient();