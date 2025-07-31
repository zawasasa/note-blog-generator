export enum AppState {
  IDLE,
  PROCESSING_FILE,
  AWAITING_TITLE_APPROVAL,
  AWAITING_LENGTH_SELECTION,
  AWAITING_REFERENCE_URL,
  GENERATING_ARTICLE,
  COMPLETED,
  ERROR,
}

export interface ArticleSection {
  title: string;
  description: string;
}

export interface LengthSuggestion {
  length: number;
  description: string;
  reason: string;
}