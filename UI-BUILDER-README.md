# Custom UI Builder with Workflow Integration

A drag-and-drop UI builder that allows users to create custom interfaces and invoke workflows with real-time streaming responses.

## Overview

The UI Builder is a new feature that enables users to:
- Drag and drop UI components (buttons, inputs, cards, etc.) onto a canvas
- Configure component properties visually
- Select a workflow to execute
- Trigger workflows from UI components (typically buttons)
- View real-time streaming responses as workflows execute

## Location

**Page:** `/ui-builder` ([app/ui-builder/page.tsx](app/ui-builder/page.tsx))

**Components:**
- `UIBuilderCanvas` - Main canvas orchestrator ([components/ui-builder/UIBuilderCanvas.tsx](components/ui-builder/UIBuilderCanvas.tsx))
- `ComponentPalette` - Draggable component library ([components/ui-builder/ComponentPalette.tsx](components/ui-builder/ComponentPalette.tsx))
- `DropZone` - Canvas drop area ([components/ui-builder/DropZone.tsx](components/ui-builder/DropZone.tsx))
- `DroppedComponent` - Individual component renderer ([components/ui-builder/DroppedComponent.tsx](components/ui-builder/DroppedComponent.tsx))
- `WorkflowSelector` - Workflow dropdown ([components/ui-builder/WorkflowSelector.tsx](components/ui-builder/WorkflowSelector.tsx))
- `ResponseDisplay` - Real-time response viewer ([components/ui-builder/ResponseDisplay.tsx](components/ui-builder/ResponseDisplay.tsx))

## Features

### 1. Drag-and-Drop Interface

Built with `@dnd-kit/core` for smooth drag-and-drop interactions:

- **Available Components:**
  - Button - Triggers workflow execution
  - Input - Text input field
  - Text Area - Multi-line text input
  - Card - Content card with title and body
  - Heading - H1, H2, or H3 headings
  - Text - Paragraph text
  - Image - Display images

### 2. Component Configuration

Each component can be configured with:
- Visual properties (labels, placeholders, text)
- Styling variants (primary/secondary buttons)
- User input values (inputs and textareas)

### 3. Workflow Integration

- **Workflow Selection:** Choose from user's saved workflows via dropdown
- **Execution:** Click button components to trigger workflow
- **Input Mapping:** Input and textarea values are automatically collected and sent as workflow inputs

### 4. Real-Time Streaming Responses

Uses Server-Sent Events (SSE) to stream workflow execution:

**Events Displayed:**
- `workflow_started` - Workflow begins
- `node_started` - Node execution starts
- `node_completed` - Node finishes with results
- `node_failed` - Node error
- `workflow_completed` - Workflow finishes
- `error` - Error occurred

## How to Use

### Step 1: Access the UI Builder

1. Sign in to the application
2. Click "UI Builder" button in the header
3. Or navigate directly to `/ui-builder`

### Step 2: Create Your UI

1. **Drag components** from the left palette onto the canvas
2. **Click the settings icon** on each component to configure:
   - Edit labels, text, placeholders
   - Change button variants
   - Customize properties
3. **Add inputs** to collect user data:
   - Input fields for single-line text
   - Text areas for multi-line text
   - Values are automatically sent to workflows

### Step 3: Select a Workflow

1. Use the **workflow dropdown** at the top
2. Select from your saved workflows
3. The workflow will be executed when buttons are clicked

### Step 4: Execute and View Results

1. **Click a button component** to trigger workflow
2. **Watch real-time updates** in the right sidebar:
   - See each node execute
   - View node outputs
   - Monitor progress
3. **View final results** when workflow completes

## Example Use Case

**Customer Support Form → AI Analysis Workflow**

1. **Build the UI:**
   - Add heading: "Customer Support Ticket"
   - Add input: "Customer Name"
   - Add textarea: "Issue Description"
   - Add button: "Analyze Ticket"

2. **Select Workflow:**
   - Choose "Ticket Analysis" workflow
   - Workflow uses AI agent to categorize and respond

3. **User Interaction:**
   - User enters name and issue
   - Clicks "Analyze Ticket"
   - Workflow executes with input values

4. **View Response:**
   - See AI analyze the ticket
   - View categorization
   - Get suggested response
   - All in real-time!

## Technical Architecture

### Data Flow

```
User Drags Component
    ↓
ComponentPalette (draggable)
    ↓
DropZone (droppable area)
    ↓
UIComponent created with default props
    ↓
DroppedComponent renders based on type
    ↓
User clicks Button
    ↓
Collect all input values
    ↓
POST /api/workflows/{workflowId}/execute-stream
    ↓
Stream SSE events
    ↓
ResponseDisplay shows real-time updates
```

### Component State

```typescript
interface UIComponent {
  id: string;                      // Unique ID
  type: string;                    // button, input, card, etc.
  props: Record<string, any>;      // Component-specific props
  position: { x: number; y: number }; // Position on canvas
}

interface WorkflowResponse {
  event: string;                   // SSE event type
  data: any;                       // Event data
  timestamp: string;               // ISO timestamp
}
```

### API Integration

**Endpoint:** `POST /api/workflows/{workflowId}/execute-stream`

**Request Body:**
```json
{
  "input_field": "value from input component",
  "text_area": "value from textarea component"
}
```

**Response:** Server-Sent Events stream

```
event: node_completed
data: {"nodeId":"agent_1","result":{"output":"..."}}

event: workflow_completed
data: {"status":"completed","results":{...}}
```

## Customization

### Adding New Component Types

1. **Add to ComponentPalette:**
```typescript
{ id: "newtype", label: "New Type", icon: "🎨" }
```

2. **Add default props in UIBuilderCanvas:**
```typescript
case "newtype":
  return { text: "Default text", variant: "default" };
```

3. **Add renderer in DroppedComponent:**
```typescript
case "newtype":
  return <div>{component.props.text}</div>;
```

4. **Add editor in DroppedComponent:**
```typescript
case "newtype":
  return (
    <input
      value={localProps.text}
      onChange={(e) => setLocalProps({...localProps, text: e.target.value})}
    />
  );
```

### Styling

Uses Tailwind CSS with design system variables:
- `bg-background-base` - Base background
- `bg-background-elevated` - Elevated surfaces
- `border-border-faint` - Subtle borders
- `text-text-primary` - Primary text
- `text-text-secondary` - Secondary text
- `bg-heat-100` - Primary action color

## Dependencies

- `@dnd-kit/core` - Drag and drop functionality
- `lucide-react` - Icons (Settings, X, Play, etc.)
- `convex/react` - Real-time workflow data
- `framer-motion` - Animations (inherited from existing UI)

## Future Enhancements

Potential improvements:
- [ ] Layout grid with positioning
- [ ] Component grouping/containers
- [ ] Save/load UI configurations
- [ ] More component types (dropdowns, checkboxes, radio buttons)
- [ ] Conditional component visibility based on workflow state
- [ ] Form validation
- [ ] Response mapping to update UI components
- [ ] Export UI as standalone page
- [ ] Theme customization
- [ ] Mobile responsive preview

## Navigation

**Access Points:**
- Home page header: "UI Builder" button (when signed in)
- Direct URL: `http://localhost:3000/ui-builder`

**Authentication:**
- Requires Clerk authentication
- Shows sign-in prompt when not authenticated

## Development

**Run locally:**
```bash
npm run dev
# Visit http://localhost:3000/ui-builder
```

**Test workflow integration:**
1. Create a workflow in the main workflow builder
2. Go to UI Builder
3. Add components
4. Select your workflow
5. Click button to execute

## Related Files

- Workflow execution API: [app/api/workflows/[workflowId]/execute-stream/route.ts](app/api/workflows/[workflowId]/execute-stream/route.ts)
- Workflow storage: [convex/workflows.ts](convex/workflows.ts)
- Main workflow builder: [components/app/(home)/sections/workflow-builder/WorkflowBuilder.tsx](components/app/(home)/sections/workflow-builder/WorkflowBuilder.tsx)

---

**Built for:** Open Agent Builder
**Created:** 2025-10-31
**Status:** Production Ready ✅
