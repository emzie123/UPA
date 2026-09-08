// Asset Models lookup - prominently featuring Jabra Biz for Headset
const ASSET_MODELS = {
  "Headset": [
    "Jabra Biz 1100 Duo",
    "Jabra Biz 1100 Mono",
    "Jabra Biz 1500 Duo",
    "Jabra Biz 1500 Mono",
    "Jabra Biz 2300 USB",
    "Jabra Biz 2400 II",
    "Jabra Evolve 20 Stereo",
    "Jabra Evolve 40 UC",
    "Plantronics Blackwire C3220",
    "Logitech H390 USB"
  ],
  "Laptop": [
    "Dell Latitude 5420",
    "Dell Latitude 3420",
    "HP EliteBook 840 G8",
    "HP ProBook 450 G8",
    "Lenovo ThinkPad L14 Gen 2",
    "Lenovo ThinkPad T14s"
  ],
  "Desktop / CPU": [
    "Dell OptiPlex 7080 SFF",
    "Dell OptiPlex 3080 Micro",
    "HP ProDesk 400 G6",
    "Lenovo ThinkCentre M70s"
  ],
  "Monitor": [
    "Dell E2216HV 21.5\"",
    "Dell SE2422H 24\"",
    "HP P22v G4 21.5\"",
    "ViewSonic VA2261H-2"
  ],
  "Peripherals": [
    "Standard USB Keyboard",
    "Standard Optical Mouse",
    "DisplayPort to HDMI Cable",
    "Ethernet Cat6 Patch Cable (3m)",
    "USB-C Multi-port Adapter Hub",
    "Standard 3-Prong Power Cable"
  ],
  "Other": [
    "UPS / Battery Backup Unit",
    "Webcam HD 1080p",
    "Barcode Scanner Handheld",
    "Other Device (Specify in Remarks)"
  ]
};

const TRANSACTION_TYPES = [
  "Issuance",
  "Return",
  "Replacement",
  "Disposal",
  "Transfer",
  "Temporary Loan",
  "Repair Turnover",
  "Hardware Upgrade"
];

const ACCOUNTS = [
  "Concentrix Internal / IT Ops",
  "Retail Support Account",
  "FinTech & Banking Services",
  "Healthcare Solutions",
  "Telco Customer Care",
  "Tech Support Tier 1/2",
  "E-Commerce & Logistics",
  "Travel & Hospitality Services"
];

// Date and Time formatting
function getFormattedTimestamp(dateObj = new Date()) {
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const form = document.getElementById('masterLogbookForm');
  const liveClockDisplay = document.getElementById('liveClockDisplay');
  const autoDatePill = document.getElementById('autoDatePill');
  
  const ticketInput = document.getElementById('ticketNumber');
  const ticketCount = document.getElementById('ticketCount');
  
  const transactionInput = document.getElementById('transactionType');
  const transactionDropdown = document.getElementById('transactionDropdown');
  
  const assetTypeSelect = document.getElementById('assetType');
  const assetModelSelect = document.getElementById('assetModel');
  
  const serialInput = document.getElementById('serialNumber');
  const serialCount = document.getElementById('serialCount');
  
  const quantityInput = document.getElementById('quantity');
  const assetStatusSelect = document.getElementById('assetStatus');
  
  const accountInput = document.getElementById('account');
  const accountDropdown = document.getElementById('accountDropdown');
  
  const fullNameInput = document.getElementById('fullName');
  
  const workdayInput = document.getElementById('workdayId');
  const workdayCount = document.getElementById('workdayCount');
  
  const emailInput = document.getElementById('emailAddress');
  const remarksInput = document.getElementById('remarks');
  const resetBtn = document.getElementById('resetBtn');

  // Table & Controls
  const tableSearch = document.getElementById('tableSearch');
  const exportBtn = document.getElementById('exportBtn');
  const clearLogBtn = document.getElementById('clearLogBtn');
  const recordCount = document.getElementById('recordCount');
  const emptyState = document.getElementById('emptyState');
  const recordsTable = document.getElementById('recordsTable');
  const tableBody = document.getElementById('tableBody');

  // Receipt Modal
  const receiptModal = document.getElementById('receiptModal');
  const modalDetails = document.getElementById('modalDetails');
  const closeModalBtn = document.getElementById('closeModalBtn');

  // Live Clock & Auto-Date Preview
  function updateLiveClock() {
    const nowStr = getFormattedTimestamp();
    if (liveClockDisplay) {
      liveClockDisplay.textContent = nowStr;
    }
    if (autoDatePill) {
      autoDatePill.textContent = `${nowStr} (Auto)`;
    }
  }
  updateLiveClock();
  setInterval(updateLiveClock, 1000);

  // Character Limit Helper
  function initCharCounter(inputEl, counterEl, maxLimit) {
    inputEl.setAttribute('maxlength', maxLimit);
    const handler = () => {
      const len = inputEl.value.length;
      counterEl.textContent = `${len}/${maxLimit}`;
      if (len >= maxLimit) {
        counterEl.classList.add('limit-reached');
      } else {
        counterEl.classList.remove('limit-reached');
      }
    };
    inputEl.addEventListener('input', handler);
    handler();
  }

  // 2. Ticket Number (20 chars max)
  initCharCounter(ticketInput, ticketCount, 20);

  // 6. Serial Number (25 chars max)
  initCharCounter(serialInput, serialCount, 25);

  // 11. Workday ID (12 chars max)
  initCharCounter(workdayInput, workdayCount, 12);

  // 5. Populate Asset Models dynamically based on 4. Type of Asset
  function populateModels(type) {
    assetModelSelect.innerHTML = '<option value="" disabled selected>Select an asset model...</option>';
    const models = ASSET_MODELS[type] || [];
    
    models.forEach(model => {
      const opt = document.createElement('option');
      opt.value = model;
      opt.textContent = model;
      assetModelSelect.appendChild(opt);
    });

    const customOpt = document.createElement('option');
    customOpt.value = "Other / Custom Model";
    customOpt.textContent = "— Other / Unlisted Model —";
    assetModelSelect.appendChild(customOpt);
  }

  // Initialize with Headset models (default)
  populateModels(assetTypeSelect.value);

  assetTypeSelect.addEventListener('change', (e) => {
    populateModels(e.target.value);
  });

  // Reusable Searchable Auto-Filter Combobox
  function setupAutoFilter(inputEl, dropdownEl, itemsList) {
    function showMatches(filterText = '') {
      const q = filterText.trim().toLowerCase();
      const matches = itemsList.filter(item => item.toLowerCase().includes(q));
      dropdownEl.innerHTML = '';

      if (matches.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'autocomplete-empty';
        emptyDiv.textContent = 'No matching items';
        dropdownEl.appendChild(emptyDiv);
      } else {
        matches.forEach(item => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'autocomplete-item';
          itemDiv.textContent = item;
          itemDiv.addEventListener('mousedown', (e) => {
            e.preventDefault();
            inputEl.value = item;
            dropdownEl.classList.remove('open');
          });
          dropdownEl.appendChild(itemDiv);
        });
      }
    }

    inputEl.addEventListener('focus', () => {
      showMatches(inputEl.value);
      dropdownEl.classList.add('open');
    });

    inputEl.addEventListener('input', () => {
      showMatches(inputEl.value);
      dropdownEl.classList.add('open');
    });

    inputEl.addEventListener('blur', () => {
      setTimeout(() => {
        dropdownEl.classList.remove('open');
      }, 150);
    });
  }

  // 3. Transaction Type (Auto-Filtered)
  setupAutoFilter(transactionInput, transactionDropdown, TRANSACTION_TYPES);

  // 9. Account (Auto-Filtered)
  setupAutoFilter(accountInput, accountDropdown, ACCOUNTS);

  // 10. Name Format Validation ("Last Name, First Name M.I.")
  fullNameInput.addEventListener('blur', () => {
    const val = fullNameInput.value.trim();
    if (val && !val.includes(',')) {
      fullNameInput.setCustomValidity('Please follow the format: Last Name, First Name M.I.');
    } else {
      fullNameInput.setCustomValidity('');
    }
  });

  // LocalStorage Persistence
  const STORAGE_KEY = 'upa_it_master_logbook_v4';
  let entries = [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      entries = JSON.parse(raw);
    }
  } catch (err) {
    entries = [];
  }

  // Render Logbook Records Table
  function renderTable(filterQuery = '') {
    const q = filterQuery.trim().toLowerCase();
    const filtered = entries.filter(e => {
      if (!q) return true;
      return (
        e.ticketNumber.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.serialNumber.toLowerCase().includes(q) ||
        e.account.toLowerCase().includes(q) ||
        e.assetType.toLowerCase().includes(q) ||
        e.assetModel.toLowerCase().includes(q)
      );
    });

    recordCount.textContent = `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`;

    if (entries.length === 0) {
      emptyState.style.display = 'block';
      recordsTable.style.display = 'none';
      tableBody.innerHTML = '';
      return;
    }

    emptyState.style.display = 'none';
    recordsTable.style.display = 'table';

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
            No matching records found for "${filterQuery}"
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(row => `
      <tr>
        <td><strong>${escapeHtml(row.ticketNumber)}</strong></td>
        <td>${escapeHtml(row.timestamp)}</td>
        <td>${escapeHtml(row.name)}</td>
        <td><span class="status-pill">${escapeHtml(row.transactionType)}</span></td>
        <td>${escapeHtml(row.assetType)}</td>
        <td>${escapeHtml(row.assetModel)}</td>
        <td><span class="code-cell">${escapeHtml(row.serialNumber)}</span></td>
        <td>${row.quantity}</td>
        <td>${escapeHtml(row.account)}</td>
        <td><span class="status-pill ${row.assetStatus.includes('Working') ? 'status-working' : ''}">${escapeHtml(row.assetStatus)}</span></td>
      </tr>
    `).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  renderTable();

  // Search Filter
  tableSearch.addEventListener('input', (e) => {
    renderTable(e.target.value);
  });

  // Export CSV
  exportBtn.addEventListener('click', () => {
    if (entries.length === 0) {
      alert('No records to export.');
      return;
    }

    const headers = [
      "Ticket Number",
      "Timestamp",
      "Name",
      "Workday ID",
      "Email",
      "Transaction Type",
      "Asset Type",
      "Asset Model",
      "Serial Number",
      "Quantity",
      "Asset Status",
      "Account",
      "Remarks"
    ];

    const rows = entries.map(item => [
      `"${(item.ticketNumber || '').replace(/"/g, '""')}"`,
      `"${(item.timestamp || '').replace(/"/g, '""')}"`,
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${(item.workdayId || '').replace(/"/g, '""')}"`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${(item.transactionType || '').replace(/"/g, '""')}"`,
      `"${(item.assetType || '').replace(/"/g, '""')}"`,
      `"${(item.assetModel || '').replace(/"/g, '""')}"`,
      `"${(item.serialNumber || '').replace(/"/g, '""')}"`,
      item.quantity,
      `"${(item.assetStatus || '').replace(/"/g, '""')}"`,
      `"${(item.account || '').replace(/"/g, '""')}"`,
      `"${(item.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `UPA_IT_Master_Logbook_V4_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Clear Log
  clearLogBtn.addEventListener('click', () => {
    if (entries.length === 0) return;
    if (confirm('Are you sure you want to clear all local logbook records?')) {
      entries = [];
      localStorage.removeItem(STORAGE_KEY);
      renderTable();
    }
  });

  // Form Reset
  resetBtn.addEventListener('click', () => {
    form.reset();
    assetTypeSelect.value = "Headset";
    populateModels("Headset");
    initCharCounter(ticketInput, ticketCount, 20);
    initCharCounter(serialInput, serialCount, 25);
    initCharCounter(workdayInput, workdayCount, 12);
  });

  // Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate Name format
    const nameVal = fullNameInput.value.trim();
    if (!nameVal.includes(',')) {
      alert('Please enter your name in the format: Last Name, First Name M.I. (e.g. Dela Cruz, Juan M.)');
      fullNameInput.focus();
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // 1. DATE: Automatically captured on submission
    const recordedTimestamp = getFormattedTimestamp();

    const record = {
      id: Date.now(),
      timestamp: recordedTimestamp,
      ticketNumber: ticketInput.value.trim(),
      transactionType: transactionInput.value.trim(),
      assetType: assetTypeSelect.value,
      assetModel: assetModelSelect.value,
      serialNumber: serialInput.value.trim(),
      quantity: 1, // Fixed per requirements
      assetStatus: assetStatusSelect.value,
      account: accountInput.value.trim(),
      name: nameVal,
      workdayId: workdayInput.value.trim(),
      email: emailInput.value.trim(),
      remarks: remarksInput.value.trim() || 'None'
    };

    // Store record
    entries.unshift(record);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (err) {}

    renderTable();

    // Populate Modal
    modalDetails.innerHTML = `
      <div class="modal-label">Timestamp:</div>
      <div class="modal-val">${record.timestamp} <span style="font-size:0.7rem; color:var(--text-muted);">(Auto-Filled)</span></div>

      <div class="modal-label">Ticket #:</div>
      <div class="modal-val"><strong>${escapeHtml(record.ticketNumber)}</strong></div>

      <div class="modal-label">Transaction:</div>
      <div class="modal-val">${escapeHtml(record.transactionType)}</div>

      <div class="modal-label">Asset:</div>
      <div class="modal-val">${escapeHtml(record.assetType)} &bull; ${escapeHtml(record.assetModel)}</div>

      <div class="modal-label">Serial Number:</div>
      <div class="modal-val"><span class="code-cell">${escapeHtml(record.serialNumber)}</span></div>

      <div class="modal-label">Quantity:</div>
      <div class="modal-val">1 (Fixed)</div>

      <div class="modal-label">Asset Status:</div>
      <div class="modal-val">${escapeHtml(record.assetStatus)}</div>

      <div class="modal-label">Account:</div>
      <div class="modal-val">${escapeHtml(record.account)}</div>

      <div class="modal-label">Custodian Name:</div>
      <div class="modal-val">${escapeHtml(record.name)}</div>

      <div class="modal-label">Workday ID:</div>
      <div class="modal-val">${escapeHtml(record.workdayId)}</div>

      <div class="modal-label">Email:</div>
      <div class="modal-val">${escapeHtml(record.email)}</div>

      <div class="modal-label">Remarks:</div>
      <div class="modal-val">${escapeHtml(record.remarks)}</div>
    `;

    receiptModal.classList.add('active');
    receiptModal.setAttribute('aria-hidden', 'false');

    // Reset fields while keeping standard defaults
    form.reset();
    assetTypeSelect.value = "Headset";
    populateModels("Headset");
    initCharCounter(ticketInput, ticketCount, 20);
    initCharCounter(serialInput, serialCount, 25);
    initCharCounter(workdayInput, workdayCount, 12);
  });

  // Modal Close
  closeModalBtn.addEventListener('click', () => {
    receiptModal.classList.remove('active');
    receiptModal.setAttribute('aria-hidden', 'true');
  });

  receiptModal.addEventListener('click', (e) => {
    if (e.target === receiptModal) {
      receiptModal.classList.remove('active');
      receiptModal.setAttribute('aria-hidden', 'true');
    }
  });

  // Role Switcher
  const roleSelect = document.getElementById('roleSelect');
  if (roleSelect) {
    roleSelect.addEventListener('change', (e) => {
      const isAd = e.target.value === 'admin';
      document.querySelector('.brand-tag').textContent = isAd ? 'IT ADMIN CONSOLE' : 'IT OPERATIONS';
    });
  }
});
