# Data Table Example

This example demonstrates building an interactive data table with RxHtml, featuring:

- **Sorting**: Click column headers to sort
- **Filtering**: Search across all columns
- **Pagination**: Navigate through large datasets
- **Real-time Updates**: Simulated live data updates
- **Row Selection**: Select and batch operations
- **Performance**: Efficient rendering with signals

## Features Demonstrated

### 1. Signal-Based State Management
- Table data stored in signals
- Computed values for filtered/sorted data
- Reactive updates without re-rendering entire table

### 2. Sorting
- Click column headers to sort ascending/descending
- Visual indicators for sort direction
- Multi-column sort support

### 3. Filtering
- Real-time search across all columns
- Debounced input for performance
- Highlight matched text

### 4. Pagination
- Configurable page size
- Previous/Next navigation
- Page number display

### 5. Real-time Updates
- Simulated WebSocket updates
- Smooth data transitions
- No flickering or jarring updates

## Running the Example

### Option 1: Static Server

```bash
# Start any static file server in the examples/data-table directory
python -m http.server 8000

# Or using Node.js
npx serve .

# Open http://localhost:8000
```

### Option 2: Development Server

```bash
# From project root
npm run dev

# Navigate to /examples/data-table/
```

## Code Structure

```
data-table/
├── index.html          # Main HTML file
├── app.js             # Application logic
├── components/
│   ├── DataTable.js   # Main table component
│   ├── TableHeader.js # Header with sorting
│   ├── TableRow.js    # Individual row component
│   └── Pagination.js  # Pagination controls
└── README.md          # This file
```

## Key Concepts

### Reactive Data Flow

```javascript
// Raw data signal
const rawData = signal([...]);

// Filtered data (computed)
const filteredData = computed(() => {
  return rawData.value.filter(row => 
    searchTerm.value === '' || 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  );
});

// Sorted data (computed)
const sortedData = computed(() => {
  const data = [...filteredData.value];
  if (sortColumn.value) {
    data.sort((a, b) => {
      // Sort logic
    });
  }
  return data;
});

// Paginated data (computed)
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return sortedData.value.slice(start, end);
});
```

### Performance Optimization

1. **Computed Chain**: Only recalculates what changed
2. **Minimal Rendering**: Updates only affected rows
3. **Debounced Search**: Reduces filtering operations
4. **Virtual Scrolling**: Optional for very large datasets

### Real-time Updates

```javascript
// Simulate WebSocket updates
setInterval(() => {
  const randomIndex = Math.floor(Math.random() * rawData.value.length);
  const updatedData = [...rawData.value];
  updatedData[randomIndex] = {
    ...updatedData[randomIndex],
    status: getRandomStatus(),
    lastUpdate: new Date()
  };
  rawData.value = updatedData;
}, 2000);
```

## Usage in Your Project

### Basic Table

```javascript
import { DataTable } from './components/DataTable.js';

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  // ...
];

const table = createComponent(DataTable, {
  data,
  columns: [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ]
});

table.mount('#app');
```

### With Custom Rendering

```javascript
const table = createComponent(DataTable, {
  data,
  columns: [
    { 
      key: 'name', 
      label: 'Name', 
      sortable: true,
      render: (value, row) => `<strong>${value}</strong>`
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => `
        <span class="badge ${value === 'active' ? 'success' : 'danger'}">
          ${value}
        </span>
      `
    }
  ]
});
```

### With Actions

```javascript
const table = createComponent(DataTable, {
  data,
  columns: [...],
  actions: [
    {
      label: 'Edit',
      icon: 'edit',
      handler: (row) => console.log('Edit', row)
    },
    {
      label: 'Delete',
      icon: 'trash',
      handler: (row) => console.log('Delete', row),
      confirm: true
    }
  ]
});
```

## Extending the Example

### Add Export Functionality

```javascript
const exportToCSV = () => {
  const csv = sortedData.value.map(row => 
    Object.values(row).join(',')
  ).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.csv';
  a.click();
};
```

### Add Inline Editing

```javascript
const editMode = signal({});

const toggleEdit = (rowId) => {
  editMode.value = {
    ...editMode.value,
    [rowId]: !editMode.value[rowId]
  };
};

const saveEdit = (rowId, newData) => {
  const updatedData = rawData.value.map(row => 
    row.id === rowId ? { ...row, ...newData } : row
  );
  rawData.value = updatedData;
  editMode.value = { ...editMode.value, [rowId]: false };
};
```

### Add Column Customization

```javascript
const visibleColumns = signal(['name', 'email', 'status']);

const toggleColumn = (columnKey) => {
  if (visibleColumns.value.includes(columnKey)) {
    visibleColumns.value = visibleColumns.value.filter(k => k !== columnKey);
  } else {
    visibleColumns.value = [...visibleColumns.value, columnKey];
  }
};
```

## Performance Tips

1. **Use Computed Values**: Chain computations for better performance
2. **Debounce Search**: Avoid filtering on every keystroke
3. **Pagination**: Don't render all rows at once
4. **Virtual Scrolling**: For 1000+ rows, consider virtual scrolling
5. **Memoize Renderers**: Cache custom render functions

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ support required
- No polyfills needed for core functionality

## Learn More

- [RxHtml Documentation](../../docs/README.md)
- [Signal System Guide](../../docs/getting-started.md)
- [Component Patterns](../../docs/advanced.md)
- [Performance Tips](../../docs/performance.md)
