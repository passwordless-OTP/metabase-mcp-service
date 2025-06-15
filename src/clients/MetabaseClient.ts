import axios, { AxiosInstance } from 'axios';

interface MetabaseClientConfig {
  baseUrl: string;
  apiKey: string;
}

export class MetabaseClient {
  private client: AxiosInstance;

  constructor(private config: MetabaseClientConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'X-API-Key': config.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  async executeQuery(query: any) {
    const response = await this.client.post('/api/dataset', query);
    return response.data;
  }

  async createCard(card: any) {
    const response = await this.client.post('/api/card', card);
    return response.data;
  }

  async createDashboard(dashboard: any) {
    const response = await this.client.post('/api/dashboard', dashboard);
    return response.data;
  }

  async getDatabases() {
    const response = await this.client.get('/api/database');
    return response.data;
  }

  async getDatabase(id: number) {
    const response = await this.client.get(`/api/database/${id}`);
    return response.data;
  }

  async getDatabaseMetadata(id: number) {
    const response = await this.client.get(`/api/database/${id}/metadata`);
    return response.data;
  }
}