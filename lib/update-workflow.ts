import { getConvexClient, api } from './convex/client';

async function updateWorkflow() {
  const client = getConvexClient();

  const workflow = await client.query(api.workflows.getWorkflowByCustomId, { customId: 'workflow_1762158557469' });

  if (!workflow) {
    console.error('Workflow not found');
    return;
  }

  const updatedNodes = workflow.nodes.map((node: any) => {
    if (node.type === 'agent') {
      const updatedMcpTools = node.data.mcpTools.map((tool: any) => {
        if (tool.name === 'Finnhub') {
          return {
            ...tool,
            url: 'http://localhost:3030/v1/mcp',
            authType: 'none',
            headers: undefined,
          };
        }
        return tool;
      });
      return {
        ...node,
        data: {
          ...node.data,
          mcpTools: updatedMcpTools,
        },
      };
    }
    return node;
  });

  const workflowToSave = {
    customId: workflow.customId,
    name: workflow.name,
    description: workflow.description,
    category: workflow.category,
    tags: workflow.tags,
    difficulty: workflow.difficulty,
    estimatedTime: workflow.estimatedTime,
    nodes: updatedNodes,
    edges: workflow.edges,
    version: workflow.version,
    isTemplate: workflow.isTemplate,
  };

  await client.mutation(api.workflows.saveWorkflow, workflowToSave);

  console.log('Workflow updated successfully');
}

updateWorkflow().catch(console.error);
