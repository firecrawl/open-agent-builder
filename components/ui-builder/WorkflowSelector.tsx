"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface WorkflowSelectorProps {
  selectedWorkflowId: string;
  onSelectWorkflow: (workflowId: string) => void;
}

export default function WorkflowSelector({
  selectedWorkflowId,
  onSelectWorkflow,
}: WorkflowSelectorProps) {
  const workflows = useQuery(api.workflows.list);

  return (
    <div className="flex items-center gap-12">
      <label className="text-sm font-medium whitespace-nowrap">
        Select Workflow:
      </label>
      <select
        value={selectedWorkflowId}
        onChange={(e) => onSelectWorkflow(e.target.value)}
        className="flex-1 px-12 py-8 bg-background-base border border-border-faint rounded-8 focus:outline-none focus:border-heat-100"
      >
        <option value="">-- Choose a workflow --</option>
        {workflows?.map((workflow) => (
          <option key={workflow._id} value={workflow.customId || workflow._id}>
            {workflow.name}
          </option>
        ))}
      </select>
      <div className="text-xs text-text-secondary">
        {workflows ? `${workflows.length} workflows available` : "Loading..."}
      </div>
    </div>
  );
}
