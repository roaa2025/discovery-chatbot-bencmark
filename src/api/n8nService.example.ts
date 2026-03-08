// Example usage of n8nService
// This file demonstrates how to use the n8n API service to create workflows and nodes

import {
  createWorkflowWithNodes,
  createWebhookNode,
  createHttpRequestNode,
  createSetNode,
  createConnection,
  addNodeToWorkflow,
  activateWorkflow,
  getWorkflows,
} from './n8nService';

// Example 1: Create a simple workflow with a webhook and HTTP request node
export async function createSimpleWebhookWorkflow() {
  const webhookNode = createWebhookNode(
    'Webhook',
    '/webhook-test/my-webhook-id',
    'POST',
    [250, 300]
  );

  const httpNode = createHttpRequestNode(
    'HTTP Request',
    'https://api.example.com/endpoint',
    'POST',
    [450, 300]
  );

  const connections = {
    ...createConnection(webhookNode.id, httpNode.id),
  };

  const workflow = await createWorkflowWithNodes(
    'My New Workflow',
    [webhookNode, httpNode],
    connections,
    false // inactive by default
  );

  console.log('Created workflow:', workflow);
  return workflow;
}

// Example 2: Add a node to an existing workflow
export async function addNodeToExistingWorkflow(workflowId: string) {
  const setNode = createSetNode(
    'Transform Data',
    { key1: 'value1', key2: 'value2' },
    [650, 300]
  );

  const updatedWorkflow = await addNodeToWorkflow(workflowId, setNode);
  console.log('Updated workflow:', updatedWorkflow);
  return updatedWorkflow;
}

// Example 3: Create a workflow and activate it
export async function createAndActivateWorkflow() {
  const workflow = await createSimpleWebhookWorkflow();
  
  if (workflow.id) {
    await activateWorkflow(workflow.id);
    console.log('Workflow activated');
  }
  
  return workflow;
}

// Example 4: List all workflows
export async function listAllWorkflows() {
  const workflows = await getWorkflows();
  console.log('All workflows:', workflows);
  return workflows;
}

