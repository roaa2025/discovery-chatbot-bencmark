// n8n API service for programmatic workflow and node creation
// Uses n8n REST API with API key authentication

export interface N8nWorkflow {
  id?: string;
  name: string;
  nodes: N8nNode[];
  connections: Record<string, any>;
  active?: boolean;
  settings?: Record<string, any>;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters?: Record<string, any>;
  credentials?: Record<string, any>;
}

// Get n8n base URL and API key from environment variables
const N8N_BASE_URL = import.meta.env.VITE_N8N_BASE_URL || 'https://realsoftapps.com/n8n';
const N8N_API_KEY = import.meta.env.VITE_N8N_API_KEY || '';

// Helper function to make authenticated API requests
async function n8nApiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!N8N_API_KEY) {
    throw new Error('N8N_API_KEY is not configured. Please set VITE_N8N_API_KEY in your environment variables.');
  }

  const url = `${N8N_BASE_URL}/api/v1${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': N8N_API_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `n8n API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

// Get all workflows
export async function getWorkflows(): Promise<N8nWorkflow[]> {
  const response = await n8nApiRequest<{ data: N8nWorkflow[] }>('/workflows');
  return response.data || [];
}

// Get a specific workflow by ID
export async function getWorkflow(workflowId: string): Promise<N8nWorkflow> {
  const response = await n8nApiRequest<{ data: N8nWorkflow }>(`/workflows/${workflowId}`);
  return response.data;
}

// Create a new workflow
export async function createWorkflow(workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
  const response = await n8nApiRequest<{ data: N8nWorkflow }>('/workflows', {
    method: 'POST',
    body: JSON.stringify(workflow),
  });
  return response.data;
}

// Update an existing workflow
export async function updateWorkflow(
  workflowId: string,
  workflow: Partial<N8nWorkflow>
): Promise<N8nWorkflow> {
  const response = await n8nApiRequest<{ data: N8nWorkflow }>(`/workflows/${workflowId}`, {
    method: 'PUT',
    body: JSON.stringify(workflow),
  });
  return response.data;
}

// Activate a workflow
export async function activateWorkflow(workflowId: string): Promise<void> {
  await n8nApiRequest(`/workflows/${workflowId}/activate`, {
    method: 'POST',
  });
}

// Deactivate a workflow
export async function deactivateWorkflow(workflowId: string): Promise<void> {
  await n8nApiRequest(`/workflows/${workflowId}/activate`, {
    method: 'POST',
    body: JSON.stringify({ active: false }),
  });
}

// Create a workflow with nodes
export async function createWorkflowWithNodes(
  name: string,
  nodes: N8nNode[],
  connections: Record<string, any> = {},
  active: boolean = false
): Promise<N8nWorkflow> {
  const workflow: Partial<N8nWorkflow> = {
    name,
    nodes,
    connections,
    active,
  };

  return createWorkflow(workflow);
}

// Add a node to an existing workflow
export async function addNodeToWorkflow(
  workflowId: string,
  node: N8nNode
): Promise<N8nWorkflow> {
  const workflow = await getWorkflow(workflowId);
  
  const updatedNodes = [...(workflow.nodes || []), node];
  
  return updateWorkflow(workflowId, {
    ...workflow,
    nodes: updatedNodes,
  });
}

// Helper function to create a webhook node
export function createWebhookNode(
  name: string,
  path: string,
  httpMethod: string = 'POST',
  position: [number, number] = [250, 300]
): N8nNode {
  return {
    id: `webhook-${Date.now()}`,
    name,
    type: 'n8n-nodes-base.webhook',
    typeVersion: 1,
    position,
    parameters: {
      httpMethod,
      path,
      responseMode: 'responseNode',
      options: {},
    },
  };
}

// Helper function to create an HTTP Request node
export function createHttpRequestNode(
  name: string,
  url: string,
  method: string = 'POST',
  position: [number, number] = [450, 300]
): N8nNode {
  return {
    id: `http-request-${Date.now()}`,
    name,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.1,
    position,
    parameters: {
      url,
      method,
      options: {},
    },
  };
}

// Helper function to create a Set node (for data transformation)
export function createSetNode(
  name: string,
  values: Record<string, any>,
  position: [number, number] = [650, 300]
): N8nNode {
  return {
    id: `set-${Date.now()}`,
    name,
    type: 'n8n-nodes-base.set',
    typeVersion: 3.2,
    position,
    parameters: {
      values: {
        string: Object.entries(values).map(([key, value]) => ({
          name: key,
          value: String(value),
        })),
      },
      options: {},
    },
  };
}

// Helper function to create connections between nodes
export function createConnection(
  fromNode: string,
  toNode: string,
  _outputIndex: number = 0,
  inputIndex: number = 0
): Record<string, any> {
  return {
    [fromNode]: {
      main: [[{ node: toNode, type: 'main', index: inputIndex }]],
    },
  };
}

// Get workflow by name
export async function getWorkflowByName(name: string): Promise<N8nWorkflow | null> {
  const workflows = await getWorkflows();
  return workflows.find(w => w.name === name) || null;
}

// Helper function to create a Code node
export function createCodeNode(
  name: string,
  code: string,
  position: [number, number] = [650, 300],
  mode: 'runOnceForAllItems' | 'runOnceForEachItem' = 'runOnceForEachItem'
): N8nNode {
  return {
    id: `code-${Date.now()}`,
    name,
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position,
    parameters: {
      jsCode: code,
      mode,
    },
  };
}

