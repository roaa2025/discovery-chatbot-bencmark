import type { ChatResponse, BranchType } from '../types';

export function detectBranch(response: ChatResponse): BranchType {
  const conversationalOutput = response.metadata?.conversational_agent_output;
  
  if (!conversationalOutput) {
    return 'unknown';
  }
  
  if (conversationalOutput.is_summary_agent) {
    return 'summary';
  }
  
  if (conversationalOutput.is_search) {
    return 'nl2sql';
  }
  
  if (conversationalOutput.is_intent_agent) {
    return 'intent';
  }
  
  return 'conversation';
}

export function getBranchLabel(branch: BranchType): string {
  const labels: Record<BranchType, string> = {
    intent: 'Intent Discovery',
    nl2sql: 'NL2SQL / Data Search',
    conversation: 'Conversation',
    summary: 'Summary Agent',
    unknown: 'Unknown',
  };
  
  return labels[branch];
}

