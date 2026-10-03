export type SentimentType = 'positive' | 'neutral' | 'negative';

export type EmotionType = 
  | 'Joy' 
  | 'Trust' 
  | 'Anger' 
  | 'Sadness' 
  | 'Fear' 
  | 'Surprise' 
  | 'Disgust' 
  | 'Satisfied' 
  | 'Frustrated'
  | 'Neutral';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  dark_mode: boolean;
  ai_provider: string;
  created_at: string;
}

export interface AspectResult {
  aspect: string;
  sentiment: SentimentType;
  confidence: number;
  evidence?: string;
}

export interface KeywordResult {
  word: string;
  weight: number;
  count?: number;
}

export interface EvidenceResult {
  phrase: string;
  highlight: string;
  signal: 'positive' | 'negative' | 'neutral';
  weight: number;
  explanation: string;
}

export interface SingleAnalysisResponse {
  id?: number;
  text: string;
  sentiment: SentimentType;
  sentiment_confidence: number;
  emotion: EmotionType;
  emotion_confidence: number;
  aspects: AspectResult[];
  keywords: KeywordResult[];
  evidence: EvidenceResult[];
  created_at?: string;
}

export interface FeedbackRecord {
  id: number;
  dataset_id: number;
  text: string;
  date?: string;
  source: string;
  category: string;
  sentiment: SentimentType;
  confidence: number;
  emotion: EmotionType;
  emotion_confidence?: number;
  dominant_aspect?: string;
  aspect_confidence?: number;
  created_at: string;
}

export interface Dataset {
  id: number;
  name: string;
  filename: string;
  row_count: number;
  status: 'pending' | 'processing' | 'ready' | 'error';
  progress: number;
  detected_columns: {
    text_column?: string;
    date_column?: string;
    source_column?: string;
    category_column?: string;
  };
  created_at: string;
}

export interface BatchResults {
  dataset_id: number;
  dataset_name: string;
  total_records: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  average_confidence: number;
  dominant_emotion: EmotionType;
  top_aspect: string;
  sentiment_distribution: Array<{ name: string; value: number; percentage: number; color: string }>;
  emotion_distribution: Array<{ emotion: string; count: number; percentage: number }>;
  category_distribution: Array<{ category: string; count: number; positive: number; negative: number }>;
  sentiment_over_time: Array<{ date: string; positive: number; neutral: number; negative: number; volume: number }>;
  top_positive_topics: Array<{ topic: string; mentions: number; share: number }>;
  top_negative_topics: Array<{ topic: string; mentions: number; share: number }>;
}

export interface DashboardMetrics {
  total_feedback: number;
  total_trend: string;
  positive_rate: number;
  positive_trend: string;
  negative_rate: number;
  negative_trend: string;
  neutral_rate: number;
  average_confidence: number;
  dominant_emotion: EmotionType;
  top_aspect: string;
  sentiment_distribution: Array<{ name: string; value: number; percentage: number; color: string }>;
  sentiment_trend: Array<{ date: string; positive: number; neutral: number; negative: number; volume: number }>;
  emotion_distribution: Array<{ emotion: string; count: number; percentage: number; color: string }>;
  top_topics: Array<{ topic: string; mentions: number; positive_pct: number; negative_pct: number }>;
  recent_feedback: FeedbackRecord[];
}

export interface InsightItem {
  type: string;
  badge: string;
  title: string;
  description: string;
  impact: string;
  metric: string;
  trend: string;
}

export interface ExecutiveSummary {
  overall_sentiment: string;
  major_positive_themes: string[];
  major_negative_themes: string[];
  emerging_issues: string[];
  actionable_recommendations: string[];
}

export interface InsightsData {
  has_enough_data: boolean;
  sample_size: number;
  message?: string;
  insights: InsightItem[];
  executive_summary?: ExecutiveSummary;
}

export interface ModelInfo {
  id: string;
  name: string;
  task: string;
  framework: string;
  status: string;
  latency: string;
  description: string;
  benchmark_status: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  parameters: string;
}

export interface EvaluationRecord {
  id: number;
  model_name: string;
  dataset_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: {
    classes: string[];
    matrix: Array<{ actual: string; predicted_negative: number; predicted_neutral: number; predicted_positive: number }>;
  };
  test_samples: number;
  created_at: string;
}

export interface ReportItem {
  id: number;
  title: string;
  summary: string;
  positive_themes: string[];
  negative_themes: string[];
  emerging_issues: string[];
  metrics_json: any;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  created_at: string;
}
