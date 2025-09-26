document.addEventListener('DOMContentLoaded', () => {
    // ---- DOM ELEMENTLERİ ----
    const views = {
        auth: document.getElementById('auth-view'),
        app: document.getElementById('app-view')
    };
    
    const contentViews = {
        overview: document.getElementById('overview-view'),
        accounts: document.getElementById('accounts-view'),
        budget: document.getElementById('budget-view'),
        investments: document.getElementById('investments-view'),
        reports: document.getElementById('reports-view')
    };

    const modalOverlay = document.getElementById('modal-overlay');
    const modalBoxes = {
        settings: document.getElementById('settings-view'),
        manualTx: document.getElementById('manual-tx-modal'),
        welcome: document.getElementById('welcome-back-modal'),
        account: document.getElementById('account-modal'),
        transaction: document.getElementById('transaction-modal'),
        investment: document.getElementById('investment-modal')
    };

    // Auth elements
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const loginBtn = document.getElementById('login-btn');
    const registerUsernameInput = document.getElementById('register-username');
    const registerPasswordInput = document.getElementById('register-password');
    const registerBtn = document.getElementById('register-btn');

    // Navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const accountsBtn = document.getElementById('accounts-btn');
    const reportsBtn = document.getElementById('reports-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Overview elements
    const netWorthEl = document.getElementById('net-worth');
    const totalSavingsEl = document.getElementById('total-savings');
    const totalDebtEl = document.getElementById('total-debt');
    const monthlyReturnEl = document.getElementById('monthly-return');
    const netWorthChangeEl = document.getElementById('net-worth-change');
    const savingsChangeEl = document.getElementById('savings-change');
    const debtChangeEl = document.getElementById('debt-change');
    const returnChangeEl = document.getElementById('return-change');

    // Accounts elements
    const accountsContainer = document.getElementById('accounts-container');
    const addAccountBtn = document.getElementById('add-account-btn');

    // Budget elements
    const monthlyBudgetEl = document.getElementById('monthly-budget');
    const budgetRemainingEl = document.getElementById('budget-remaining');
    const budgetUsageEl = document.getElementById('budget-usage');
    const budgetCategoriesEl = document.getElementById('budget-categories');

    // Investments elements
    const portfolioValueEl = document.getElementById('portfolio-value');
    const totalReturnEl = document.getElementById('total-return');
    const returnRateEl = document.getElementById('return-rate');
    const investmentsContainer = document.getElementById('investments-container');
    const addInvestmentBtn = document.getElementById('add-investment-btn');

    // Quick actions
    const actionBtns = document.querySelectorAll('.action-btn');

    // Modal elements
    const accountModalTitle = document.getElementById('account-modal-title');
    const accountNameInput = document.getElementById('account-name');
    const accountTypeSelect = document.getElementById('account-type');
    const accountBalanceInput = document.getElementById('account-balance');
    const accountColorInput = document.getElementById('account-color');
    const saveAccountBtn = document.getElementById('save-account-btn');
    const cancelAccountBtn = document.getElementById('cancel-account-btn');

    const transactionModalTitle = document.getElementById('transaction-modal-title');
    const transactionTypeSelect = document.getElementById('transaction-type');
    const transactionAccountSelect = document.getElementById('transaction-account');
    const transactionCategorySelect = document.getElementById('transaction-category');
    const transactionAmountInput = document.getElementById('transaction-amount');
    const transactionDateInput = document.getElementById('transaction-date');
    const transactionDescriptionInput = document.getElementById('transaction-description');
    const saveTransactionBtn = document.getElementById('save-transaction-btn');
    const cancelTransactionBtn = document.getElementById('cancel-transaction-btn');

    const investmentTypeSelect = document.getElementById('investment-type');
    const investmentNameInput = document.getElementById('investment-name');
    const investmentQuantityInput = document.getElementById('investment-quantity');
    const investmentPriceInput = document.getElementById('investment-price');
    const investmentDateInput = document.getElementById('investment-date');
    const saveInvestmentBtn = document.getElementById('save-investment-btn');
    const cancelInvestmentBtn = document.getElementById('cancel-investment-btn');

    // Charts
    let assetChart, incomeExpenseChart;

    // ---- UYGULAMA DEĞİŞKENLERİ ----
    let currentUser = null;
    let updateInterval = null;
    let currentManualTxType = null;
    let editingAccountId = null;
    let editingInvestmentId = null;
    let lastValues = { 
        netWorth: 0, 
        savings: 0, 
        debt: 0, 
        monthlyReturn: 0 
    };

    // ---- YARDIMCI FONKSİYONLAR ----
    const showView = (viewId) => {
        Object.values(views).forEach(view => view.classList.remove('active-view'));
        views[viewId].classList.add('active-view');
    };

    const showContentView = (contentViewId) => {
        Object.values(contentViews).forEach(view => view.classList.remove('active'));
        contentViews[contentViewId].classList.add('active');
        
        // Nav button active state
        navBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${contentViewId}"]`).classList.add('active');
    };

    const showModal = (modalId) => {
        Object.values(modalBoxes).forEach(box => box.style.display = 'none');
        if (modalId) {
            modalBoxes[modalId].style.display = 'block';
            modalOverlay.style.display = 'flex';
        } else {
            modalOverlay.style.display = 'none';
            resetModalForms();
        }
    };

    const resetModalForms = () => {
        editingAccountId = null;
        editingInvestmentId = null;
        accountNameInput.value = '';
        accountBalanceInput.value = '';
        accountColorInput.value = '#007bff';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('tr-TR', { 
            style: 'currency', 
            currency: 'TRY',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatPercent = (value) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    };

    const getStorageKey = (key) => `${currentUser}_${key}`;

    const animateValue = (element, start, end, duration = 1000) => {
        if (start === end) return;
        
        const range = end - start;
        const startTime = performance.now();
        
        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = start + (range * progress);
            element.textContent = formatCurrency(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };
        
        requestAnimationFrame(updateValue);
    };

    // ---- VERİ YÖNETİMİ ----
    const initializeUserData = () => {
        const defaultData = {
            accounts: [
                {
                    id: 'default-checking',
                    name: 'Ana Hesap',
                    type: 'checking',
                    balance: 0,
                    color: '#007bff',
                    createdAt: Date.now()
                }
            ],
            transactions: [],
            investments: [],
            budget: {
                monthly: 0,
                categories: [
                    { name: 'Yemek', allocated: 0, spent: 0 },
                    { name: 'Ulaşım', allocated: 0, spent: 0 },
                    { name: 'Eğlence', allocated: 0, spent: 0 },
                    { name: 'Faturalar', allocated: 0, spent: 0 }
                ]
            },
            settings: {
                saatlikBirikim: 10,
                baslangicBorc: 5000,
                baslangicTarihi: new Date().toISOString().slice(0, 16)
            },
            state: {
                guncelBirikim: 0,
                guncelBorc: 5000,
                lastUpdate: Date.now()
            }
        };

        Object.keys(defaultData).forEach(key => {
            if (!localStorage.getItem(getStorageKey(key))) {
                localStorage.setItem(getStorageKey(key), JSON.stringify(defaultData[key]));
            }
        });
    };

    const getUserData = (key) => {
        const data = localStorage.getItem(getStorageKey(key));
        return data ? JSON.parse(data) : (key === 'accounts' ? [] : null);
    };

    const saveUserData = (key, data) => {
        localStorage.setItem(getStorageKey(key), JSON.stringify(data));
    };

    // ---- PROFESYONEL HESAP YÖNETİMİ ----
    const loadAccounts = () => {
        const accounts = getUserData('accounts');
        accountsContainer.innerHTML = '';

        accounts.forEach(account => {
            const accountCard = document.createElement('div');
            accountCard.className = 'account-card fade-in';
            accountCard.innerHTML = `
                <div class="account-header">
                    <div class="account-name">${account.name}</div>
                    <div class="account-type">${getAccountTypeLabel(account.type)}</div>
                </div>
                <div class="account-balance" style="color: ${account.color}">
                    ${formatCurrency(account.balance)}
                </div>
                <div class="account-actions">
                    <button class="account-btn btn-small-secondary" onclick="editAccount('${account.id}')">
                        Düzenle
                    </button>
                    <button class="account-btn btn-small-primary" onclick="addTransactionToAccount('${account.id}')">
                        İşlem Ekle
                    </button>
                </div>
            `;
            accountsContainer.appendChild(accountCard);
        });
    };

    const getAccountTypeLabel = (type) => {
        const types = {
            'checking': 'Vadesiz',
            'savings': 'Tasarruf',
            'investment': 'Yatırım',
            'credit': 'Kredi Kartı',
            'cash': 'Nakit'
        };
        return types[type] || type;
    };

    const editAccount = (accountId) => {
        const accounts = getUserData('accounts');
        const account = accounts.find(acc => acc.id === accountId);
        
        if (account) {
            editingAccountId = accountId;
            accountModalTitle.textContent = 'Hesap Düzenle';
            accountNameInput.value = account.name;
            accountTypeSelect.value = account.type;
            accountBalanceInput.value = account.balance;
            accountColorInput.value = account.color;
            showModal('account');
        }
    };

    const addTransactionToAccount = (accountId) => {
        transactionAccountSelect.value = accountId;
        showModal('transaction');
    };

    const saveAccount = () => {
        const name = accountNameInput.value.trim();
        const type = accountTypeSelect.value;
        const balance = parseFloat(accountBalanceInput.value) || 0;
        const color = accountColorInput.value;

        if (!name) return alert('Hesap adı boş olamaz.');

        let accounts = getUserData('accounts');
        
        if (editingAccountId) {
            // Edit existing account
            accounts = accounts.map(acc => 
                acc.id === editingAccountId ? { ...acc, name, type, balance, color } : acc
            );
        } else {
            // Add new account
            const newAccount = {
                id: 'acc-' + Date.now(),
                name,
                type,
                balance,
                color,
                createdAt: Date.now()
            };
            accounts.push(newAccount);
        }

        saveUserData('accounts', accounts);
        loadAccounts();
        updateDashboard();
        showModal(null);
    };

    // ---- YATIRIM YÖNETİMİ ----
    const loadInvestments = () => {
        const investments = getUserData('investments');
        investmentsContainer.innerHTML = '';

        let totalValue = 0;
        let totalCost = 0;

        investments.forEach(investment => {
            const currentValue = investment.quantity * investment.currentPrice;
            const cost = investment.quantity * investment.purchasePrice;
            const returnAmount = currentValue - cost;
            const returnRate = ((returnAmount / cost) * 100) || 0;

            totalValue += currentValue;
            totalCost += cost;

            const investmentCard = document.createElement('div');
            investmentCard.className = 'investment-card fade-in';
            investmentCard.innerHTML = `
                <div class="investment-header">
                    <div class="investment-name">${investment.name}</div>
                    <div class="investment-type">${getInvestmentTypeLabel(investment.type)}</div>
                </div>
                <div class="investment-details">
                    <div class="investment-detail">
                        <span>Miktar:</span>
                        <span>${investment.quantity}</span>
                    </div>
                    <div class="investment-detail">
                        <span>Alış Fiyatı:</span>
                        <span>${formatCurrency(investment.purchasePrice)}</span>
                    </div>
                    <div class="investment-detail">
                        <span>Güncel Fiyat:</span>
                        <span>${formatCurrency(investment.currentPrice)}</span>
                    </div>
                    <div class="investment-detail">
                        <span>Toplam Değer:</span>
                        <span>${formatCurrency(currentValue)}</span>
                    </div>
                </div>
                <div class="investment-return ${returnAmount >= 0 ? 'return-positive' : 'return-negative'}">
                    ${returnAmount >= 0 ? '↑' : '↓'} ${formatCurrency(Math.abs(returnAmount))} (${returnRate.toFixed(2)}%)
                </div>
            `;
            investmentsContainer.appendChild(investmentCard);
        });

        const totalReturn = totalValue - totalCost;
        const totalReturnRate = ((totalReturn / totalCost) * 100) || 0;

        portfolioValueEl.textContent = formatCurrency(totalValue);
        totalReturnEl.textContent = formatCurrency(totalReturn);
        totalReturnEl.className = totalReturn >= 0 ? 'text-success' : 'text-danger';
        returnRateEl.textContent = formatPercent(totalReturnRate);
        returnRateEl.className = totalReturnRate >= 0 ? 'text-success' : 'text-danger';
    };

    const getInvestmentTypeLabel = (type) => {
        const types = {
            'stock': 'Hisse',
            'fund': 'Fon',
            'crypto': 'Kripto',
            'gold': 'Altın',
            'realestate': 'Emlak'
        };
        return types[type] || type;
    };

    const saveInvestment = () => {
        const type = investmentTypeSelect.value;
        const name = investmentNameInput.value.trim();
        const quantity = parseFloat(investmentQuantityInput.value) || 0;
        const price = parseFloat(investmentPriceInput.value) || 0;
        const date = investmentDateInput.value;

        if (!name || quantity <= 0 || price <= 0 || !date) {
            return alert('Lütfen tüm alanları doğru doldurun.');
        }

        let investments = getUserData('investments');
        
        if (editingInvestmentId) {
            // Edit existing investment
            investments = investments.map(inv =>
                inv.id === editingInvestmentId ? { ...inv, type, name, quantity, purchasePrice: price } : inv
            );
        } else {
            // Add new investment
            const newInvestment = {
                id: 'inv-' + Date.now(),
                type,
                name,
                quantity,
                purchasePrice: price,
                currentPrice: price, // Initially same as purchase price
                purchaseDate: new Date(date).getTime(),
                createdAt: Date.now()
            };
            investments.push(newInvestment);
        }

        saveUserData('investments', investments);
        loadInvestments();
        updateDashboard();
        showModal(null);
    };

    // ---- BÜTÇE YÖNETİMİ ----
    const loadBudget = () => {
        const budget = getUserData('budget');
        const transactions = getUserData('transactions');
        
        monthlyBudgetEl.textContent = formatCurrency(budget.monthly);
        
        // Calculate spent amount from transactions
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlySpent = transactions
            .filter(tx => {
                const txDate = new Date(tx.date);
                return txDate.getMonth() === currentMonth && 
                       txDate.getFullYear() === currentYear &&
                       tx.type === 'expense';
            })
            .reduce((sum, tx) => sum + tx.amount, 0);
        
        const remaining = budget.monthly - monthlySpent;
        const usage = budget.monthly > 0 ? (monthlySpent / budget.monthly) * 100 : 0;
        
        budgetRemainingEl.textContent = formatCurrency(remaining);
        budgetRemainingEl.className = remaining >= 0 ? 'text-success' : 'text-danger';
        budgetUsageEl.textContent = `${usage.toFixed(1)}%`;
        budgetUsageEl.className = usage > 80 ? 'text-danger' : usage > 60 ? 'text-warning' : 'text-success';

        // Update categories
        budgetCategoriesEl.innerHTML = '';
        budget.categories.forEach(category => {
            const categorySpent = transactions
                .filter(tx => tx.category === category.name && tx.type === 'expense')
                .reduce((sum, tx) => sum + tx.amount, 0);
            
            const usagePercent = category.allocated > 0 ? (categorySpent / category.allocated) * 100 : 0;
            
            const categoryEl = document.createElement('div');
            categoryEl.className = 'budget-category';
            categoryEl.innerHTML = `
                <div class="category-header">
                    <div class="category-name">${category.name}</div>
                    <div class="category-amount">${formatCurrency(categorySpent)} / ${formatCurrency(category.allocated)}</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(usagePercent, 100)}%"></div>
                </div>
                <div class="category-info">
                    <span>Kalan: ${formatCurrency(category.allocated - categorySpent)}</span>
                    <span>${usagePercent.toFixed(1)}%</span>
                </div>
            `;
            budgetCategoriesEl.appendChild(categoryEl);
        });
    };

    // ---- DASHBOARD GÜNCELLEME ----
    const updateDashboard = () => {
        const accounts = getUserData('accounts');
        const investments = getUserData('investments');
        const state = getUserData('state');
        
        // Calculate totals
        const totalSavings = accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const totalDebt = state.guncelBorc;
        const netWorth = totalSavings - totalDebt;
        
        // Investment totals
        const portfolioValue = investments.reduce((sum, inv) => 
            sum + (inv.quantity * inv.currentPrice), 0
        );
        
        const totalNetWorth = netWorth + portfolioValue;
        
        // Animate values
        animateValue(netWorthEl, lastValues.netWorth, totalNetWorth);
        animateValue(totalSavingsEl, lastValues.savings, totalSavings);
        animateValue(totalDebtEl, lastValues.debt, totalDebt);
        animateValue(monthlyReturnEl, lastValues.monthlyReturn, portfolioValue * 0.02); // Simulated 2% monthly return
        
        // Update changes
        updateChangeIndicators();
        
        lastValues = {
            netWorth: totalNetWorth,
            savings: totalSavings,
            debt: totalDebt,
            monthlyReturn: portfolioValue * 0.02
        };
        
        updateCharts();
    };

    const updateChangeIndicators = () => {
        // Simulated changes for demo
        const changes = {
            netWorth: 2.5,
            savings: 1.8,
            debt: -0.7,
            return: 3.2
        };
        
        netWorthChangeEl.textContent = formatPercent(changes.netWorth);
        netWorthChangeEl.className = changes.netWorth >= 0 ? 'stat-change positive' : 'stat-change negative';
        
        savingsChangeEl.textContent = formatPercent(changes.savings);
        savingsChangeEl.className = changes.savings >= 0 ? 'stat-change positive' : 'stat-change negative';
        
        debtChangeEl.textContent = formatPercent(changes.debt);
        debtChangeEl.className = changes.debt >= 0 ? 'stat-change positive' : 'stat-change negative';
        
        returnChangeEl.textContent = formatPercent(changes.return);
        returnChangeEl.className = changes.return >= 0 ? 'stat-change positive' : 'stat-change negative';
    };

    const updateCharts = () => {
        const accounts = getUserData('accounts');
        const transactions = getUserData('transactions');
        
        // Asset Distribution Chart
        if (assetChart) assetChart.destroy();
        
        const assetCtx = document.getElementById('asset-chart').getContext('2d');
        assetChart = new Chart(assetCtx, {
            type: 'doughnut',
            data: {
                labels: accounts.map(acc => acc.name),
                datasets: [{
                    data: accounts.map(acc => acc.balance),
                    backgroundColor: accounts.map(acc => acc.color),
                    borderWidth: 2,
                    borderColor: '#121212'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e0e0e0',
                            padding: 20
                        }
                    }
                }
            }
        });
        
        // Income vs Expense Chart
        if (incomeExpenseChart) incomeExpenseChart.destroy();
        
        const incomeExpenseCtx = document.getElementById('income-expense-chart').getContext('2d');
        incomeExpenseChart = new Chart(incomeExpenseCtx, {
            type: 'bar',
            data: {
                labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
                datasets: [
                    {
                        label: 'Gelir',
                        data: [5000, 6000, 5500, 7000, 6500, 8000],
                        backgroundColor: '#28a745',
                        borderColor: '#28a745',
                        borderWidth: 1
                    },
                    {
                        label: 'Gider',
                        data: [4500, 5200, 4800, 6000, 5800, 7200],
                        backgroundColor: '#dc3545',
                        borderColor: '#dc3545',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#a0a0a0'
                        },
                        grid: {
                            color: '#3a3a3a'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#a0a0a0'
                        },
                        grid: {
                            color: '#3a3a3a'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#e0e0e0'
                        }
                    }
                }
            }
        });
    };

    // ---- TEMEL UYGULAMA MANTIĞI (ORJİNAL) ----
    const startCounter = () => {
        if (updateInterval) clearInterval(updateInterval);
        updateValues(); 
        updateInterval = setInterval(updateValues, 1000);
    };

    const updateValues = () => {
        const settings = getUserData('settings');
        const state = getUserData('state');
        if (!settings || !state) { clearInterval(updateInterval); return; }

        const now = Date.now();
        const elapsedMs = now - state.lastUpdate;
        const saniyelikOran = settings.saatlikBirikim / 3600;
        const newBirikim = (elapsedMs / 1000) * saniyelikOran;

        const guncelBirikim = state.guncelBirikim + newBirikim;
        const guncelBorc = Math.max(0, state.guncelBorc - newBirikim);

        // Update state
        const newState = { ...state, guncelBirikim, guncelBorc, lastUpdate: now };
        saveUserData('state', newState);
        
        // Update dashboard
        updateDashboard();
    };

    const handleOfflineProgress = () => {
        const settings = getUserData('settings');
        let state = getUserData('state');
        if (!settings || !state) return;

        const now = Date.now();
        const offlineMs = now - state.lastUpdate;
        if (offlineMs > 5000) {
            const saniyelikOran = settings.saatlikBirikim / 3600;
            const offlineBirikim = (offlineMs / 1000) * saniyelikOran;
            
            state.guncelBirikim += offlineBirikim;
            state.guncelBorc = Math.max(0, state.guncelBorc - offlineBirikim);
            state.lastUpdate = now;
            saveUserData('state', state);
            
            document.getElementById('welcome-back-message').innerHTML = 
                `Siz yokken <strong>${Math.floor(offlineMs / 1000)} saniye</strong> geçti ve bu sürede <strong>${formatCurrency(offlineBirikim)}</strong> birikti. Hesaplarınız güncellendi.`;
            showModal('welcome');
        }
    };

    // ---- OLAY DİNLEYİCİLERİ ----
    // Auth listeners
    showRegisterLink.addEventListener('click', (e) => { 
        e.preventDefault(); 
        loginForm.style.display = 'none'; 
        registerForm.style.display = 'block'; 
    });

    showLoginLink.addEventListener('click', (e) => { 
        e.preventDefault(); 
        registerForm.style.display = 'none'; 
        loginForm.style.display = 'block'; 
    });

    registerBtn.addEventListener('click', () => {
        const username = registerUsernameInput.value.trim();
        const password = registerPasswordInput.value.trim();
        if (!username || !password) return alert('Kullanıcı adı ve parola boş olamaz.');
        
        const users = JSON.parse(localStorage.getItem('app_users')) || {};
        if (users[username]) return alert('Bu kullanıcı adı zaten alınmış.');
        
        users[username] = { password };
        localStorage.setItem('app_users', JSON.stringify(users));
        alert('Kayıt başarılı! Lütfen giriş yapın.');
        
        // Formları resetle ve login'e geç
        registerUsernameInput.value = '';
        registerPasswordInput.value = '';
        showLoginLink.click();
    });

    loginBtn.addEventListener('click', () => {
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value.trim();
        
        if (!username || !password) return alert('Lütfen kullanıcı adı ve parola girin.');
        
        const users = JSON.parse(localStorage.getItem('app_users')) || {};
        if (users[username] && users[username].password === password) {
            currentUser = username;
            localStorage.setItem('app_last_user', currentUser);
            initAppForUser();
        } else {
            alert('Kullanıcı adı veya parola hatalı.');
        }
    });

    // Navigation listeners
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            showContentView(view);
        });
    });

    dashboardBtn.addEventListener('click', () => showContentView('overview'));
    accountsBtn.addEventListener('click', () => showContentView('accounts'));
    reportsBtn.addEventListener('click', () => showContentView('reports'));
    settingsBtn.addEventListener('click', () => showModal('settings'));

    // DÜZELTME: logoutBtn event listener'ı
    logoutBtn.addEventListener('click', () => {
        logout();
    });

    // Account modal listeners
    addAccountBtn.addEventListener('click', () => {
        editingAccountId = null;
        accountModalTitle.textContent = 'Yeni Hesap';
        showModal('account');
    });

    saveAccountBtn.addEventListener('click', saveAccount);
    cancelAccountBtn.addEventListener('click', () => showModal(null));

    // Investment modal listeners
    addInvestmentBtn.addEventListener('click', () => {
        editingInvestmentId = null;
        showModal('investment');
    });

    saveInvestmentBtn.addEventListener('click', saveInvestment);
    cancelInvestmentBtn.addEventListener('click', () => showModal(null));

    // Quick action listeners
    actionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            switch(action) {
                case 'add-income':
                    transactionTypeSelect.value = 'income';
                    showModal('transaction');
                    break;
                case 'add-expense':
                    transactionTypeSelect.value = 'expense';
                    showModal('transaction');
                    break;
                case 'transfer':
                    alert('Transfer özelliği yakında eklenecek!');
                    break;
                case 'investment':
                    showModal('investment');
                    break;
            }
        });
    });

    // ---- UYGULAMA BAŞLATMA ----
    const initAppForUser = () => {
        initializeUserData();
        handleOfflineProgress();
        startCounter();
        
        // Load all data
        loadAccounts();
        loadInvestments();
        loadBudget();
        updateDashboard();
        
        showView('app');
        showContentView('overview');
    };

    // DÜZELTME: logout fonksiyonu düzgün tanımlandı
    const logout = () => {
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
        
        currentUser = null;
        localStorage.removeItem('app_last_user');
        
        // Formları temizle
        loginUsernameInput.value = '';
        loginPasswordInput.value = '';
        registerUsernameInput.value = '';
        registerPasswordInput.value = '';
        
        // Auth view'e dön
        showView('auth');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    };

    const autoLoginAndStart = () => {
        currentUser = localStorage.getItem('app_last_user');
        if (currentUser) {
            // Kullanıcı verilerini kontrol et
            const users = JSON.parse(localStorage.getItem('app_users')) || {};
            if (users[currentUser]) {
                initAppForUser();
                return;
            }
        }
        // Geçerli kullanıcı yoksa auth view göster
        showView('auth');
    };

    // Global functions for HTML onclick events
    window.editAccount = editAccount;
    window.addTransactionToAccount = addTransactionToAccount;

    // Uygulamayı başlat
    autoLoginAndStart();
});
