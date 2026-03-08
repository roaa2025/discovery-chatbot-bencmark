// Manual Code Node Template for n8n Data_Discovery Workflow
// Use this if you prefer to add the Code node manually in n8n UI
// Replace CONTEXT_NODE_NAME and SQL_NODE_NAME with actual node names from your workflow

export const CODE_NODE_TEMPLATE = `
// Merge context item with SQL results
// Get context item from CONTEXT_NODE_NAME node
const ctx = $items("CONTEXT_NODE_NAME", 0, 0)[0].json;

// Get SQL results from SQL_NODE_NAME node
const rows = $items("SQL_NODE_NAME", 0, 0).map(i => i.json);

// Merge: keep all context fields, add retrieved_data to meta_data
return [{
  json: {
    ...ctx,
    meta_data: {
      ...(ctx.meta_data || {}),
      retrieved_data: rows,
    },
  },
}];
`;

// Instructions for manual setup:
// 1. Open Data_Discovery workflow in n8n
// 2. Identify the node that outputs context (intent_agent, conversational_agent_output, chat_id, input, meta_data)
// 3. Identify the Execute SQL node
// 4. Add a Code node after the SQL node
// 5. Set mode to "Run once for each item"
// 6. Replace CONTEXT_NODE_NAME and SQL_NODE_NAME in the code above with actual node names
// 7. Paste the code into the Code node
// 8. Connect: SQL node -> Code node -> next node (if any)

