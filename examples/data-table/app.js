/**
 * Data Table Application
 * Demonstrates RxHtml's reactive capabilities with a complex interactive table
 */

import { signal, computed, effect } from '../../src/index.js';

// ============================================================================
// Data Generation
// ============================================================================

const statuses = ['active', 'inactive', 'pending'];
const departments = ['Engineering', 'Marketing', 'Sales', 'Support', 'HR'];
const names = [
    'John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 
    'Charlie Brown', 'Diana Prince', 'Eve Adams', 'Frank Miller',
    'Grace Lee', 'Henry Ford', 'Iris West', 'Jack Ryan',
    'Kate Bishop', 'Leo Valdez', 'Mary Jane', 'Nick Fury'
];

function generateRandomData(count = 50) {
    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: names[Math.floor(Math.random() * names.length)],
        email: `user${i + 1}@example.com`,
        department: departments[Math.floor(Math.random() * departments.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        salary: Math.floor(Math.random() * 100000) + 40000,
        hireDate: new Date(2020 + Math.floor(Math.random() * 4), 
                          Math.floor(Math.random() * 12), 
                          Math.floor(Math.random() * 28)).toISOString().split('T')[0],
        lastUpdate: new Date()
    }));
}

// ============================================================================
// State Management
// ============================================================================

// Raw data
const rawData = signal(generateRandomData());

// UI state
const searchTerm = signal('');
const sortColumn = signal('name');
const sortDirection = signal('asc'); // 'asc' or 'desc'
const currentPage = signal(1);
const pageSize = signal(10);
const selectedRows = signal(new Set());

// ============================================================================
// Computed Values
// ============================================================================

// Filtered data based on search
const filteredData = computed(() => {
    const search = searchTerm.value.toLowerCase().trim();
    if (!search) return rawData.value;
    
    return rawData.value.filter(row => 
        Object.values(row).some(val => 
            String(val).toLowerCase().includes(search)
        )
    );
});

// Sorted data
const sortedData = computed(() => {
    const data = [...filteredData.value];
    const column = sortColumn.value;
    const direction = sortDirection.value;
    
    if (!column) return data;
    
    data.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        // Handle different types
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    return data;
});

// Paginated data
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return sortedData.value.slice(start, end);
});

// Pagination info
const totalPages = computed(() => 
    Math.ceil(sortedData.value.length / pageSize.value) || 1
);

const isAllSelected = computed(() => 
    paginatedData.value.length > 0 &&
    paginatedData.value.every(row => selectedRows.value.has(row.id))
);

// ============================================================================
// Actions
// ============================================================================

function handleSort(column) {
    if (sortColumn.value === column) {
        // Toggle direction
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn.value = column;
        sortDirection.value = 'asc';
    }
    currentPage.value = 1; // Reset to first page
}

function handleSearch(value) {
    searchTerm.value = value;
    currentPage.value = 1; // Reset to first page
}

function handlePageChange(newPage) {
    if (newPage >= 1 && newPage <= totalPages.value) {
        currentPage.value = newPage;
    }
}

function handlePageSizeChange(newSize) {
    pageSize.value = parseInt(newSize);
    currentPage.value = 1; // Reset to first page
}

function toggleRowSelection(rowId) {
    const newSelected = new Set(selectedRows.value);
    if (newSelected.has(rowId)) {
        newSelected.delete(rowId);
    } else {
        newSelected.add(rowId);
    }
    selectedRows.value = newSelected;
}

function toggleAllSelection() {
    if (isAllSelected.value) {
        // Deselect all current page rows
        const newSelected = new Set(selectedRows.value);
        paginatedData.value.forEach(row => newSelected.delete(row.id));
        selectedRows.value = newSelected;
    } else {
        // Select all current page rows
        const newSelected = new Set(selectedRows.value);
        paginatedData.value.forEach(row => newSelected.add(row.id));
        selectedRows.value = newSelected;
    }
}

function clearSelection() {
    selectedRows.value = new Set();
}

function refreshData() {
    rawData.value = generateRandomData(rawData.value.length);
}

// Simulate real-time updates
function startLiveUpdates() {
    setInterval(() => {
        const data = [...rawData.value];
        const randomIndex = Math.floor(Math.random() * data.length);
        
        data[randomIndex] = {
            ...data[randomIndex],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            lastUpdate: new Date()
        };
        
        rawData.value = data;
    }, 3000); // Update every 3 seconds
}

// ============================================================================
// Rendering
// ============================================================================

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

function highlightText(text, search) {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, 'gi');
    return String(text).replace(regex, '<span class="highlight">$1</span>');
}

function renderTableHeader() {
    const columns = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'department', label: 'Department', sortable: true },
        { key: 'status', label: 'Status', sortable: true },
        { key: 'salary', label: 'Salary', sortable: true },
        { key: 'hireDate', label: 'Hire Date', sortable: true }
    ];
    
    const headerHtml = columns.map(col => {
        const isActive = sortColumn.value === col.key;
        const icon = isActive 
            ? (sortDirection.value === 'asc' ? '▲' : '▼')
            : '⬍';
        
        return `
            <th 
                class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                data-column="${col.key}"
            >
                ${col.label}
                ${col.sortable ? `<span class="sort-icon ${isActive ? 'active' : ''}">${icon}</span>` : ''}
            </th>
        `;
    }).join('');
    
    document.getElementById('tableHeader').innerHTML = `
        <th class="px-4 py-3 text-left">
            <input type="checkbox" id="selectAll" class="rounded" ${isAllSelected.value ? 'checked' : ''} />
        </th>
        ${headerHtml}
    `;
    
    // Add sort handlers
    document.querySelectorAll('[data-column]').forEach(th => {
        th.addEventListener('click', () => {
            handleSort(th.dataset.column);
        });
    });
    
    // Add select all handler
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', toggleAllSelection);
    }
}

function renderTableBody() {
    const search = searchTerm.value.toLowerCase();
    
    const rowsHtml = paginatedData.value.map(row => {
        const isSelected = selectedRows.value.has(row.id);
        
        const statusBadgeClass = {
            'active': 'success',
            'inactive': 'danger',
            'pending': 'warning'
        }[row.status] || 'success';
        
        return `
            <tr class="table-row ${isSelected ? 'selected' : ''}" data-row-id="${row.id}">
                <td class="px-4 py-3">
                    <input 
                        type="checkbox" 
                        class="rounded row-checkbox" 
                        data-row-id="${row.id}"
                        ${isSelected ? 'checked' : ''}
                    />
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">
                    ${highlightText(row.name, search)}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                    ${highlightText(row.email, search)}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                    ${highlightText(row.department, search)}
                </td>
                <td class="px-4 py-3">
                    <span class="badge ${statusBadgeClass}">
                        ${row.status}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">
                    ${formatCurrency(row.salary)}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                    ${row.hireDate}
                </td>
            </tr>
        `;
    }).join('');
    
    document.getElementById('tableBody').innerHTML = rowsHtml || `
        <tr>
            <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                No records found
            </td>
        </tr>
    `;
    
    // Add row selection handlers
    document.querySelectorAll('.row-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            toggleRowSelection(parseInt(checkbox.dataset.rowId));
        });
    });
}

function updateStats() {
    document.getElementById('totalRecords').textContent = rawData.value.length;
    document.getElementById('filteredRecords').textContent = filteredData.value.length;
    document.getElementById('selectedRecords').textContent = selectedRows.value.size;
    document.getElementById('selectedCount').textContent = selectedRows.value.size;
    
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString();
    
    // Update clear selection button
    const clearBtn = document.getElementById('clearSelection');
    clearBtn.disabled = selectedRows.value.size === 0;
}

function updatePagination() {
    document.getElementById('currentPage').textContent = currentPage.value;
    document.getElementById('totalPages').textContent = totalPages.value;
    
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    prevBtn.disabled = currentPage.value === 1;
    nextBtn.disabled = currentPage.value === totalPages.value;
}

// ============================================================================
// Initialization
// ============================================================================

function init() {
    // Hide loading, show content
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('content').classList.remove('hidden');
        
        // Initial render
        renderTableHeader();
        renderTableBody();
        updateStats();
        updatePagination();
        
        // Set up reactive updates
        effect(() => {
            // Re-render when data changes
            paginatedData.value;
            sortColumn.value;
            sortDirection.value;
            selectedRows.value;
            renderTableHeader();
            renderTableBody();
        });
        
        effect(() => {
            // Update stats when relevant data changes
            rawData.value;
            filteredData.value;
            selectedRows.value;
            updateStats();
        });
        
        effect(() => {
            // Update pagination when relevant data changes
            currentPage.value;
            totalPages.value;
            updatePagination();
        });
        
        // Set up event listeners
        document.getElementById('search').addEventListener('input', (e) => {
            handleSearch(e.target.value);
        });
        
        document.getElementById('pageSize').addEventListener('change', (e) => {
            handlePageSizeChange(e.target.value);
        });
        
        document.getElementById('prevPage').addEventListener('click', () => {
            handlePageChange(currentPage.value - 1);
        });
        
        document.getElementById('nextPage').addEventListener('click', () => {
            handlePageChange(currentPage.value + 1);
        });
        
        document.getElementById('clearSelection').addEventListener('click', clearSelection);
        
        document.getElementById('refreshData').addEventListener('click', refreshData);
        
        // Start live updates
        startLiveUpdates();
        
    }, 500); // Simulate loading time
}

// Start the application
init();
