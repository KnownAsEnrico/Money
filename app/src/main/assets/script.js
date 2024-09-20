// Sprachdaten für die Übersetzungen
const translations = {
    de: {
        app_title: "Einkommen und Ausgaben Tracker",
        language_label: "Sprache:",
        income: "Einkommen",
        expenses: "Ausgaben",
        add_income: "Neue Einnahme hinzufügen",
        add_expense: "Neue Ausgabe hinzufügen",
        net_income: "Netto-Einkommen:",
        remaining_income: "Verbleibendes Einkommen:",
        income_chart: "Einkommen - Diagramm",
        expense_chart: "Ausgaben - Diagramm",
        remove: "Entfernen",
        name_placeholder_income: "Einkommensquelle",
        amount_placeholder_income: "Einkommensbetrag",
        name_placeholder_expense: "Ausgabenquelle",
        amount_placeholder_expense: "Ausgabenbetrag",
        no_data: "Keine Daten verfügbar",
        unnamed: "Unbenannt",
        networth: "Vermögen",
        networth_placeholder: "Aktuelles Vermögen eingeben",
        networth_after: "Vermögen nach diesem Monat:"
    },
    en: {
        app_title: "Income and Expenses Tracker",
        language_label: "Language:",
        income: "Income",
        expenses: "Expenses",
        add_income: "Add New Income",
        add_expense: "Add New Expense",
        net_income: "Net Income:",
        remaining_income: "Remaining Income:",
        income_chart: "Income - Chart",
        expense_chart: "Expenses - Chart",
        remove: "Remove",
        name_placeholder_income: "Income Source",
        amount_placeholder_income: "Income Amount",
        name_placeholder_expense: "Expense Source",
        amount_placeholder_expense: "Expense Amount",
        no_data: "No data available",
        unnamed: "Unnamed",
        networth: "Networth",
        networth_placeholder: "Enter your current networth",
        networth_after: "Networth after this Month:"
    },
    zh: {
        app_title: "收入和支出跟踪器",
        language_label: "语言：",
        income: "收入",
        expenses: "支出",
        add_income: "添加新收入",
        add_expense: "添加新支出",
        net_income: "净收入：",
        remaining_income: "剩余收入：",
        income_chart: "收入 - 图表",
        expense_chart: "支出 - 图表",
        remove: "删除",
        name_placeholder_income: "收入来源",
        amount_placeholder_income: "收入金额",
        name_placeholder_expense: "支出来源",
        amount_placeholder_expense: "支出金额",
        no_data: "暂无数据",
        unnamed: "未命名",
        networth: "净资产",
        networth_placeholder: "输入您的当前净资产",
        networth_after: "本月后净资产："
    }
};

// Variable zum Tracking des Ladezustands
let isLoading = true;

// Datenstruktur zum Speichern der Diagrammsegmente
let chartData = {
    income: [],
    expense: []
};

// Funktion zum Übersetzen der UI
function translateUI(language) {
    // Übersetze alle Elemente mit data-translate
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[language] && translations[language][key]) {
            element.innerText = translations[language][key];
        }
    });

    // Übersetze die Placeholder-Texte für Einnahmen, Ausgaben und Networth
    document.querySelectorAll('input[type="text"]').forEach(input => {
        const parentContainer = input.closest('.list-container');
        const type = parentContainer.id.includes('income') ? 'income' : parentContainer.id.includes('expense') ? 'expense' : null;
        if (type) {
            const key = type === 'income' ? 'name_placeholder_income' : 'name_placeholder_expense';
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
                const type = parentContainer.id.includes('income') ? 'income' : 'expense';
                const key = type === 'income' ? 'amount_placeholder_income' : 'amount_placeholder_expense';
                if (translations[language] && translations[language][key]) {
                    input.placeholder = translations[language][key];
                }
            }
        }
    });

    // Übersetze die aria-labels der Remove-Buttons
    document.querySelectorAll('.remove-button').forEach(button => {
        const key = 'remove';
        if (translations[language] && translations[language][key]) {
            button.setAttribute('aria-label', translations[language][key]);
        }
    });

    // Übersetze die Networth after this Month Titel
    const networthAfterElements = document.querySelectorAll('[data-translate="networth_after"]');
    networthAfterElements.forEach(element => {
        const key = 'networth_after';
        if (translations[language] && translations[language][key]) {
            element.innerText = translations[language][key];
        }
    });
}

// Funktion zur Speicherung der Sprache in localStorage
function saveLanguage(language) {
    localStorage.setItem('selectedLanguage', language);
}

// Funktion zum Laden der Sprache aus localStorage
function loadLanguage() {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    return savedLanguage ? savedLanguage : 'de'; // Standard ist Deutsch
}

// Initialisierung der Sprache beim Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    const languageSelect = document.getElementById('language-select');
    const currentLanguage = loadLanguage();
    languageSelect.value = currentLanguage;
    translateUI(currentLanguage);

    // Event Listener für Sprachwechsel
    languageSelect.addEventListener('change', (e) => {
        const selectedLanguage = e.target.value;
        translateUI(selectedLanguage);
        saveLanguage(selectedLanguage);
    });

    // Laden der gespeicherten Daten
    loadData('networth'); // Neu hinzugefügt
    loadData('income');
    loadData('expense');
    calculateTotals();
    updateCharts();
    setupInteractivity();
    isLoading = false; // Laden abgeschlossen
});

// Funktion zum Abrufen der Daten mit Namen
function getDataWithNames(type) {
    const items = document.querySelectorAll(`#${type}-list .item`);
    const data = [];
    items.forEach(item => {
        const name = item.querySelector('input[type="text"]').value.trim() || getTranslation('unnamed');
        const amount = parseFloat(item.querySelector('input[type="number"]').value) || 0;
        if (amount > 0) {
            data.push({ name, amount });
        }
    });
    return data;
}

// Funktion zum Zeichnen des Kreisdiagramms
function drawPieChart(canvasId, data, type) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');

    // Anpassung für hohe Auflösung
    const devicePixelRatio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const total = data.reduce((acc, val) => acc + val.amount, 0);

    // Farben für die Segmente
    const colors = generateColors(data.length, type);

    // Speicher der Segmente mit ihren Winkelbereichen und Prozentanteil
    const segments = [];

    // Zeichne den Hintergrund
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f4f6f8';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Wenn keine Daten vorhanden sind
    if (data.length === 0 || total === 0) {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(getTranslation('no_data'), rect.width / 2, rect.height / 2);
        chartData[type] = [];
        return;
    }

    // Mittelpunkt und Radius
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    let startAngle = 0;

    data.forEach((item, index) => {
        const sliceAngle = (item.amount / total) * 2 * Math.PI;
        const percentage = ((item.amount / total) * 100).toFixed(1);

        // Zeichne das Segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index];
        ctx.fill();

        // Speichere das Segment mit seinen Winkeln, Namen und Prozentanteil
        segments.push({
            startAngle: startAngle,
            endAngle: startAngle + sliceAngle,
            name: item.name,
            percentage: percentage
        });

        startAngle += sliceAngle;
    });

    // Speichere die Segmentdaten für die Interaktivität
    chartData[type] = segments;
}

// Funktion zur Generierung von Farben für die Segmente (unterscheidet zwischen Einkommen und Ausgaben)
function generateColors(numColors, type) {
    const colors = [];
    let baseColors;

    if (type === 'income') {
        // Farben für Einkommen (grünbasierte Palette)
        baseColors = [
            '#4CAF50', // Grün
            '#81C784', // Hellgrün
            '#388E3C', // Dunkelgrün
            '#66BB6A', // Mittelgrün
            '#A5D6A7', // Pastellgrün
            '#2E7D32'  // Sehr Dunkelgrün
        ];
    } else if (type === 'expense') {
        // Farben für Ausgaben (rotbasierte Palette)
        baseColors = [
            '#F44336', // Rot
            '#E57373', // Hellrot
            '#D32F2F', // Dunkelrot
            '#EF5350', // Mittelrot
            '#FF8A80', // Pastellrot
            '#C62828'  // Sehr Dunkelrot
        ];
    } else {
        // Fallback-Farben (blau)
        baseColors = [
            '#2196F3',
            '#64B5F6',
            '#1976D2',
            '#42A5F5',
            '#90CAF9',
            '#1565C0'
        ];
    }

    for (let i = 0; i < numColors; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
}

// Event-Handling für Diagramm-Interaktivität
function setupInteractivity() {
    // Funktion zur Bestimmung des Segments basierend auf der Position
    function getSegment(canvas, x, y, type) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const devicePixelRatio = window.devicePixelRatio || 1;

        // Korrigiere die Koordinaten basierend auf dem devicePixelRatio
        const mouseX = (x - rect.left) * scaleX / devicePixelRatio;
        const mouseY = (y - rect.top) * scaleY / devicePixelRatio;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > radius) {
            return null;
        }

        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += 2 * Math.PI;

        const segments = chartData[type];
        for (let segment of segments) {
            if (angle >= segment.startAngle && angle < segment.endAngle) {
                return segment;
            }
        }
        return null;
    }

    // Funktion zur Anzeige des Tooltips
    function showTooltip(tooltipElement, text, percentage, x, y) {
        tooltipElement.style.left = x + 'px';
        tooltipElement.style.top = y + 'px';
        tooltipElement.innerText = `${text}: ${percentage}%`;
        tooltipElement.style.opacity = 1;
    }

    // Funktion zur Verbergung des Tooltips
    function hideTooltip(tooltipElement) {
        tooltipElement.style.opacity = 0;
    }

    // Füge Event-Listener zu beiden Diagrammen hinzu
    ['income', 'expense'].forEach(type => {
        const canvasId = `${type}Chart`;
        const canvas = document.getElementById(canvasId);
        const tooltipId = `${type}Tooltip`;
        const tooltip = document.getElementById(tooltipId);

        // Mouse Events
        canvas.addEventListener('mousemove', function(event) {
            const nameAndPercentage = getSegment(canvas, event.clientX, event.clientY, type);
            if (nameAndPercentage) {
                // Berechne die Position relativ zum Chart-Container
                const rect = canvas.getBoundingClientRect();
                const x = event.clientX - rect.left + 10;
                const y = event.clientY - rect.top + 10;
                showTooltip(tooltip, nameAndPercentage.name, nameAndPercentage.percentage, x, y);
            } else {
                hideTooltip(tooltip);
            }
        });

        canvas.addEventListener('mouseout', function() {
            hideTooltip(tooltip);
        });

        // Touch Events
        canvas.addEventListener('touchstart', function(event) {
            // Kein preventDefault hier, um Scrollen zu erlauben
        }, { passive: true });

        canvas.addEventListener('touchmove', function(event) {
            const touch = event.touches[0];
            const nameAndPercentage = getSegment(canvas, touch.clientX, touch.clientY, type);
            if (nameAndPercentage) {
                // Verhindere das Scrollen nur, wenn der Benutzer interagiert
                event.preventDefault();
                // Berechne die Position relativ zum Chart-Container
                const rect = canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left + 10;
                const y = touch.clientY - rect.top + 10;
                showTooltip(tooltip, nameAndPercentage.name, nameAndPercentage.percentage, x, y);
            } else {
                hideTooltip(tooltip);
            }
        }, { passive: false });

        canvas.addEventListener('touchend', function() {
            hideTooltip(tooltip);
        });
    });
}

// Funktion zum Übersetzen bestimmter Texte, die dynamisch erstellt werden
function getTranslation(key) {
    const language = loadLanguage();
    return translations[language][key] || key;
}

// Lädt die gespeicherten Daten aus localStorage
function loadData(type) {
    if (type === 'networth') {
        const networthInput = document.getElementById('current-networth');
        const savedNetworth = localStorage.getItem('networthData');
        if (savedNetworth) {
            networthInput.value = parseFloat(savedNetworth) || 0;
        }
    } else {
        const data = localStorage.getItem(`${type}Data`);
        if (data) {
            isLoading = true; // Ladevorgang beginnt
            const items = JSON.parse(data);
            items.forEach(item => {
                addItem(type, item.name, item.amount);
            });
            isLoading = false; // Ladevorgang beendet
        } else {
            if (type !== 'networth') {
                isLoading = false; // Kein Laden erforderlich
            }
        }
    }
}

// Funktion zum Hinzufügen eines neuen Items
function addItem(type, name = '', amount = 0) {
    const container = document.getElementById(`${type}-list`);

    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    if (type === 'income') {
        nameInput.placeholder = getTranslation('name_placeholder_income');
    } else if (type === 'expense') {
        nameInput.placeholder = getTranslation('name_placeholder_expense');
    }
    nameInput.value = name;
    nameInput.oninput = () => {
        if (!isLoading) {
            saveData(type);
        }
        calculateTotals();
        updateCharts();
    };

    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    if (type === 'income') {
        amountInput.placeholder = getTranslation('amount_placeholder_income');
    } else if (type === 'expense') {
        amountInput.placeholder = getTranslation('amount_placeholder_expense');
    }
    amountInput.value = amount;
    amountInput.oninput = () => {
        if (!isLoading) {
            saveData(type);
        }
        calculateTotals();
        updateCharts();
    };

    // Ersetzen des "Entfernen" Textes durch ein SVG-Mülleimer-Icon
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-button';
    removeButton.setAttribute('aria-label', getTranslation('remove'));

    // SVG-Icon für den Mülleimer
    removeButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="#f44336">
            <path d="M0 0h24v24H0V0z" fill="none"/>
            <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-4.5l-1-1z"/>
        </svg>
    `;
    removeButton.onclick = () => {
        container.removeChild(itemDiv);
        saveData(type);
        calculateTotals();
        updateCharts();
    };

    itemDiv.appendChild(nameInput);
    itemDiv.appendChild(amountInput);
    itemDiv.appendChild(removeButton);
    container.appendChild(itemDiv);

    calculateTotals();
    if (!isLoading) {
        saveData(type);
    }
    updateCharts();
}

// Funktion zur Berechnung der Gesamteinnahmen, -ausgaben, Netto-Einkommen und Networth after this Month
function calculateTotals() {
    const incomeItems = document.querySelectorAll('#income-list .item');
    const expenseItems = document.querySelectorAll('#expense-list .item');

    let totalIncome = 0;
    incomeItems.forEach(item => {
        const amountInput = item.querySelector('input[type="number"]');
        totalIncome += parseFloat(amountInput.value) || 0;
    });

    let totalExpenses = 0;
    expenseItems.forEach(item => {
        const amountInput = item.querySelector('input[type="number"]');
        totalExpenses += parseFloat(amountInput.value) || 0;
    });

    const netTotal = totalIncome - totalExpenses;
    const netTotalElement = document.getElementById('net-total');
    netTotalElement.innerText = netTotal.toFixed(2);

    // Hinzufügen oder Entfernen der Klasse 'negative' für Netto-Einkommen
    if (netTotal < 0) {
        netTotalElement.classList.add('negative');
    } else {
        netTotalElement.classList.remove('negative');
    }

    // Prozentzahl berechnen und anzeigen
    const percentage = totalIncome ? (netTotal / totalIncome) * 100 : 0;
    const percentageElement = document.getElementById('percentage');
    percentageElement.innerText = percentage.toFixed(2);

    // Hinzufügen oder Entfernen der Klasse 'negative' für die Prozentzahl
    if (percentage < 0) {
        percentageElement.classList.add('negative');
    } else {
        percentageElement.classList.remove('negative');
    }

    // Berechnung für Networth after this Month
    const currentNetworthInput = document.getElementById('current-networth');
    const currentNetworth = parseFloat(currentNetworthInput.value) || 0;
    const networthAfter = currentNetworth + netTotal;
    const networthAfterElement = document.getElementById('networth-after');
    networthAfterElement.innerText = networthAfter.toFixed(2) + ' €'; // Anpassung für Euro

    // Farbe basierend auf dem Wert (nur CSS-Klassen verwenden)
    if (networthAfter < 0) {
        networthAfterElement.classList.add('negative');
    } else {
        networthAfterElement.classList.remove('negative');
    }

    // Speichere das aktuelle Networth in localStorage
    localStorage.setItem('networthData', currentNetworth.toFixed(2));
}

// Funktion zum Speichern der Daten in localStorage
function saveData(type) {
    if (type === 'networth') {
        const networthInput = document.getElementById('current-networth');
        const networthValue = parseFloat(networthInput.value) || 0;
        localStorage.setItem('networthData', networthValue.toFixed(2));
    } else {
        const items = [];
        const itemElements = document.querySelectorAll(`#${type}-list .item`);

        itemElements.forEach(item => {
            const nameInput = item.querySelector('input[type="text"]');
            const amountInput = item.querySelector('input[type="number"]');
            items.push({
                name: nameInput.value,
                amount: amountInput.value
            });
        });

        localStorage.setItem(`${type}Data`, JSON.stringify(items));
    }
}

// Funktion zur Aktualisierung des Networth (wird beim Input ausgelöst)
function updateNetworth() {
    if (!isLoading) {
        calculateTotals();
        // Speichere das aktuelle Networth sofort
        const networthInput = document.getElementById('current-networth');
        const networthValue = parseFloat(networthInput.value) || 0;
        localStorage.setItem('networthData', networthValue.toFixed(2));
    }
}

// Funktion zum Aktualisieren der Diagramme
function updateCharts() {
    drawPieChart('incomeChart', getDataWithNames('income'), 'income');
    drawPieChart('expenseChart', getDataWithNames('expense'), 'expense');
}
