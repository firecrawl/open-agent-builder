import { WorkflowNode, WorkflowState } from '../types';
import { getServerAPIKeys } from '@/lib/api/config';

/**
 * Execute Finnhub API requests
 */
export async function executeFinnhubRequest(
  node: WorkflowNode,
  state: WorkflowState
): Promise<any> {
  const nodeData = node.data as any;
  console.log('🖥️ MCP executor running Finnhub API');

  const apiKeys = getServerAPIKeys();
  if (!apiKeys.finnhub) {
    throw new Error('FINNHUB_API_KEY not configured. Add it to your .env.local file:\nFINNHUB_API_KEY=your_api_key_here');
  }

  // Get the action from the node data
  const action = nodeData.mcpAction;
  if (!action) {
    throw new Error('No Finnhub action specified');
  }

  // Build the URL for the specific Finnhub endpoint
  const baseUrl = 'https://finnhub.io/api/v1';
  let endpoint = '';
  const queryParams = new URLSearchParams();
  queryParams.append('token', apiKeys.finnhub);

  // Get input from node data or state
  const input = nodeData.input || state.variables?.input || state.variables?.lastOutput;

  // Configure endpoint and params based on action
  switch (action) {
    case 'quote':
      endpoint = '/quote';
      queryParams.append('symbol', nodeData.symbol || input);
      break;
    case 'company_profile2':
      endpoint = '/stock/profile2';
      queryParams.append('symbol', nodeData.symbol || input);
      break;
    case 'symbol_search':
      endpoint = '/search';
      queryParams.append('q', nodeData.query || input);
      break;
    case 'stock_candles':
      endpoint = '/stock/candle';
      queryParams.append('symbol', nodeData.symbol || input);
      queryParams.append('resolution', nodeData.resolution || 'D');
      queryParams.append('from', nodeData.from?.toString() || Math.floor(Date.now() / 1000 - 30 * 24 * 60 * 60).toString());
      queryParams.append('to', nodeData.to?.toString() || Math.floor(Date.now() / 1000).toString());
      break;
    default:
      throw new Error(`Unsupported Finnhub action: ${action}`);
  }

  try {
    // Make the API request
    const response = await fetch(`${baseUrl}${endpoint}?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Check for rate limiting
      if (response.status === 429) {
        throw new Error('Finnhub API rate limit exceeded. Please try again later.');
      }
      // Check for authentication errors
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid Finnhub API key. Please check your API key configuration.');
      }
      throw new Error(`Finnhub API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Check for error responses in the data
    if (data.error) {
      throw new Error(`Finnhub API error: ${data.error}`);
    }

    // Validate required fields for specific actions
    switch (action) {
      case 'quote':
        if (!data.c && !data.pc) {
          throw new Error('Invalid quote data received from Finnhub');
        }
        break;
      case 'company_profile2':
        if (!data.name && !data.ticker) {
          throw new Error('Invalid company profile data received from Finnhub');
        }
        break;
      case 'stock_candles':
        if (!data.c || !data.t || data.s === 'no_data') {
          throw new Error('No candle data available for the specified parameters');
        }
        break;
    }

    return data;
  } catch (error) {
    // Add more context to the error
    if (error instanceof Error) {
      error.message = `Finnhub ${action} failed: ${error.message}`;
    }
    throw error;
  }
}