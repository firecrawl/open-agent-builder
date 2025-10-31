/**
 * Example: Custom UI Integration with Workflow Execution
 *
 * This example shows how to integrate workflows into your custom UI
 * using the streaming API endpoint.
 */

// Example 1: Simple Workflow Execution with Fetch API
async function executeWorkflowSimple(workflowId: string, inputs: Record<string, any>) {
  const response = await fetch(`/api/workflows/${workflowId}/execute-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Use Clerk auth (automatic in browser) or API key:
      // 'Authorization': 'Bearer sk_live_YOUR_API_KEY'
    },
    body: JSON.stringify(inputs),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    console.log('Received chunk:', chunk);
  }
}

// Example 2: React Component with Workflow Integration
import { useState } from 'react';

interface WorkflowEvent {
  event: string;
  data: any;
  timestamp: string;
}

function WorkflowExecutorComponent() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [formData, setFormData] = useState({
    url: '',
    keywords: '',
  });

  const executeWorkflow = async () => {
    setIsExecuting(true);
    setEvents([]);

    try {
      const response = await fetch('/api/workflows/amazon-product-research/execute-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('event:')) {
            const eventMatch = line.match(/event:\s*(\w+)/);
            const dataMatch = line.match(/data:\s*(.+)/);

            if (eventMatch && dataMatch) {
              const event = eventMatch[1];
              const data = JSON.parse(dataMatch[1]);

              setEvents((prev) => [
                ...prev,
                {
                  event,
                  data,
                  timestamp: data.timestamp || new Date().toISOString(),
                },
              ]);
            }
          }
        }
      }
    } catch (error) {
      console.error('Workflow execution error:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div>
      <h2>Amazon Product Research</h2>

      <input
        type="text"
        placeholder="Product URL"
        value={formData.url}
        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
      />

      <input
        type="text"
        placeholder="Keywords"
        value={formData.keywords}
        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
      />

      <button onClick={executeWorkflow} disabled={isExecuting}>
        {isExecuting ? 'Executing...' : 'Start Research'}
      </button>

      <div>
        <h3>Execution Log:</h3>
        {events.map((event, index) => (
          <div key={index}>
            <strong>{event.event}</strong>: {JSON.stringify(event.data)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 3: Custom Hook for Workflow Execution
function useWorkflowExecution(workflowId: string) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const execute = async (inputs: Record<string, any>) => {
    setIsExecuting(true);
    setEvents([]);
    setError(null);

    try {
      const response = await fetch(`/api/workflows/${workflowId}/execute-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('event:')) {
            const eventMatch = line.match(/event:\s*(\w+)/);
            const dataMatch = line.match(/data:\s*(.+)/);

            if (eventMatch && dataMatch) {
              const event = eventMatch[1];
              const data = JSON.parse(dataMatch[1]);

              const workflowEvent: WorkflowEvent = {
                event,
                data,
                timestamp: data.timestamp || new Date().toISOString(),
              };

              setEvents((prev) => [...prev, workflowEvent]);

              // Handle specific events
              if (event === 'error') {
                setError(data.error);
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsExecuting(false);
    }
  };

  return { execute, isExecuting, events, error };
}

// Example 4: Using the Custom Hook
function MyCustomForm() {
  const { execute, isExecuting, events, error } = useWorkflowExecution('stock-analysis');
  const [ticker, setTicker] = useState('AAPL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    execute({ ticker });
  };

  // Get the latest completed result
  const latestResult = events
    .filter((e) => e.event === 'node_completed')
    .pop()?.data?.result?.output;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        placeholder="Stock Ticker"
      />
      <button type="submit" disabled={isExecuting}>
        {isExecuting ? 'Analyzing...' : 'Analyze Stock'}
      </button>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {latestResult && (
        <div>
          <h3>Analysis Result:</h3>
          <pre>{JSON.stringify(latestResult, null, 2)}</pre>
        </div>
      )}

      {/* Show execution progress */}
      <div>
        {events.map((event, i) => (
          <div key={i}>
            {event.event === 'node_started' && `⏳ ${event.data.nodeName}`}
            {event.event === 'node_completed' && `✅ ${event.data.nodeName}`}
            {event.event === 'node_failed' && `❌ ${event.data.nodeName}`}
          </div>
        ))}
      </div>
    </form>
  );
}

// Example 5: Non-Streaming Execution (Simpler, but no real-time updates)
async function executeWorkflowNonStreaming(workflowId: string, inputs: Record<string, any>) {
  // Note: This endpoint requires passing the full workflow definition
  // You'd need to fetch it first from Convex
  const response = await fetch(`/api/workflows/${workflowId}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: inputs,
      workflow: {
        // Full workflow definition here
        // You can fetch this from Convex using the workflows.getWorkflow query
      },
    }),
  });

  const result = await response.json();
  return result;
}

// Example 6: External API Call with API Key
async function executeWorkflowExternal(workflowId: string, inputs: Record<string, any>, apiKey: string) {
  const response = await fetch(`https://your-domain.com/api/workflows/${workflowId}/execute-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(inputs),
  });

  // Process SSE stream...
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  const events: WorkflowEvent[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n\n');

    for (const line of lines) {
      if (line.startsWith('event:')) {
        const eventMatch = line.match(/event:\s*(\w+)/);
        const dataMatch = line.match(/data:\s*(.+)/);

        if (eventMatch && dataMatch) {
          events.push({
            event: eventMatch[1],
            data: JSON.parse(dataMatch[1]),
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
  }

  return events;
}

// Example 7: Python Client (for external integrations)
/*
import requests
import json

def execute_workflow_python(workflow_id: str, inputs: dict, api_key: str):
    url = f"https://your-domain.com/api/workflows/{workflow_id}/execute-stream"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    with requests.post(url, json=inputs, headers=headers, stream=True) as response:
        for line in response.iter_lines():
            if line:
                line = line.decode('utf-8')
                if line.startswith('event:'):
                    event = line.split(':', 1)[1].strip()
                elif line.startswith('data:'):
                    data = json.loads(line.split(':', 1)[1].strip())
                    print(f"{event}: {data}")

# Usage
execute_workflow_python(
    workflow_id="amazon-product-research",
    inputs={"url": "https://amazon.com/product/123", "keywords": "laptop"},
    api_key="sk_live_YOUR_API_KEY"
)
*/

export {
  executeWorkflowSimple,
  WorkflowExecutorComponent,
  useWorkflowExecution,
  MyCustomForm,
  executeWorkflowNonStreaming,
  executeWorkflowExternal,
};
