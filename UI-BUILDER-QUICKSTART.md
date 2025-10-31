# UI Builder - Quick Start Guide

## What You Can Do

Build custom user interfaces that invoke your workflows and display real-time results - all without writing code!

## 5-Minute Quick Start

### Step 1: Access the UI Builder
1. Sign in to your account
2. Click **"UI Builder"** in the top navigation
3. You'll see three panels:
   - **Left:** Component Palette
   - **Center:** Canvas
   - **Right:** Response Display

### Step 2: Build Your UI
**Drag components from the left palette onto the canvas:**

1. **Add a heading** - Drag "Heading" component, set text to "Product Research"
2. **Add an input** - Drag "Input" component, set label to "Product URL"
3. **Add a text area** - Drag "Text Area" component, set label to "Search Keywords"
4. **Add a button** - Drag "Button" component, set label to "Start Research"

**Configure each component:**
- Click the ⚙️ (settings) icon to edit properties
- Change text, labels, placeholders
- Choose button variants (primary/secondary)

### Step 3: Select a Workflow
1. At the top of the page, use the **"Select Workflow"** dropdown
2. Choose an existing workflow (e.g., "Amazon Product Research")
3. This workflow will execute when you click buttons

### Step 4: Execute and View Results
1. Fill in the input fields you created
2. Click your button component
3. Watch the **right sidebar** for real-time updates:
   - Workflow starts
   - Each node executes
   - View outputs
   - See final results

## Example Use Cases

### 1. Web Scraping Form
```
Components:
- Heading: "Web Scraper"
- Input: "Website URL"
- Button: "Scrape Now"

Workflow: Simple web scraper
Result: Extracted content appears in sidebar
```

### 2. Stock Analysis Dashboard
```
Components:
- Heading: "Stock Analysis"
- Input: "Stock Ticker (e.g., AAPL)"
- Button: "Analyze"

Workflow: Stock research workflow
Result: Real-time analysis with price, news, recommendations
```

### 3. Customer Support Ticket
```
Components:
- Heading: "Submit Support Ticket"
- Input: "Your Name"
- Input: "Email"
- Text Area: "Describe your issue"
- Button: "Submit & Auto-Categorize"

Workflow: Ticket categorization workflow
Result: AI categorizes ticket and suggests response
```

### 4. Content Generator
```
Components:
- Heading: "Blog Post Generator"
- Input: "Topic"
- Text Area: "Key Points"
- Button: "Generate Post"

Workflow: Content generation workflow
Result: AI-generated blog post with SEO optimization
```

## Component Reference

### Button
- **Purpose:** Trigger workflow execution
- **Props:**
  - Label: Button text
  - Variant: primary (red) or secondary (gray)
- **Behavior:** Clicking executes the selected workflow

### Input
- **Purpose:** Single-line text input
- **Props:**
  - Label: Field label
  - Placeholder: Hint text
  - Value: Current input value
- **Behavior:** Value sent to workflow as input

### Text Area
- **Purpose:** Multi-line text input
- **Props:**
  - Label: Field label
  - Placeholder: Hint text
  - Rows: Number of lines
  - Value: Current input value
- **Behavior:** Value sent to workflow as input

### Card
- **Purpose:** Display content in a card
- **Props:**
  - Title: Card heading
  - Content: Card body text
- **Behavior:** Static display

### Heading
- **Purpose:** Page/section titles
- **Props:**
  - Text: Heading content
  - Level: h1, h2, or h3
- **Behavior:** Static display

### Text
- **Purpose:** Paragraph text
- **Props:**
  - Text: Content
- **Behavior:** Static display

### Image
- **Purpose:** Display images
- **Props:**
  - URL: Image source
  - Alt: Alternative text
- **Behavior:** Static display

## How Input Values Work

When you click a button to execute a workflow:

1. **All input and textarea values are collected**
2. **Values are sent as workflow inputs** with keys based on labels:
   - "Product URL" → `product_url`
   - "Search Keywords" → `search_keywords`
3. **Workflow receives inputs** and can use them with `{{input.product_url}}`

**Example:**
```
Input Label: "Website URL"
User enters: "https://example.com"
Workflow receives: { "website_url": "https://example.com" }
```

## Real-Time Response Events

The right sidebar shows these event types:

| Event | Icon | Meaning |
|-------|------|---------|
| `workflow_started` | 🕐 | Workflow execution begins |
| `node_started` | ⏳ | A node starts processing |
| `node_completed` | ✅ | Node finishes successfully |
| `node_failed` | ❌ | Node encounters error |
| `workflow_completed` | ✅ | Entire workflow done |
| `error` | ❌ | Error occurred |

Each event shows:
- Event type and time
- Node name (for node events)
- Output/result data
- Detailed information (expandable)

## Tips and Best Practices

### 1. Input Naming
- Use clear, descriptive labels
- Labels become input keys (spaces → underscores)
- Keep labels consistent with workflow expectations

### 2. Component Organization
- Start with a heading to describe the form
- Group related inputs together
- Place the action button at the bottom

### 3. Workflow Selection
- Choose workflows that match your input fields
- Test workflows first in the main workflow builder
- Ensure workflow expects the inputs you're providing

### 4. Testing
- Fill in test data
- Click button to execute
- Watch sidebar for errors
- Adjust inputs if workflow fails

### 5. Layout
- Components appear in a responsive grid
- Delete unwanted components with ❌ icon
- Edit properties with ⚙️ icon
- Components can't be repositioned yet (future feature)

## Common Issues

### "Please select a workflow first"
**Problem:** No workflow selected
**Solution:** Use the workflow dropdown at the top

### "Workflow {id} not found"
**Problem:** Invalid workflow ID or workflow deleted
**Solution:** Choose a different workflow from dropdown

### No response in sidebar
**Problem:** Workflow not executing or taking time
**Solution:** Check console for errors, verify workflow exists

### Input values not reaching workflow
**Problem:** Label → key mapping issue
**Solution:** Use simple labels without special characters

## What's Next?

After building your UI:

1. **Share your interface** - Copy the URL and share with team members
2. **Create multiple UIs** - Build different interfaces for different workflows
3. **Iterate and improve** - Adjust components based on user feedback
4. **Monitor executions** - Watch the sidebar for insights into workflow performance

## Need More Control?

For advanced integrations, see:
- [UI-BUILDER-README.md](UI-BUILDER-README.md) - Full technical documentation
- [examples/custom-ui-workflow-integration.ts](examples/custom-ui-workflow-integration.ts) - Code examples
- Original documentation - How workflows work

## Support

**Questions?**
- Check the main README.md
- Review workflow documentation
- Inspect workflow execution logs in sidebar
- Test workflows in the main workflow builder first

**Feature Requests?**
- Open an issue on GitHub
- Suggest new component types
- Request layout/styling options

---

**Happy Building!** 🚀
