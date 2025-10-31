"use client";

import { useEffect, useRef } from "react";
import { WorkflowResponse } from "./UIBuilderCanvas";
import { CheckCircle, XCircle, Clock, AlertCircle, Loader } from "lucide-react";

interface ResponseDisplayProps {
  responses: WorkflowResponse[];
  isExecuting: boolean;
}

export default function ResponseDisplay({ responses, isExecuting }: ResponseDisplayProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new responses arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [responses]);

  const getEventIcon = (event: string) => {
    switch (event) {
      case "workflow_started":
        return <Clock className="w-16 h-16 text-blue-500" />;
      case "node_started":
        return <Loader className="w-16 h-16 text-blue-500 animate-spin" />;
      case "node_completed":
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case "node_failed":
        return <XCircle className="w-16 h-16 text-red-500" />;
      case "workflow_completed":
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case "error":
        return <XCircle className="w-16 h-16 text-red-600" />;
      case "state_update":
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
      default:
        return <AlertCircle className="w-16 h-16 text-gray-500" />;
    }
  };

  const getEventColor = (event: string) => {
    switch (event) {
      case "workflow_started":
        return "bg-blue-500/10 border-blue-500/20";
      case "node_started":
        return "bg-blue-500/10 border-blue-500/20";
      case "node_completed":
        return "bg-green-500/10 border-green-500/20";
      case "node_failed":
        return "bg-red-500/10 border-red-500/20";
      case "workflow_completed":
        return "bg-green-600/10 border-green-600/20";
      case "error":
        return "bg-red-600/10 border-red-600/20";
      case "state_update":
        return "bg-yellow-500/10 border-yellow-500/20";
      default:
        return "bg-gray-500/10 border-gray-500/20";
    }
  };

  const formatEventData = (event: string, data: any) => {
    switch (event) {
      case "workflow_started":
        return (
          <div>
            <p className="font-medium">{data.workflowName}</p>
            <p className="text-xs text-text-secondary mt-4">
              {data.totalNodes} nodes to execute
            </p>
          </div>
        );

      case "node_started":
        return (
          <div>
            <p className="font-medium">{data.nodeName}</p>
            <p className="text-xs text-text-secondary mt-4">Type: {data.nodeType}</p>
          </div>
        );

      case "node_completed":
        return (
          <div>
            <p className="font-medium">{data.nodeName}</p>
            {data.result?.output && (
              <p className="text-xs mt-4 bg-background-base rounded-6 p-8 max-h-100 overflow-auto">
                {typeof data.result.output === "string"
                  ? data.result.output
                  : JSON.stringify(data.result.output, null, 2)}
              </p>
            )}
          </div>
        );

      case "node_failed":
        return (
          <div>
            <p className="font-medium">{data.nodeName}</p>
            <p className="text-xs text-red-500 mt-4">{data.error}</p>
          </div>
        );

      case "workflow_completed":
        return (
          <div>
            <p className="font-medium">Workflow Completed</p>
            <p className="text-xs text-text-secondary mt-4">Status: {data.status}</p>
            {data.results && Object.keys(data.results).length > 0 && (
              <details className="mt-8">
                <summary className="text-xs cursor-pointer hover:text-heat-100">
                  View all results ({Object.keys(data.results).length} nodes)
                </summary>
                <pre className="text-xs mt-4 bg-background-base rounded-6 p-8 max-h-200 overflow-auto">
                  {JSON.stringify(data.results, null, 2)}
                </pre>
              </details>
            )}
          </div>
        );

      case "error":
        return (
          <div>
            <p className="font-medium text-red-500">Error Occurred</p>
            <p className="text-xs mt-4">{data.error}</p>
          </div>
        );

      case "state_update":
        return (
          <div>
            <p className="font-medium">State Updated</p>
            <p className="text-xs text-text-secondary mt-4">
              Current Node: {data.currentNodeId}
            </p>
          </div>
        );

      default:
        return (
          <pre className="text-xs bg-background-base rounded-6 p-8 max-h-100 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-16 border-b border-border-faint">
        <h3 className="text-lg font-semibold mb-4">Workflow Response</h3>
        <p className="text-xs text-text-secondary">
          {isExecuting ? (
            <span className="flex items-center gap-4 text-blue-500">
              <Loader className="w-12 h-12 animate-spin" />
              Executing workflow...
            </span>
          ) : responses.length > 0 ? (
            `${responses.length} events received`
          ) : (
            "No responses yet. Click a button to execute."
          )}
        </p>
      </div>

      {/* Response List */}
      <div className="flex-1 overflow-auto p-16 space-y-12">
        {responses.length === 0 && !isExecuting && (
          <div className="flex items-center justify-center h-full text-center text-text-secondary">
            <div>
              <AlertCircle className="w-48 h-48 mx-auto mb-12 opacity-50" />
              <p>Workflow responses will appear here</p>
            </div>
          </div>
        )}

        {responses.map((response, index) => (
          <div
            key={index}
            className={`border rounded-8 p-12 ${getEventColor(response.event)}`}
          >
            <div className="flex items-start gap-8">
              <div className="flex-shrink-0 mt-2">{getEventIcon(response.event)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    {response.event.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {new Date(response.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {formatEventData(response.event, response.data)}
              </div>
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
