// Script to update Data_Discovery workflow with Code node that merges context and SQL results
// This script analyzes the workflow structure and adds/updates the merge Code node

import {
  getWorkflowByName,
  updateWorkflow,
  createCodeNode,
  N8nWorkflow,
  N8nNode,
} from './n8nService';

// Find the node that outputs context (contains intent_agent, conversational_agent_output, etc.)
function findContextNode(nodes: N8nNode[]): N8nNode | null {
  // Look for nodes that might contain context data
  // Common patterns: Set node, Function node, or nodes before SQL execution
  // We'll need to inspect the workflow to identify this
  // For now, return null and let the analysis function handle it
  return null;
}

// Find the Execute SQL node
function findSqlNode(nodes: N8nNode[]): N8nNode | null {
  return nodes.find(node => 
    node.type === 'n8n-nodes-base.postgres' || 
    node.type === 'n8n-nodes-base.mysql' ||
    node.type === 'n8n-nodes-base.mssql' ||
    node.name.toLowerCase().includes('sql') ||
    node.name.toLowerCase().includes('execute')
  ) || null;
}

// Find existing Code node that might be doing the merge
function findMergeCodeNode(nodes: N8nNode[]): N8nNode | null {
  return nodes.find(node => 
    node.type === 'n8n-nodes-base.code' &&
    (node.parameters?.jsCode?.includes('retrieved_data') || 
     node.parameters?.jsCode?.includes('meta_data'))
  ) || null;
}

// Analyze workflow to identify context node by examining connections
function analyzeWorkflowStructure(workflow: N8nWorkflow): {
  contextNodeName: string | null;
  sqlNodeName: string | null;
  existingCodeNode: N8nNode | null;
  sqlNodePosition: [number, number] | null;
} {
  const sqlNode = findSqlNode(workflow.nodes);
  const existingCodeNode = findMergeCodeNode(workflow.nodes);
  
  // Find context node by tracing connections backwards from SQL node
  // The context node is the one that outputs intent_agent, conversational_agent_output, chat_id, input, meta_data
  let contextNodeName: string | null = null;
  
  if (sqlNode && workflow.connections) {
    // Find which node connects to the SQL node (this should be the context node)
    for (const [nodeId, connections] of Object.entries(workflow.connections)) {
      if (connections.main && Array.isArray(connections.main)) {
        for (const outputConnections of connections.main) {
          if (Array.isArray(outputConnections)) {
            for (const conn of outputConnections) {
              if (conn.node === sqlNode.id) {
                const sourceNode = workflow.nodes.find(n => n.id === nodeId);
                if (sourceNode) {
                  // This is likely the context node (the one feeding into SQL)
                  // It should be the node that contains intent_agent, conversational_agent_output, etc.
                  contextNodeName = sourceNode.name;
                  break;
                }
              }
            }
          }
        }
      }
      if (contextNodeName) break;
    }
  }
  
  // If we couldn't find it via connections, look for nodes with common context-related names
  // or nodes that might contain the context data (Set nodes, Function nodes, etc.)
  if (!contextNodeName) {
    const contextCandidates = workflow.nodes.filter(node =>
      node.name.toLowerCase().includes('context') ||
      node.name.toLowerCase().includes('set') ||
      node.name.toLowerCase().includes('prepare') ||
      node.name.toLowerCase().includes('merge') ||
      node.name.toLowerCase().includes('intent') ||
      node.name.toLowerCase().includes('agent')
    );
    
    if (contextCandidates.length > 0) {
      // Prefer nodes that come before SQL node in the flow
      // If SQL node position is known, find the closest node before it
      if (sqlNode?.position) {
        const beforeSql = contextCandidates
          .filter(n => n.position && n.position[0] < sqlNode.position[0])
          .sort((a, b) => (b.position?.[0] || 0) - (a.position?.[0] || 0));
        if (beforeSql.length > 0) {
          contextNodeName = beforeSql[0].name;
        }
      }
      
      // Fallback to first candidate
      if (!contextNodeName) {
        contextNodeName = contextCandidates[0].name;
      }
    }
  }
  
  return {
    contextNodeName: contextNodeName || null,
    sqlNodeName: sqlNode?.name || null,
    existingCodeNode: existingCodeNode || null,
    sqlNodePosition: sqlNode?.position || null,
  };
}

// Generate Code node JavaScript code
function generateMergeCode(contextNodeName: string, sqlNodeName: string): string {
  return `// Merge context item with SQL results
// Get context item from ${contextNodeName} node
const ctx = $items("${contextNodeName}", 0, 0)[0].json;

// Get SQL results from ${sqlNodeName} node
const rows = $items("${sqlNodeName}", 0, 0).map(i => i.json);

// Merge: keep all context fields, add retrieved_data to meta_data
return [{
  json: {
    ...ctx,
    meta_data: {
      ...(ctx.meta_data || {}),
      retrieved_data: rows,
    },
  },
}];`;
}

// Main function to update the workflow
export async function updateDataDiscoveryWorkflow(): Promise<N8nWorkflow> {
  console.log('Fetching Data_Discovery workflow...');
  const workflow = await getWorkflowByName('Data_Discovery');
  
  if (!workflow || !workflow.id) {
    throw new Error('Data_Discovery workflow not found. Please ensure the workflow exists and is accessible.');
  }
  
  console.log('Analyzing workflow structure...');
  const analysis = analyzeWorkflowStructure(workflow);
  
  if (!analysis.sqlNodeName) {
    throw new Error('Could not find Execute SQL node in the workflow. Please ensure the SQL node exists.');
  }
  
  if (!analysis.contextNodeName) {
    throw new Error('Could not identify context node. Please check the workflow structure.');
  }
  
  console.log(`Found SQL node: ${analysis.sqlNodeName}`);
  console.log(`Found context node: ${analysis.contextNodeName}`);
  
  // Generate the merge code
  const mergeCode = generateMergeCode(analysis.contextNodeName, analysis.sqlNodeName);
  
  // Calculate position for Code node (right after SQL node)
  const codeNodePosition: [number, number] = analysis.sqlNodePosition 
    ? [analysis.sqlNodePosition[0] + 250, analysis.sqlNodePosition[1]]
    : [650, 300];
  
  let updatedNodes: N8nNode[];
  let updatedConnections: Record<string, any>;
  
  if (analysis.existingCodeNode) {
    // Update existing Code node
    console.log('Updating existing Code node...');
    updatedNodes = workflow.nodes.map(node => {
      if (node.id === analysis.existingCodeNode!.id) {
        return {
          ...node,
          parameters: {
            ...node.parameters,
            jsCode: mergeCode,
            mode: 'runOnceForEachItem',
          },
        };
      }
      return node;
    });
    updatedConnections = workflow.connections;
  } else {
    // Create new Code node
    console.log('Creating new Code node...');
    const codeNode = createCodeNode('Merge Context with SQL Results', mergeCode, codeNodePosition, 'runOnceForEachItem');
    updatedNodes = [...workflow.nodes, codeNode];
    
    // Update connections: SQL node -> Code node -> next node (if any)
    updatedConnections = { ...workflow.connections };
    
    // Find what comes after SQL node
    const sqlNode = workflow.nodes.find(n => n.name === analysis.sqlNodeName);
    if (sqlNode) {
      // Connect SQL node to Code node
      if (!updatedConnections[sqlNode.id]) {
        updatedConnections[sqlNode.id] = { main: [] };
      }
      if (!updatedConnections[sqlNode.id].main[0]) {
        updatedConnections[sqlNode.id].main[0] = [];
      }
      
      // Check if SQL node already has connections (to preserve them)
      const existingConnections = updatedConnections[sqlNode.id]?.main?.[0] || [];
      
      // Add connection to Code node
      updatedConnections[sqlNode.id].main[0] = [
        ...existingConnections,
        { node: codeNode.id, type: 'main', index: 0 },
      ];
      
      // If there was a node after SQL, we might need to connect Code node to it
      // This depends on the workflow structure - user may need to adjust manually
    }
  }
  
  // Update the workflow
  console.log('Updating workflow...');
  const updatedWorkflow = await updateWorkflow(workflow.id, {
    ...workflow,
    nodes: updatedNodes,
    connections: updatedConnections,
  });
  
  console.log('Workflow updated successfully!');
  console.log(`Code node ${analysis.existingCodeNode ? 'updated' : 'created'} with merge logic.`);
  console.log(`Context node: ${analysis.contextNodeName}`);
  console.log(`SQL node: ${analysis.sqlNodeName}`);
  
  return updatedWorkflow;
}

// Export a function to just get the analysis (for debugging)
export async function analyzeDataDiscoveryWorkflow(): Promise<{
  workflow: N8nWorkflow | null;
  analysis: ReturnType<typeof analyzeWorkflowStructure>;
}> {
  const workflow = await getWorkflowByName('Data_Discovery');
  if (!workflow) {
    return { workflow: null, analysis: { contextNodeName: null, sqlNodeName: null, existingCodeNode: null, sqlNodePosition: null } };
  }
  const analysis = analyzeWorkflowStructure(workflow);
  return { workflow, analysis };
}

