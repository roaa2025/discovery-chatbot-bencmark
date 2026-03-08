export interface ChatRequest {
  user_id?: number;
  userId?: number;
  message: string;
  content?: string;
  thread_id?: number;
  threadId?: number;
  chat_id?: number;
  chatId?: number;
}

export interface IntentAgent {
  raw_query?: string;
  query_intent?: string;
  reasoning?: string;
  measures?: any[];
  data_asset_type_request?: any;
  visualization_requested?: boolean;
  visualization_type_bias?: any;
  keywords?: string[];
}

export interface ConversationalAgentOutput {
  output_message?: string;
  is_instruction?: boolean;
  is_data_rout?: boolean;
  is_intent_agent?: boolean;
  is_search?: boolean;
  is_summary_agent?: boolean;
  summary_input?: any;
  intent_updated_to_search?: any;
}

export interface ChatResponse {
  chat_id?: number;
  message_id?: number;
  role?: string;
  message_text?: string;
  metadata?: {
    conversational_agent_output?: ConversationalAgentOutput;
    intent_agent?: IntentAgent;
    retrieved_data?: any[];
    summary_agent_output?: any;
    suggested_questions?: string[];
    [key: string]: any;
  };
}

export interface SavedResponse {
  id: string;
  timestamp: string;
  request: ChatRequest;
  response: ChatResponse;
  branch: string;
  outputContract: any;
}

export type BranchType = 'intent' | 'nl2sql' | 'conversation' | 'summary' | 'unknown';

