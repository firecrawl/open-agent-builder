# UI Builder - Visual Guide

## Application Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Header                                                                      │
│  [Logo]           [UI Builder] [GitHub]  [Sign In] / [User Avatar]         │
└─────────────────────────────────────────────────────────────────────────────┘
│
│  Workflow Selector Bar
│  Select Workflow: [▼ Amazon Product Research          ] 5 workflows available
│
┌─────────────────┬────────────────────────────────────┬──────────────────────┐
│  Palette        │         Canvas                      │   Response Display   │
│  (256px)        │         (flex)                      │   (384px)            │
│─────────────────│────────────────────────────────────│──────────────────────│
│                 │                                     │                      │
│ UI Components   │  ┌──────────────┐  ┌────────────┐  │ Workflow Response    │
│                 │  │   Heading    │  │   Input    │  │                      │
│ 🔘 Button       │  │ "Product..."  │  │ Label: URL │  │ ⏰ Workflow started │
│ 📝 Input        │  │              │  │ [_______]  │  │                      │
│ 📄 Text Area    │  └──────────────┘  └────────────┘  │ ⏳ Node: Scraper    │
│ 🃏 Card         │                                     │                      │
│ 📌 Heading      │  ┌──────────────┐  ┌────────────┐  │ ✅ Scraper complete │
│ 📝 Text         │  │  Text Area   │  │   Button   │  │ Output: "Found..."   │
│ 🖼️  Image       │  │ Keywords...  │  │ [Search]   │  │                      │
│                 │  │ [_________]  │  │            │  │ ⏳ Node: Analyzer   │
│ Drag components │  │ [_________]  │  │            │  │                      │
│ onto canvas     │  └──────────────┘  └────────────┘  │ ✅ Analysis done    │
│                 │                                     │                      │
│                 │  Drop components here               │ ✅ Workflow complete │
│                 │                                     │                      │
└─────────────────┴────────────────────────────────────┴──────────────────────┘
```

## Component States

### 1. Component in Palette (Draggable)
```
┌──────────────────┐
│ 🔘 Button        │  ← Hover: border turns red
│                  │  ← Click & drag: becomes semi-transparent
└──────────────────┘
```

### 2. Component on Canvas (Dropped)
```
┌────────────────────────┐
│ BUTTON            ⚙️ ❌ │  ← Hover: shows settings & delete icons
│────────────────────────│
│  [Click Me]            │  ← Actual rendered component
└────────────────────────┘
```

### 3. Component Being Edited
```
┌────────────────────────┐
│ BUTTON            ⚙️ ❌ │
│────────────────────────│
│ Label:                 │
│ [Click Me___________]  │  ← Editable fields
│                        │
│ Variant:               │
│ [▼ Primary       ]     │
│                        │
│ [Save Changes]         │
└────────────────────────┘
```

## Drag and Drop Flow

```
Step 1: User clicks component in palette
┌──────────────────┐
│ 🔘 Button        │  ← Mouse down
└──────────────────┘


Step 2: Starts dragging
┌──────────────────┐
│ 🔘 Button        │  ← Becomes semi-transparent
└──────────────────┘
       │
       │ [Drag Overlay shown]
       ▼


Step 3: Hovers over canvas
┌─────────────────────────────┐
│     Canvas (highlighted)     │  ← Canvas border turns red
│                              │
│  Drop components here        │
└─────────────────────────────┘


Step 4: Releases mouse
┌─────────────────────────────┐
│     Canvas                   │
│  ┌────────────────────────┐ │
│  │ BUTTON           ⚙️ ❌  │ │  ← New component created!
│  │  [Click Me]            │ │
│  └────────────────────────┘ │
└─────────────────────────────┘
```

## Workflow Execution Flow

```
User fills form:
┌────────────────┐
│ URL Input      │
│ [amazon.com__] │  ← User types
└────────────────┘
┌────────────────┐
│ Keywords       │
│ [laptop______] │  ← User types
└────────────────┘


User clicks button:
┌────────────────┐
│  [Search]      │  ← Click!
└────────────────┘
        │
        ▼
┌────────────────────┐
│  Button becomes:   │
│  ⏳ Executing...   │  ← Loading state
└────────────────────┘
        │
        ▼
API Call: POST /api/workflows/amazon-research/execute-stream
Body: { "url": "amazon.com", "keywords": "laptop" }
        │
        ▼
SSE Stream starts:


Response sidebar updates in real-time:

┌───────────────────────────┐
│ ⏰ Workflow started       │  ← Blue background
│ Amazon Product Research   │
│ 8 nodes to execute        │
└───────────────────────────┘

┌───────────────────────────┐
│ ⏳ Node: Firecrawl        │  ← Blue, spinner icon
│ Type: mcp                 │
└───────────────────────────┘

┌───────────────────────────┐
│ ✅ Node: Firecrawl        │  ← Green, checkmark
│ Output: "Found 10 ..."    │
└───────────────────────────┘

┌───────────────────────────┐
│ ⏳ Node: Analyzer         │  ← Blue, spinner icon
│ Type: agent               │
└───────────────────────────┘

┌───────────────────────────┐
│ ✅ Node: Analyzer         │  ← Green, checkmark
│ Output: "Analysis: ..."   │
│ [View Details]            │  ← Expandable
└───────────────────────────┘

┌───────────────────────────┐
│ ✅ Workflow Completed     │  ← Dark green
│ Status: completed         │
│ [View all results (8)]    │  ← Expandable JSON
└───────────────────────────┘


Button returns to normal:
┌────────────────┐
│  [Search]      │
└────────────────┘
```

## Response Event Types (Visual)

### workflow_started
```
┌─────────────────────────────────────┐
│ 🕐 WORKFLOW STARTED         10:30am │  ← Blue background
│ Amazon Product Research             │
│ 8 nodes to execute                  │
└─────────────────────────────────────┘
```

### node_started
```
┌─────────────────────────────────────┐
│ ⏳ NODE STARTED             10:30am │  ← Blue background
│ Firecrawl Scraper                   │  ← Spinner animates
│ Type: mcp                           │
└─────────────────────────────────────┘
```

### node_completed
```
┌─────────────────────────────────────┐
│ ✅ NODE COMPLETED           10:31am │  ← Green background
│ Firecrawl Scraper                   │
│ ┌─────────────────────────────────┐ │
│ │ Output:                         │ │  ← Code block
│ │ "Successfully scraped 10        │ │
│ │  products from Amazon..."       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### node_failed
```
┌─────────────────────────────────────┐
│ ❌ NODE FAILED              10:31am │  ← Red background
│ Firecrawl Scraper                   │
│ Error: Rate limit exceeded          │  ← Red text
└─────────────────────────────────────┘
```

### workflow_completed
```
┌─────────────────────────────────────┐
│ ✅ WORKFLOW COMPLETED       10:32am │  ← Dark green
│ Status: completed                   │
│ ▼ View all results (8 nodes)       │  ← Expandable
│   ┌───────────────────────────────┐ │
│   │ {                             │ │
│   │   "scraper": {...},           │ │  ← Full JSON
│   │   "analyzer": {...}           │ │
│   │ }                             │ │
│   └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### error
```
┌─────────────────────────────────────┐
│ ❌ ERROR OCCURRED           10:31am │  ← Red background
│ Network error: timeout              │
└─────────────────────────────────────┘
```

## Example: Complete Form Layout

```
┌─────────────────────────────────────────────────────────────┐
│                          Canvas                              │
│─────────────────────────────────────────────────────────────│
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ HEADING                                    ⚙️ ❌   │     │
│  │ Product Research Dashboard                         │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌──────────────────────────┐  ┌──────────────────────────┐│
│  │ INPUT             ⚙️ ❌  │  │ INPUT             ⚙️ ❌  ││
│  │ Product URL               │  │ Search Keywords          ││
│  │ [https://amazon.com___]   │  │ [gaming laptop_______]   ││
│  └──────────────────────────┘  └──────────────────────────┘│
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ TEXTAREA                                   ⚙️ ❌   │     │
│  │ Additional Notes                                   │     │
│  │ [Optional: Enter any specific requirements____]    │     │
│  │ [____________________________________________]      │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ BUTTON                                     ⚙️ ❌   │     │
│  │       [🔍 Start Product Research]                  │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ CARD                                       ⚙️ ❌   │     │
│  │ ┌──────────────────────────────────────────────┐   │     │
│  │ │ How it works                                 │   │     │
│  │ ├──────────────────────────────────────────────┤   │     │
│  │ │ Enter a product URL and keywords. Our AI     │   │     │
│  │ │ will scrape, analyze, and provide insights.  │   │     │
│  │ └──────────────────────────────────────────────┘   │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Mobile/Responsive View

```
Desktop (> 768px):
┌────┬──────────┬────┐
│Pal │  Canvas  │Resp│
│ette│          │onse│
└────┴──────────┴────┘
    2 column grid in canvas


Mobile (< 768px):
┌──────────────────┐
│  Palette         │  ← Collapsible
├──────────────────┤
│  Canvas          │
│  (1 column)      │
│                  │
│  [Component 1]   │
│  [Component 2]   │
│  [Component 3]   │
├──────────────────┤
│  Response        │  ← Collapsible
│  [Events...]     │
└──────────────────┘
```

## Color Coding System

```
Events:
🔵 Blue    = In Progress (workflow_started, node_started)
🟢 Green   = Success (node_completed, workflow_completed)
🔴 Red     = Error (node_failed, error)
🟡 Yellow  = State Update (state_update)
⚪ Gray    = Unknown/Other

Backgrounds:
bg-blue-500/10    = Light blue (in progress)
bg-green-500/10   = Light green (success)
bg-red-500/10     = Light red (error)
bg-yellow-500/10  = Light yellow (update)

Borders:
border-blue-500/20
border-green-500/20
border-red-500/20
border-yellow-500/20
```

## Component Configuration Panel

```
When clicking ⚙️ icon:

Before:                        After:
┌────────────────────┐        ┌────────────────────┐
│ BUTTON      ⚙️ ❌  │        │ BUTTON      ⚙️ ❌  │
│ [Click Me]         │        │ Label:             │
└────────────────────┘        │ [Click Me_______]  │
         │                    │                    │
         │ Click ⚙️           │ Variant:           │
         ▼                    │ [▼ Primary     ]   │
                              │                    │
                              │ [Save Changes]     │
                              └────────────────────┘
                                      │
                                      │ Click Save
                                      ▼
                              ┌────────────────────┐
                              │ BUTTON      ⚙️ ❌  │
                              │ [Click Me]         │  ← Updated!
                              └────────────────────┘
```

## Loading States

### Button Executing
```
Normal:                      Executing:
┌──────────────┐            ┌──────────────────┐
│  [Search]    │            │  ⏳ Executing... │  ← Spinner + text
└──────────────┘            └──────────────────┘
                                 (Disabled)
```

### Response Loading
```
┌───────────────────────────┐
│ Workflow Response         │
│                           │
│ ⏳ Executing workflow...  │  ← Shows during execution
│                           │
│ (Events will appear       │
│  as workflow runs)        │
└───────────────────────────┘
```

### Empty States
```
Canvas Empty:
┌─────────────────────────────┐
│                             │
│   Drop components here      │
│   to build your UI          │
│                             │
│   Components will trigger   │
│   the selected workflow     │
│                             │
└─────────────────────────────┘


Response Empty:
┌─────────────────────────────┐
│ Workflow Response           │
│                             │
│        🔔                   │
│                             │
│   Workflow responses will   │
│   appear here               │
│                             │
└─────────────────────────────┘
```

---

## Quick Reference: Component Icons

| Component | Icon | Editable Props |
|-----------|------|----------------|
| Button | 🔘 | label, variant |
| Input | 📝 | label, placeholder, value |
| TextArea | 📄 | label, placeholder, value, rows |
| Card | 🃏 | title, content |
| Heading | 📌 | text, level (h1/h2/h3) |
| Text | 📝 | text |
| Image | 🖼️ | src, alt |

## Quick Reference: Event Icons

| Event | Icon | Color |
|-------|------|-------|
| workflow_started | 🕐 | Blue |
| node_started | ⏳ | Blue (spinning) |
| node_completed | ✅ | Green |
| node_failed | ❌ | Red |
| workflow_completed | ✅ | Dark Green |
| error | ❌ | Red |
| state_update | ⚠️ | Yellow |

---

**Visual Guide Complete!** 🎨

Use these diagrams to understand the UI Builder layout and interactions.
