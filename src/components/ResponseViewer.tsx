import type { ChatResponse } from '../types';
import { detectBranch, getBranchLabel } from '../utils/branchDetector';

interface ResponseViewerProps {
  response: ChatResponse | null;
}

export default function ResponseViewer({ response }: ResponseViewerProps) {
  if (!response) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        color: '#999'
      }}>
        <p>No response yet. Send a message to see the results.</p>
      </div>
    );
  }

  const branch = detectBranch(response);
  const branchLabel = getBranchLabel(branch);
  const finalResponse = response.message_text || 'No response text';
  const outputContract = response.metadata || {};

  const getBranchColor = (branch: string) => {
    switch (branch) {
      case 'intent':
        return '#2196f3';
      case 'nl2sql':
        return '#4caf50';
      case 'conversation':
        return '#ff9800';
      case 'summary':
        return '#9c27b0';
      default:
        return '#757575';
    }
  };

  return (
    <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600' }}>
          Response Details
        </h2>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '10px' 
        }}>
          <h3 style={{ margin: '0 10px 0 0', fontSize: '16px', fontWeight: '600' }}>
            Branch Executed:
          </h3>
          <span style={{
            padding: '4px 12px',
            borderRadius: '12px',
            backgroundColor: getBranchColor(branch),
            color: 'white',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {branchLabel}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600' }}>
          Final Response:
        </h3>
        <div style={{
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          whiteSpace: 'pre-wrap',
          lineHeight: '1.6',
          fontSize: '14px'
        }}>
          {finalResponse}
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600' }}>
          Output Contract (Metadata):
        </h3>
        <div style={{
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          overflow: 'auto',
          maxHeight: '500px'
        }}>
          <pre style={{
            margin: '0',
            fontSize: '12px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {JSON.stringify(outputContract, null, 2)}
          </pre>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600' }}>
          Response Metadata:
        </h3>
        <div style={{
          padding: '15px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          fontSize: '14px'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Chat ID:</strong> {response.chat_id || 'N/A'}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Message ID:</strong> {response.message_id || 'N/A'}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Role:</strong> {response.role || 'N/A'}
          </div>
          {outputContract.conversational_agent_output && (
            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
              <strong>Conversational Agent Output:</strong>
              <pre style={{
                marginTop: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {JSON.stringify(outputContract.conversational_agent_output, null, 2)}
              </pre>
            </div>
          )}
          {outputContract.intent_agent && (
            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #ddd' }}>
              <strong>Intent Agent:</strong>
              <pre style={{
                marginTop: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {JSON.stringify(outputContract.intent_agent, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

