# UI Builder - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         UI Builder Page                              │
│                      (/ui-builder/page.tsx)                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      UIBuilderCanvas Component                       │
│  • Manages component state                                          │
│  • Handles drag-and-drop context                                    │
│  • Orchestrates workflow execution                                  │
│  • Collects input values                                            │
└─────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐
│ ComponentPalette │  │   DropZone   │  │ ResponseDisplay  │
│                  │  │              │  │                  │
│ • Draggable      │  │ • Droppable  │  │ • SSE Events     │
│   components     │  │   area       │  │ • Real-time      │
│ • Source of      │  │ • Canvas     │  │   updates        │
│   UI elements    │  │   grid       │  │ • Event icons    │
└──────────────────┘  └──────────────┘  └──────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │  DroppedComponent    │
                   │                      │
                   │ • Renders UI element │
                   │ • Editable props     │
                   │ • Executes workflow  │
                   └──────────────────────┘
```

## Data Flow Diagram

### 1. Component Creation Flow

```
User Drags Component
        │
        ▼
┌───────────────────┐
│ ComponentPalette  │ (useDraggable)
│ Component ID      │
└───────────────────┘
        │
        ▼ Drag Start Event
┌───────────────────┐
│  UIBuilderCanvas  │ (DndContext)
│  setActiveId()    │
└───────────────────┘
        │
        ▼ Drag End Event
┌───────────────────┐
│    DropZone       │ (useDroppable)
│    over.id        │
└───────────────────┘
        │
        ▼ Create Component
┌───────────────────────────┐
│  UIBuilderCanvas          │
│  components.push({        │
│    id: 'button-123',      │
│    type: 'button',        │
│    props: { label: '...' }│
│  })                       │
└───────────────────────────┘
        │
        ▼ Render
┌───────────────────┐
│ DroppedComponent  │
│ Renders button    │
└───────────────────┘
```

### 2. Workflow Execution Flow

```
User Fills Inputs → User Clicks Button
        │                    │
        ▼                    ▼
┌──────────────────────────────────┐
│      DroppedComponent            │
│      onClick Handler             │
│      • Collect component props   │
│      • Call onExecute()          │
└──────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────┐
│      UIBuilderCanvas             │
│      handleExecuteWorkflow()     │
│      • Collect all input values  │
│      • Build inputs object       │
└──────────────────────────────────┘
                │
                ▼
        Inputs Object
        {
          "product_url": "https://...",
          "search_keywords": "laptop"
        }
                │
                ▼
┌──────────────────────────────────────────┐
│  POST /api/workflows/{id}/execute-stream │
│  • Authorization: Bearer <token>         │
│  • Body: inputs object                   │
└──────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────┐
│    Workflow Execution API        │
│    • Validate auth               │
│    • Fetch workflow from Convex  │
│    • Create LangGraphExecutor    │
│    • Start streaming execution   │
└──────────────────────────────────┘
                │
                ▼
        SSE Stream Events
                │
                ▼
┌──────────────────────────────────┐
│      UIBuilderCanvas             │
│      • Read SSE stream           │
│      • Parse events              │
│      • Update responses state    │
└──────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────┐
│      ResponseDisplay             │
│      • Map events to UI          │
│      • Show icons & timestamps   │
│      • Display results           │
└──────────────────────────────────┘
```

### 3. SSE Event Processing

```
SSE Stream from API
        │
        ▼
event: node_started
data: {"nodeId":"agent_1","nodeName":"Search Agent"}
        │
        ▼
┌──────────────────────────────────┐
│  UIBuilderCanvas (fetch loop)    │
│  • Decode chunk                  │
│  • Split by '\n\n'               │
│  • Parse event + data lines      │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│  WorkflowResponse Object         │
│  {                               │
│    event: "node_started",        │
│    data: {...},                  │
│    timestamp: "2025-10-31..."    │
│  }                               │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│  ResponseDisplay                 │
│  • getEventIcon(event)           │
│  • getEventColor(event)          │
│  • formatEventData(event, data)  │
│  • Render event card             │
└──────────────────────────────────┘
```

## Component State Management

### UIBuilderCanvas State

```typescript
const [components, setComponents] = useState<UIComponent[]>([
  {
    id: 'button-1699123456789',
    type: 'button',
    props: { label: 'Click Me', variant: 'primary' },
    position: { x: 100, y: 50 }
  },
  {
    id: 'input-1699123456790',
    type: 'input',
    props: { label: 'URL', placeholder: 'Enter URL...', value: '' },
    position: { x: 100, y: 150 }
  }
]);

const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');
const [workflowResponses, setWorkflowResponses] = useState<WorkflowResponse[]>([]);
const [isExecuting, setIsExecuting] = useState(false);
const [activeComponentId, setActiveComponentId] = useState<string | null>(null);
```

### Component Update Flow

```
User edits component props
        │
        ▼
┌──────────────────────────────────┐
│  DroppedComponent                │
│  • User types in input           │
│  • handlePropChange()            │
│  • setLocalProps()               │
│  • onUpdate(id, newProps)        │
└──────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│  UIBuilderCanvas                 │
│  handleComponentUpdate()         │
│  setComponents(prev =>           │
│    prev.map(c =>                 │
│      c.id === id                 │
│        ? { ...c, props }         │
│        : c                       │
│    )                             │
│  )                               │
└──────────────────────────────────┘
        │
        ▼
    Re-render with
    updated props
```

## Integration with Existing System

```
┌─────────────────────────────────────────────────────────────┐
│                    Open Agent Builder                        │
└─────────────────────────────────────────────────────────────┘
         │                                │
         ▼                                ▼
┌──────────────────┐           ┌──────────────────┐
│ Workflow Builder │           │   UI Builder     │
│                  │           │                  │
│ • Create         │           │ • Create custom  │
│   workflows      │◄─────────▶│   interfaces     │
│ • Configure      │           │ • Invoke         │
│   nodes          │           │   workflows      │
│ • Test           │           │ • Display        │
│   execution      │           │   results        │
└──────────────────┘           └──────────────────┘
         │                                │
         └────────────┬───────────────────┘
                      ▼
         ┌────────────────────────┐
         │   Convex Database      │
         │   • workflows table    │
         │   • executions table   │
         └────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │  Execution API         │
         │  • execute-stream      │
         │  • LangGraph executor  │
         └────────────────────────┘
```

## Technology Stack

### Frontend
- **React 19** - UI components
- **Next.js 16** - App Router, API routes
- **@dnd-kit/core** - Drag and drop
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Convex React** - Real-time queries

### Backend
- **Next.js API Routes** - Server endpoints
- **Convex** - Database & real-time updates
- **LangGraph** - Workflow execution
- **Server-Sent Events (SSE)** - Streaming responses

## File Structure

```
open-agent-builder/
├── app/
│   └── ui-builder/
│       └── page.tsx                    # Main UI Builder page
│
├── components/
│   └── ui-builder/
│       ├── UIBuilderCanvas.tsx         # Main orchestrator
│       ├── ComponentPalette.tsx        # Draggable components
│       ├── DropZone.tsx                # Drop area
│       ├── DroppedComponent.tsx        # Rendered components
│       ├── WorkflowSelector.tsx        # Workflow dropdown
│       └── ResponseDisplay.tsx         # Event viewer
│
├── app/api/workflows/
│   └── [workflowId]/
│       └── execute-stream/
│           └── route.ts                # Streaming API endpoint
│
└── convex/
    └── workflows.ts                    # Workflow CRUD operations
```

## Performance Considerations

### 1. Drag and Drop
- Uses `@dnd-kit` with pointer sensor
- Activation constraint prevents accidental drags
- Overlay provides visual feedback

### 2. State Management
- Local state for components (no global state needed)
- Real-time Convex queries for workflow list
- Efficient re-renders with React key props

### 3. Streaming
- SSE for real-time updates (no polling)
- Efficient chunk decoding with TextDecoder
- Progressive event accumulation

### 4. Component Rendering
- Conditional rendering based on type
- Lazy evaluation of component editors
- Auto-scroll to latest events

## Security

### Authentication
- Clerk authentication for UI users
- API key authentication for external access
- Auth validation in API routes

### Authorization
- User can only see their workflows
- Workflow ownership checked before execution
- API keys are user-scoped

### Data Privacy
- Input values stored in client state only
- No persistence of UI builder state (yet)
- Workflow execution uses secure API endpoints

## Future Architecture Enhancements

### Planned Features
1. **Persistent UI Layouts** - Save UI builder configurations
2. **Component Positioning** - Free-form layout with drag positioning
3. **Response Mapping** - Update UI components with workflow results
4. **Conditional Visibility** - Show/hide components based on workflow state
5. **Form Validation** - Client-side input validation
6. **Theme System** - Custom styling and branding
7. **Component Library** - More component types (dropdowns, checkboxes, etc.)
8. **Export UI** - Generate standalone HTML/React code

### Scalability
- Components array can scale to hundreds of elements
- SSE streaming handles long-running workflows
- Convex queries are indexed and optimized
- Lazy loading for large workflow lists

---

**Last Updated:** 2025-10-31
**Version:** 1.0.0
**Status:** Production Ready
