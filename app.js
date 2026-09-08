// Asset Models lookup
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

// Helper to format date & time upon submission
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

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const form = document.getElementById('masterLogbookForm');
  
  const ticketInput = document.getElementById('ticketNumber');
  const ticketCount = document.getElementById('ticketCount');
  
  const transactionInput = document.getElementById('transactionType');
  const transactionDropdown = document.getElementById('transactionDropdown');
  
  const assetTypeSelect = document.getElementById('assetType');
  const assetModelSelect = document.getElementById('assetModel');
  
  const serialInput = document.getElementById('serialNumber');
  const serialCount = document.getElementById('serialCount');
  
  const assetStatusSelect = document.getElementById('assetStatus');
  
  const accountInput = document.getElementById('account');
  const accountDropdown = document.getElementById('accountDropdown');
  
  const fullNameInput = document.getElementById('fullName');
  
  const workdayInput = document.getElementById('workdayId');
  const workdayCount = document.getElementById('workdayCount');
  
  const emailInput = document.getElementById('emailAddress');
  const remarksInput = document.getElementById('remarks');
  const resetBtn = document.getElementById('resetBtn');

  // Modal
  const receiptModal = document.getElementById('receiptModal');
  const modalDetails = document.getElementById('modalDetails');
  const closeModalBtn = document.getElementById('closeModalBtn');

  // Character Limit Counters
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

  initCharCounter(ticketInput, ticketCount, 20);
  initCharCounter(serialInput, serialCount, 25);
  initCharCounter(workdayInput, workdayCount, 12);

  // Populate Asset Models dynamically
  function populateModels(type) {
    assetModelSelect.innerHTML = '<option value="" disabled selected>Select model...</option>';
    const models = ASSET_MODELS[type] || [];
    
    models.forEach(model => {
      const opt = document.createElement('option');
      opt.value = model;
      opt.textContent = model;
      assetModelSelect.appendChild(opt);
    });

    const customOpt = document.createElement('option');
    customOpt.value = "Other / Custom Model";
    customOpt.textContent = "— Other Model —";
    assetModelSelect.appendChild(customOpt);
  }

  // Initialize with Headset
  populateModels(assetTypeSelect.value);

  assetTypeSelect.addEventListener('change', (e) => {
    populateModels(e.target.value);
  });

  // Auto-Filter Combobox
  function setupAutoFilter(inputEl, dropdownEl, itemsList) {
    function showMatches(filterText = '') {
      const q = filterText.trim().toLowerCase();
      const matches = itemsList.filter(item => item.toLowerCase().includes(q));
      dropdownEl.innerHTML = '';

      if (matches.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'autocomplete-empty';
        emptyDiv.textContent = 'No matching options';
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

  setupAutoFilter(transactionInput, transactionDropdown, TRANSACTION_TYPES);
  setupAutoFilter(accountInput, accountDropdown, ACCOUNTS);

  // Name Format Validation ("Last Name, First Name M.I.")
  fullNameInput.addEventListener('blur', () => {
    const val = fullNameInput.value.trim();
    if (val && !val.includes(',')) {
      fullNameInput.setCustomValidity('Please follow the format: Last Name, First Name M.I.');
    } else {
      fullNameInput.setCustomValidity('');
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
      alert('Please enter Name in the format: Last Name, First Name M.I.');
      fullNameInput.focus();
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Auto-filled date & timestamp on submission
    const submissionTime = getFormattedTimestamp();

    const record = {
      timestamp: submissionTime,
      ticketNumber: ticketInput.value.trim(),
      transactionType: transactionInput.value.trim(),
      assetType: assetTypeSelect.value,
      assetModel: assetModelSelect.value,
      serialNumber: serialInput.value.trim(),
      quantity: 1,
      assetStatus: assetStatusSelect.value,
      account: accountInput.value.trim(),
      name: nameVal,
      workdayId: workdayInput.value.trim(),
      email: emailInput.value.trim(),
      remarks: remarksInput.value.trim() || 'None'
    };

    // Populate Receipt Modal
    modalDetails.innerHTML = `
      <div class="modal-label">Date &amp; Time:</div>
      <div class="modal-val">${record.timestamp}</div>

      <div class="modal-label">Ticket Number:</div>
      <div class="modal-val"><strong>${escapeHtml(record.ticketNumber)}</strong></div>

      <div class="modal-label">Transaction:</div>
      <div class="modal-val">${escapeHtml(record.transactionType)}</div>

      <div class="modal-label">Asset:</div>
      <div class="modal-val">${escapeHtml(record.assetType)} &bull; ${escapeHtml(record.assetModel)}</div>

      <div class="modal-label">Serial Number:</div>
      <div class="modal-val"><code>${escapeHtml(record.serialNumber)}</code></div>

      <div class="modal-label">Quantity:</div>
      <div class="modal-val">1</div>

      <div class="modal-label">Status:</div>
      <div class="modal-val">${escapeHtml(record.assetStatus)}</div>

      <div class="modal-label">Account:</div>
      <div class="modal-val">${escapeHtml(record.account)}</div>

      <div class="modal-label">Name:</div>
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

    // Reset form fields
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
});
