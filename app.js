// Data models & lookups
const ASSET_MODELS = {
  "Headset": [
    "Jabra Biz 1100 Duo",
    "Jabra Biz 1500 Mono",
    "Jabra Biz 1500 Duo",
    "Jabra Biz 2300 USB",
    "Jabra Evolve 20 Stereo",
    "Plantronics Blackwire C3220",
    "Logitech H390"
  ],
  "Laptop": [
    "Dell Latitude 5420",
    "Dell Latitude 3420",
    "HP EliteBook 840 G8",
    "HP ProBook 450 G8",
    "Lenovo ThinkPad L14 Gen 2"
  ],
  "Desktop / CPU": [
    "Dell OptiPlex 7080 SFF",
    "Dell OptiPlex 3080",
    "HP ProDesk 400 G6",
    "Lenovo ThinkCentre M70s"
  ],
  "Monitor": [
    "Dell E2216HV 21.5\"",
    "Dell SE2422H 24\"",
    "HP P22v G4 21.5\"",
    "ViewSonic VA2261H"
  ],
  "Peripherals": [
    "Standard USB Keyboard",
    "Standard Optical Mouse",
    "DisplayPort to HDMI Cable",
    "Ethernet Cat6 Cable (3m)",
    "USB-C Multi-port Adapter",
    "Power Cable (3-prong)"
  ],
  "Other": [
    "UPS / Battery Backup Unit",
    "Webcam HD 1080p",
    "Other Device (Specify in Remarks)"
  ]
};

const TRANSACTION_TYPES = [
  "Issuance",
  "Return",
  "Replacement",
  "Disposal",
  "Transfer",
  "Temporary Loan"
];

const ACCOUNTS = [
  "Concentrix Internal / Ops",
  "Retail Support Account",
  "FinTech & Banking Services",
  "Healthcare Solutions",
  "Telco Customer Care",
  "Tech Support Tier 1/2",
  "E-Commerce Logistics",
  "Travel & Hospitality"
];

// Helper to format date
function getFormattedDateTime(d = new Date()) {
  return d.toLocaleString('en-US', {
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
  const form = document.getElementById('assetForm');
  const dateDisplay = document.getElementById('dateDisplay');
  const ticketInput = document.getElementById('ticketNumber');
  const ticketCounter = document.getElementById('ticketCounter');
  const serialInput = document.getElementById('serialNumber');
  const serialCounter = document.getElementById('serialCounter');
  const workdayInput = document.getElementById('workdayId');
  const workdayCounter = document.getElementById('workdayCounter');
  const assetTypeSelect = document.getElementById('assetType');
  const assetModelSelect = document.getElementById('assetModel');
  const transactionInput = document.getElementById('transactionType');
  const transactionList = document.getElementById('transactionDatalist');
  const accountInput = document.getElementById('accountInput');
  const accountList = document.getElementById('accountDatalist');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const submissionDetails = document.getElementById('submissionDetails');
  const historyTableBody = document.getElementById('historyTableBody');
  const emptyHistory = document.getElementById('emptyHistory');
  const historyTableContainer = document.getElementById('historyTableContainer');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const roleSelect = document.getElementById('roleSelect');
  const adminBadge = document.getElementById('adminBadge');

  // Live system date indicator
  function updateLiveClock() {
    if (dateDisplay) {
      dateDisplay.value = `${getFormattedDateTime()} (Auto-filled on submit)`;
    }
  }
  updateLiveClock();
  setInterval(updateLiveClock, 30000);

  // Setup Character Counters
  function setupCounter(input, counterEl, max) {
    input.setAttribute('maxlength', max);
    const update = () => {
      const len = input.value.length;
      counterEl.textContent = `${len} / ${max}`;
      if (len >= max) {
        counterEl.classList.add('limit-reached');
      } else {
        counterEl.classList.remove('limit-reached');
      }
    };
    input.addEventListener('input', update);
    update();
  }

  setupCounter(ticketInput, ticketCounter, 20);
  setupCounter(serialInput, serialCounter, 25);
  setupCounter(workdayInput, workdayCounter, 12);

  // Populate Asset Models according to selected Asset Type
  function populateModels(selectedType) {
    assetModelSelect.innerHTML = '<option value="" disabled selected>Select an asset model</option>';
    
    let models = [];
    if (selectedType && ASSET_MODELS[selectedType]) {
      models = ASSET_MODELS[selectedType];
    } else {
      // Flatten all models
      Object.values(ASSET_MODELS).forEach(list => models.push(...list));
    }

    models.forEach(model => {
      const opt = document.createElement('option');
      opt.value = model;
      opt.textContent = model;
      assetModelSelect.appendChild(opt);
    });

    const otherOpt = document.createElement('option');
    otherOpt.value = "Other Model";
    otherOpt.textContent = "— Other / Unlisted Model —";
    assetModelSelect.appendChild(otherOpt);
  }

  // Initial population of models (defaults to Headset as in document)
  populateModels(assetTypeSelect.value);

  assetTypeSelect.addEventListener('change', (e) => {
    populateModels(e.target.value);
  });

  // Reusable Auto-Filter Setup for text inputs with popup list
  function setupAutoFilter(inputEl, datalistEl, items) {
    function renderList(query = '') {
      const filtered = items.filter(item => 
        item.toLowerCase().includes(query.trim().toLowerCase())
      );
      datalistEl.innerHTML = '';
      if (filtered.length === 0) {
        const div = document.createElement('div');
        div.className = 'filter-item';
        div.style.color = '#94a3b8';
        div.textContent = 'No matching options';
        datalistEl.appendChild(div);
      } else {
        filtered.forEach(item => {
          const div = document.createElement('div');
          div.className = 'filter-item';
          div.textContent = item;
          div.addEventListener('mousedown', (evt) => {
            evt.preventDefault();
            inputEl.value = item;
            datalistEl.classList.remove('open');
          });
          datalistEl.appendChild(div);
        });
      }
    }

    inputEl.addEventListener('focus', () => {
      renderList(inputEl.value);
      datalistEl.classList.add('open');
    });

    inputEl.addEventListener('input', () => {
      renderList(inputEl.value);
      datalistEl.classList.add('open');
    });

    inputEl.addEventListener('blur', () => {
      setTimeout(() => {
        datalistEl.classList.remove('open');
      }, 150);
    });
  }

  setupAutoFilter(transactionInput, transactionList, TRANSACTION_TYPES);
  setupAutoFilter(accountInput, accountList, ACCOUNTS);

  // Load Submissions History from localStorage
  let submissions = [];
  try {
    const saved = localStorage.getItem('upa_submissions');
    if (saved) {
      submissions = JSON.parse(saved);
    }
  } catch (err) {
    submissions = [];
  }

  function renderHistory() {
    if (!historyTableBody) return;
    if (submissions.length === 0) {
      emptyHistory.style.display = 'block';
      historyTableContainer.style.display = 'none';
      historyTableBody.innerHTML = '';
    } else {
      emptyHistory.style.display = 'none';
      historyTableContainer.style.display = 'block';
      historyTableBody.innerHTML = submissions.map((item, idx) => `
        <tr>
          <td><span style="font-weight:600;">${item.ticketNumber}</span></td>
          <td>${item.submissionDate}</td>
          <td>${item.name}</td>
          <td><span class="role-pill">${item.transactionType}</span></td>
          <td>${item.assetType}</td>
          <td>${item.assetModel}</td>
          <td><code>${item.serialNumber}</code></td>
          <td>${item.account}</td>
          <td>${item.assetStatus}</td>
        </tr>
      `).join('');
    }
  }

  renderHistory();

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Clear local submission history log?')) {
        submissions = [];
        localStorage.removeItem('upa_submissions');
        renderHistory();
      }
    });
  }

  // Format validation helper for Last Name, First Name M.I.
  const nameInput = document.getElementById('employeeName');
  nameInput.addEventListener('blur', () => {
    const val = nameInput.value.trim();
    if (val && !val.includes(',')) {
      nameInput.setCustomValidity('Please follow the format: Last Name, First Name M.I. (e.g. Dela Cruz, Juan M.)');
    } else {
      nameInput.setCustomValidity('');
    }
  });

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Check name format requirement
    const nameVal = nameInput.value.trim();
    if (!nameVal.includes(',')) {
      alert('Please use the requested format for Name: "Last Name, First Name M.I."');
      nameInput.focus();
      return;
    }

    const currentTimestamp = getFormattedDateTime();

    const record = {
      id: Date.now(),
      submissionDate: currentTimestamp,
      ticketNumber: ticketInput.value.trim(),
      transactionType: transactionInput.value.trim(),
      assetType: assetTypeSelect.value,
      assetModel: assetModelSelect.value,
      serialNumber: serialInput.value.trim(),
      quantity: 1, // Fixed per requirements
      assetStatus: document.getElementById('assetStatus').value,
      account: accountInput.value.trim(),
      name: nameVal,
      workdayId: workdayInput.value.trim(),
      remarks: document.getElementById('remarks').value.trim() || 'N/A',
      email: document.getElementById('userEmail').value.trim()
    };

    // Save to history list
    submissions.unshift(record);
    try {
      localStorage.setItem('upa_submissions', JSON.stringify(submissions));
    } catch(e) {}
    renderHistory();

    // Render Modal Preview
    submissionDetails.innerHTML = `
      <tr>
        <td>System Submission Date:</td>
        <td><span style="color: var(--primary);">${record.submissionDate}</span> (Auto-Filled)</td>
      </tr>
      <tr>
        <td>Ticket Number:</td>
        <td>${record.ticketNumber}</td>
      </tr>
      <tr>
        <td>Transaction Type:</td>
        <td><span class="role-pill">${record.transactionType}</span></td>
      </tr>
      <tr>
        <td>Asset Type:</td>
        <td>${record.assetType}</td>
      </tr>
      <tr>
        <td>Asset Model:</td>
        <td>${record.assetModel}</td>
      </tr>
      <tr>
        <td>Serial Number:</td>
        <td><code>${record.serialNumber}</code></td>
      </tr>
      <tr>
        <td>Quantity:</td>
        <td><strong>${record.quantity}</strong> (Fixed)</td>
      </tr>
      <tr>
        <td>Asset Status:</td>
        <td>${record.assetStatus}</td>
      </tr>
      <tr>
        <td>Account:</td>
        <td>${record.account}</td>
      </tr>
      <tr>
        <td>Employee Name:</td>
        <td>${record.name}</td>
      </tr>
      <tr>
        <td>Workday ID:</td>
        <td>${record.workdayId}</td>
      </tr>
      <tr>
        <td>Concentrix / Personal Email:</td>
        <td>${record.email}</td>
      </tr>
      <tr>
        <td>Remarks:</td>
        <td>${record.remarks}</td>
      </tr>
    `;

    modalBackdrop.classList.add('active');

    // Reset form fields while preserving defaults
    form.reset();
    assetTypeSelect.value = "Headset";
    populateModels("Headset");
    setupCounter(ticketInput, ticketCounter, 20);
    setupCounter(serialInput, serialCounter, 25);
    setupCounter(workdayInput, workdayCounter, 12);
    updateLiveClock();
  });

  // Close modal
  closeModalBtn.addEventListener('click', () => {
    modalBackdrop.classList.remove('active');
  });

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      modalBackdrop.classList.remove('active');
    }
  });

  // Role Access Switcher (Addressing question for Sir Nani: Intern vs Admin dashboard)
  if (roleSelect && adminBadge) {
    roleSelect.addEventListener('change', (e) => {
      if (e.target.value === 'admin') {
        adminBadge.textContent = 'Admin Dashboard View';
        adminBadge.style.background = '#fef3c7';
        adminBadge.style.color = '#92400e';
        adminBadge.style.borderColor = '#fde68a';
      } else {
        adminBadge.textContent = 'Intern Form View';
        adminBadge.style.background = 'var(--primary-light)';
        adminBadge.style.color = 'var(--primary)';
        adminBadge.style.borderColor = 'var(--primary-border)';
      }
    });
  }
});
