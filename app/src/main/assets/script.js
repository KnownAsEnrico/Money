const translations = {
    de: {
        app_title: "Einkommen und Ausgaben Tracker",
        language_label: "Sprache:",
        income: "Einkommen",
        expense: "Ausgaben",
        investment: "Investition",
        add_income: "Neue Einnahme hinzufügen",
        add_expense: "Neue Ausgabe hinzufügen",
        add_investment: "Neue Investition hinzufügen",
        net_income: "Netto-Einkommen:",
        remaining_income: "Verbleibendes Einkommen:",
        income_chart: "Einkommen - Diagramm",
        expense_chart: "Ausgaben - Diagramm",
        remove: "Entfernen",
        name_placeholder_income: "Einkommensquelle",
        amount_placeholder_income: "Einkommensbetrag",
        name_placeholder_expense: "Ausgabenquelle",
        amount_placeholder_expense: "Ausgabenbetrag",
        name_placeholder_investment: "Investitionsquelle",
        amount_placeholder_investment: "Investitionsbetrag",
        no_data: "Keine Daten verfügbar",
        unnamed: "Unbenannt",
        networth: "Vermögen",
        networth_placeholder: "Aktuelles Vermögen eingeben",
        networth_after: "Vermögen nach diesem Monat:",
        growth_rate: "Wachstumsrate:", // Neue Übersetzung
        charts: "Diagramme",
        legend: "Legende",
        investment_label: "Investiert:"
    },
    en: {
        app_title: "Income and Expenses Tracker",
        language_label: "Language:",
        income: "Income",
        expense: "Expenses",
        investment: "Investment",
        add_income: "Add New Income",
        add_expense: "Add New Expense",
        add_investment: "Add New Investment",
        net_income: "Net Income:",
        remaining_income: "Remaining Income:",
        income_chart: "Income - Chart",
        expense_chart: "Expenses - Chart",
        remove: "Remove",
        name_placeholder_income: "Income Source",
        amount_placeholder_income: "Income Amount",
        name_placeholder_expense: "Expense Source",
        amount_placeholder_expense: "Expense Amount",
        name_placeholder_investment: "Investment Source",
        amount_placeholder_investment: "Investment Amount",
        no_data: "No data available",
        unnamed: "Unnamed",
        networth: "Networth",
        networth_placeholder: "Enter your current networth",
        networth_after: "Networth after this Month:",
        growth_rate: "Growth Rate:", // Neue Übersetzung
        charts: "Charts",
        legend: "Legend",
        investment_label: "Invested:"
    },
    zh: {
        app_title: "收入和支出跟踪器",
        language_label: "语言：",
        income: "收入",
        expense: "支出",
        investment: "投资",
        add_income: "添加新收入",
        add_expense: "添加新支出",
        add_investment: "添加新投资",
        net_income: "净收入：",
        remaining_income: "剩余收入：",
        income_chart: "收入 - 图表",
        expense_chart: "支出 - 图表",
        remove: "删除",
        name_placeholder_income: "收入来源",
        amount_placeholder_income: "收入金额",
        name_placeholder_expense: "支出来源",
        amount_placeholder_expense: "支出金额",
        name_placeholder_investment: "投资来源",
        amount_placeholder_investment: "投资金额",
        no_data: "暂无数据",
        unnamed: "未命名",
        networth: "净资产",
        networth_placeholder: "输入您的当前净资产",
        networth_after: "本月后净资产：",
        growth_rate: "增长率:", // Neue Übersetzung
        charts: "图表",
        legend: "图例",
        investment_label: "投了："
    }
};


let isLoading = true;

let chartInstances = {
    income: null,
    expense: null
};

// Debounce function to limit the rate at which a function can fire.
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Funktion zur Rückgabe der Übersetzung basierend auf dem aktuellen Sprachstatus
function getTranslation(key) {
    const language = loadLanguage();
    return (translations[language] && translations[language][key]) ? translations[language][key] : key;
}

// Funktion zur Übersetzung der UI
function translateUI(language) {
    // Übersetzen der Texte mit data-translate Attribut
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[language] && translations[language][key]) {
            element.innerText = translations[language][key];
        }
    });

    // Übersetzen der Platzhalter in Textfeldern
    document.querySelectorAll('input[type="text"]').forEach(input => {
        const parentContainer = input.closest('.list-container');
        const type = parentContainer.id.includes('income') ? 'income' :
            parentContainer.id.includes('expense') ? 'expense' :
                parentContainer.id.includes('investment') ? 'investment' : null;
        if (type) {
            const key = `name_placeholder_${type}`;
            if (translations[language] && translations[language][key]) {
                input.placeholder = translations[language][key];
            }
        }
    });

    document.querySelectorAll('input[type="number"]').forEach(input => {
        const parentContainer = input.closest('.list-container');
        if (parentContainer) {
            if (parentContainer.id === 'networth-container') {
                const key = 'networth_placeholder';
                if (translations[language] && translations[language][key]) {
                    input.placeholder = translations[language][key];
                }
            } else {
                const type = parentContainer.id.includes('income') ? 'income' :
                    parentContainer.id.includes('expense') ? 'expense' :
                        parentContainer.id.includes('investment') ? 'investment' : null;
                const key = `amount_placeholder_${type}`;
                if (translations[language] && translations[language][key]) {
                    input.placeholder = translations[language][key];
                }
            }
        }
    });

    // Übersetzen der ARIA-Labels der Entfernen-Buttons
    document.querySelectorAll('.remove-button').forEach(button => {
        const key = 'remove';
        if (translations[language] && translations[language][key]) {
            button.setAttribute('aria-label', translations[language][key]);
            button.setAttribute('data-tooltip', translations[language][key]);
        }
    });

    // Übersetzen der Investitionen-Label
    document.querySelectorAll('[data-translate="investment_label"]').forEach(element => {
        const key = 'investment_label';
        if (translations[language] && translations[language][key]) {
            element.innerText = translations[language][key];
        }
    });

    // Übersetzen der Legende
    translateLegend(language);
}

// Funktion zur Übersetzung der Legende
function translateLegend(language) {
    const categories = ['income', 'expense', 'investment'];
    const legendContainer = document.getElementById('legend');
    legendContainer.innerHTML = `<h3 data-translate="legend">${getTranslation('legend')}</h3>`;

    categories.forEach(category => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';

        const colorBox = document.createElement('span');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = getCategoryColor(category);

        const label = document.createElement('span');
        label.setAttribute('data-category', category);
        label.innerText = getTranslation(category);

        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        legendContainer.appendChild(legendItem);
    });
}

// Funktion zur Rückgabe der Farbe basierend auf der Kategorie
function getCategoryColor(category) {
    const colors = {
        income: '#4CAF50',
        expense: '#F44336',
        investment: '#2196F3'
    };
    return colors[category] || '#000';
}

// Funktion zur Speicherung der ausgewählten Sprache
function saveLanguage(language) {
    try {
        localStorage.setItem('selectedLanguage', language);
    } catch (e) {
        console.error("Fehler beim Speichern der Sprache:", e);
    }
}

// Funktion zum Laden der gespeicherten Sprache
function loadLanguage() {
    try {
        const savedLanguage = localStorage.getItem('selectedLanguage');
        return savedLanguage ? savedLanguage : 'de';
    } catch (e) {
        console.error("Fehler beim Laden der Sprache:", e);
        return 'de';
    }
}

// Event Listener für DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');
    const currentLanguage = loadLanguage();
    languageSelect.value = currentLanguage;
    translateUI(currentLanguage);

    // Event Listener für Sprachwechsel
    languageSelect.addEventListener('change', (e) => {
        const selectedLanguage = e.target.value;
        saveLanguage(selectedLanguage); // Sprache zuerst speichern
        translateUI(selectedLanguage);  // Dann UI übersetzen
    });

    // Event Listener für Hinzufügen-Buttons
    document.querySelectorAll('.add-button').forEach(button => {
        button.addEventListener('click', () => {
            const type = button.getAttribute('data-type');
            addItem(type);
        });
    });

    // Event Listener für Entfernen-Buttons (Delegation)
    document.querySelector('.container').addEventListener('click', function(event) {
        const removeButton = event.target.closest('.remove-button');
        if (removeButton) {
            const itemDiv = removeButton.closest('.item');
            if (itemDiv) {
                const listContainer = removeButton.closest('.list-container');
                if (listContainer) {
                    const type = listContainer.id.includes('income') ? 'income' :
                        listContainer.id.includes('expense') ? 'expense' :
                            listContainer.id.includes('investment') ? 'investment' : null;
                    if (type) {
                        itemDiv.remove();
                        saveData(type);
                        calculateTotals();
                        updateCharts();
                    }
                }
            }
        }
    });

    // Event Listener für Vermögen Eingabe
    document.getElementById('current-networth').addEventListener('input', debounce(updateNetworth, 300));

    // Laden der gespeicherten Daten
    loadData('networth');
    loadData('income');
    loadData('expense');
    loadData('investment');
    calculateTotals();
    updateCharts();
    isLoading = false;
});

// Funktion zur Rückgabe der Daten mit Namen
function getDataWithNames(type) {
    const items = document.querySelectorAll(`#${type}-list .item`);
    const data = [];
    items.forEach(item => {
        const nameInput = item.querySelector('input[type="text"]');
        const amountInput = item.querySelector('input[type="number"]');
        const language = loadLanguage();
        const name = nameInput.value.trim() || getTranslation('unnamed');
        const amount = parseFloat(amountInput.value) || 0;
        if (amount > 0) {
            data.push({
                name,
                amount,
                category: type === 'income' ? 'income' : type === 'investment' ? 'investment' : 'expense'
            });
        }
    });
    return data;
}

// Funktion zum Hinzufügen eines neuen Eintrags
function addItem(type, name = '', amount = 0) {
    const container = document.getElementById(`${type}-list`);
    if (!container) return;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = getTranslation(`name_placeholder_${type}`);
    nameInput.value = name;
    nameInput.setAttribute('aria-label', getTranslation(`name_placeholder_${type}`));
    nameInput.addEventListener('input', debounce(() => {
        if (!isLoading) {
            saveData(type);
            calculateTotals();
            updateCharts();
        }
    }, 300));

    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.placeholder = getTranslation(`amount_placeholder_${type}`);
    amountInput.value = amount;
    amountInput.setAttribute('aria-label', getTranslation(`amount_placeholder_${type}`));
    amountInput.min = "0";
    amountInput.addEventListener('input', debounce(() => {
        if (!isLoading) {
            saveData(type);
            calculateTotals();
            updateCharts();
        }
    }, 300));

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.setAttribute('aria-label', getTranslation('remove'));
    removeButton.setAttribute('data-tooltip', getTranslation('remove'));
    removeButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="#fff">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1z"/>
        </svg>
    `;

    itemDiv.appendChild(nameInput);
    itemDiv.appendChild(amountInput);
    itemDiv.appendChild(removeButton);
    container.appendChild(itemDiv);

    calculateTotals();
    if (!isLoading) saveData(type);
    updateCharts();
}

// Funktion zur Berechnung der Gesamtsummen
function calculateTotals() {
    const language = loadLanguage();
    const incomeItems = getDataWithNames('income');
    const expenseItems = getDataWithNames('expense');
    const investmentItems = getDataWithNames('investment');

    const totalIncome = incomeItems.reduce((acc, item) => acc + item.amount, 0);
    const totalExpenses = expenseItems.reduce((acc, item) => acc + item.amount, 0);
    const totalInvestment = investmentItems.reduce((acc, item) => acc + item.amount, 0);

    // Korrigierte Berechnung des Netto-Einkommens
    const netTotal = totalIncome - totalExpenses - totalInvestment;

    const netTotalElement = document.getElementById('net-total');
    netTotalElement.innerText = netTotal.toFixed(2) + '€';
    netTotalElement.classList.toggle('negative', netTotal < 0);

    const investmentElement = document.getElementById('investment-amount');
    investmentElement.innerText = `${totalInvestment.toFixed(2)} €`;

    const percentage = totalIncome ? (netTotal / totalIncome) * 100 : 0;
    const percentageElement = document.getElementById('percentage');
    percentageElement.innerText = `${percentage.toFixed(2)}%`;
    percentageElement.classList.toggle('negative', percentage < 0);

    const currentNetworthInput = document.getElementById('current-networth');
    const currentNetworth = parseFloat(currentNetworthInput.value) || 0;

    // Zuweisen der Referenz auf das Element für das Vermögen nach diesem Monat
    const networthAfterElement = document.getElementById('networth-after');
    const growthRateElement = document.getElementById('growth-rate'); // Neues Element für Wachstumsrate

    const networthAfter = currentNetworth + netTotal + totalInvestment; // Vermögen + Netto-Einkommen + Investitionen
    networthAfterElement.innerText = `${networthAfter.toFixed(2)} €`;
    networthAfterElement.classList.toggle('negative', networthAfter < 0);

    // Berechnung des Wachstums in Prozent
    let growthRate = 0;
    if (currentNetworth > 0) {
        growthRate = ((networthAfter - currentNetworth) / currentNetworth) * 100;
    }

    // Anzeigen der Wachstumsrate
    growthRateElement.innerText = `${growthRate.toFixed(2)}%`;
    growthRateElement.classList.toggle('negative', growthRate < 0);

    try {
        localStorage.setItem('networthData', currentNetworth.toFixed(2));
    } catch (e) {
        console.error("Fehler beim Speichern des Vermögens:", e);
    }
}



// Funktion zur Speicherung der Daten
function saveData(type) {
    try {
        if (type === 'networth') {
            const networthInput = document.getElementById('current-networth');
            if (networthInput) {
                const networthValue = parseFloat(networthInput.value) || 0;
                localStorage.setItem('networthData', networthValue.toFixed(2));
            }
        } else {
            const items = Array.from(document.querySelectorAll(`#${type}-list .item`)).map(item => ({
                name: item.querySelector('input[type="text"]').value,
                amount: item.querySelector('input[type="number"]').value
            }));
            localStorage.setItem(`${type}Data`, JSON.stringify(items));
        }
    } catch (e) {
        console.error(`Fehler beim Speichern der Daten für ${type}:`, e);
    }
}

// Funktion zum Laden der Daten
function loadData(type) {
    try {
        if (type === 'networth') {
            const networthInput = document.getElementById('current-networth');
            const savedNetworth = localStorage.getItem('networthData');
            if (savedNetworth && networthInput) {
                networthInput.value = parseFloat(savedNetworth) || 0;
            }
        } else {
            const data = localStorage.getItem(`${type}Data`);
            if (data) {
                JSON.parse(data).forEach(item => addItem(type, item.name, item.amount));
            }
        }
    } catch (e) {
        console.error(`Fehler beim Laden der Daten für ${type}:`, e);
    }
}

// Funktion zur Aktualisierung des Vermögens
function updateNetworth() {
    if (!isLoading) {
        calculateTotals();
        const networthInput = document.getElementById('current-networth');
        if (networthInput) {
            const networthValue = parseFloat(networthInput.value) || 0;
            try {
                localStorage.setItem('networthData', networthValue.toFixed(2));
            } catch (e) {
                console.error("Fehler beim Speichern des Vermögens:", e);
            }
        }
    }
}

// Funktion zur Aktualisierung der Diagramme
function updateCharts() {
    const language = loadLanguage();
    const incomeData = getDataWithNames('income').map(item => ({ ...item }));
    const expenseData = getDataWithNames('expense').map(item => ({ ...item }));
    const investmentData = getDataWithNames('investment').map(item => ({ ...item }));

    const combinedExpenseData = expenseData.concat(investmentData);

    drawChart('incomeChart', incomeData, 'income', language);
    drawChart('expenseChart', combinedExpenseData, 'expense', language);
    translateLegend(language);
}

// Funktion zur Generierung von Schattierungen eines Farbtons
function getShade(hex, factor) {
    // Entfernen des Hash-Zeichens, falls vorhanden
    hex = hex.replace('#', '');

    const r = Math.min(255, Math.floor(parseInt(hex.substring(0,2), 16) * factor));
    const g = Math.min(255, Math.floor(parseInt(hex.substring(2,4), 16) * factor));
    const b = Math.min(255, Math.floor(parseInt(hex.substring(4,6), 16) * factor));

    return `rgb(${r}, ${g}, ${b})`;
}

// Funktion zum Zeichnen der Diagramme mit Chart.js und variabler Helligkeit
function drawChart(canvasId, data, type) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (chartInstances[type]) {
        chartInstances[type].destroy();
    }

    if (data.length === 0) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(getTranslation('no_data'), ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    const labels = data.map(item => item.name);
    const amounts = data.map(item => item.amount);
    const baseColor = {
        income: '#4CAF50',
        expense: '#F44336',
        investment: '#2196F3'
    };

    const backgroundColors = data.map((item, index) => {
        const shadeFactor = 1 - (index * 0.1); // Jeder Slice wird etwas dunkler
        return getShade(baseColor[item.category], shadeFactor);
    });

    chartInstances[type] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: amounts,
                backgroundColor: backgroundColors,
                borderWidth: 0 // Entfernt die weißen Trennlinien
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${percentage}%`;
                        }
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    });
}



// Funktion zur Rückgabe der Daten mit Namen
function getDataWithNames(type) {
    const items = document.querySelectorAll(`#${type}-list .item`);
    const data = [];
    items.forEach(item => {
        const nameInput = item.querySelector('input[type="text"]');
        const amountInput = item.querySelector('input[type="number"]');
        const language = loadLanguage();
        const name = nameInput.value.trim() || getTranslation('unnamed');
        const amount = parseFloat(amountInput.value) || 0;
        if (amount > 0) {
            data.push({
                name,
                amount,
                category: type === 'income' ? 'income' : type === 'investment' ? 'investment' : 'expense'
            });
        }
    });
    return data;
}

// Funktion zur Initialisierung der Diagramme
function drawCharts() {
    updateCharts();
}

// Event Listener für Fensterladen und -größenänderung
window.addEventListener('load', drawCharts);
window.addEventListener('resize', drawCharts);
