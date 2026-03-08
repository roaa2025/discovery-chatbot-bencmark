// Simple script to run the workflow update
// This can be executed from browser console or imported in a component

import { updateDataDiscoveryWorkflow, analyzeDataDiscoveryWorkflow } from './updateDataDiscoveryWorkflow';

// Run the update (uncomment to execute)
export async function runUpdate() {
  try {
    console.log('Starting workflow update...');
    const result = await updateDataDiscoveryWorkflow();
    console.log('Update successful!', result);
    return result;
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
}

// Analyze workflow without updating (for inspection)
export async function analyzeWorkflow() {
  try {
    const result = await analyzeDataDiscoveryWorkflow();
    console.log('Workflow analysis:', result);
    return result;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}

// Make functions available globally for browser console usage
if (typeof window !== 'undefined') {
  (window as any).updateDataDiscoveryWorkflow = runUpdate;
  (window as any).analyzeDataDiscoveryWorkflow = analyzeWorkflow;
}

