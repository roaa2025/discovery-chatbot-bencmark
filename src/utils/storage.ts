import type { SavedResponse } from '../types';

const STORAGE_KEY = 'discovery_chatbot_responses';

export function saveResponse(response: SavedResponse): void {
  const saved = getSavedResponses();
  saved.unshift(response);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

export function getSavedResponses(): SavedResponse[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function clearSavedResponses(): void {
  localStorage.removeItem(STORAGE_KEY);
}

