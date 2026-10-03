import {
  User,
  SingleAnalysisResponse,
  FeedbackRecord,
  Dataset,
  BatchResults,
  DashboardMetrics,
  InsightsData,
  ModelInfo,
  EvaluationRecord,
  ReportItem,
  NotificationItem,
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('sentinel_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An unexpected error occurred.';
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errData.message || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }): Promise<{ access_token: string; user: User }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(data: { name: string; email: string; password: string }): Promise<{ access_token: string; user: User }> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe(): Promise<User> {
    return request('/auth/me');
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Single Analysis
  async analyzeText(text: string): Promise<SingleAnalysisResponse> {
    return request('/analyze', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async getAnalysisHistory(): Promise<SingleAnalysisResponse[]> {
    return request('/analyze/history');
  },

  // Batch Datasets
  async uploadDataset(file: File): Promise<Dataset> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = getAuthHeader();

    const response = await fetch(`${API_BASE}/datasets/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return response.json();
  },

  async triggerBatchAnalysis(datasetId: number): Promise<{ message: string; status: string; progress: number }> {
    return request(`/datasets/${datasetId}/analyze`, { method: 'POST' });
  },

  async getDatasetStatus(datasetId: number): Promise<{ id: number; name: string; status: string; progress: number; row_count: number }> {
    return request(`/datasets/${datasetId}/status`);
  },

  async getBatchResults(datasetId: number): Promise<BatchResults> {
    return request(`/datasets/${datasetId}/results`);
  },

  async listDatasets(): Promise<Dataset[]> {
    return request('/datasets');
  },

  async deleteDataset(datasetId: number): Promise<{ message: string }> {
    return request(`/datasets/${datasetId}`, { method: 'DELETE' });
  },

  // Feedback Explorer
  async getFeedback(params: Record<string, any> = {}): Promise<{ total: number; page: number; limit: number; total_pages: number; records: FeedbackRecord[] }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') {
        query.append(k, String(v));
      }
    });
    return request(`/feedback?${query.toString()}`);
  },

  async getFeedbackFilters(): Promise<{ sources: string[]; categories: string[]; emotions: string[]; sentiments: string[] }> {
    return request('/feedback/filters');
  },

  async getFeedbackRecord(id: number): Promise<FeedbackRecord> {
    return request(`/feedback/${id}`);
  },

  // Dashboard Metrics
  async getDashboardMetrics(range = '30d'): Promise<DashboardMetrics> {
    return request(`/dashboard/metrics?range=${range}`);
  },

  // Insights
  async getInsights(): Promise<InsightsData> {
    return request('/insights');
  },

  // Trends
  async getTrends(filters: Record<string, string> = {}): Promise<{
    timeline: any[];
    emotion_timeline: any[];
    aspect_trends: any[];
    anomalies: any[];
  }> {
    const query = new URLSearchParams(filters).toString();
    return request(`/trends?${query}`);
  },

  // Models & Evaluation
  async getModels(): Promise<{ models: ModelInfo[]; active_model_id: string; recent_evaluations: EvaluationRecord[] }> {
    return request('/models');
  },

  async evaluateModelFile(file: File, modelName: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_name', modelName);
    const headers = getAuthHeader();

    const response = await fetch(`${API_BASE}/models/evaluate`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Evaluation failed' }));
      throw new Error(err.detail || 'Evaluation failed');
    }
    return response.json();
  },

  // Reports
  async createReport(title: string, datasetId?: number): Promise<ReportItem> {
    return request('/reports', {
      method: 'POST',
      body: JSON.stringify({ title, dataset_id: datasetId }),
    });
  },

  async listReports(): Promise<ReportItem[]> {
    return request('/reports');
  },

  async getReport(id: number): Promise<ReportItem> {
    return request(`/reports/${id}`);
  },

  // Settings
  async getSettings(): Promise<any> {
    return request('/settings');
  },

  async clearAnalysisHistory(): Promise<{ message: string }> {
    return request('/settings/clear-history', { method: 'POST' });
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return request('/notifications');
  },

  async markNotificationRead(id: number): Promise<void> {
    await request(`/notifications/${id}/read`, { method: 'POST' });
  },

  async markAllNotificationsRead(): Promise<void> {
    await request('/notifications/read-all', { method: 'POST' });
  },
};
