document.addEventListener('DOMContentLoaded', () => {
    const sidebarBtn = document.getElementById('sidebarBtn');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const addBtn = document.getElementById('addBtn');
    const addMenu = document.getElementById('addMenu');
    const scanQrBtn = document.getElementById('scanQrBtn');
    const manualEntryBtn = document.getElementById('manualEntryBtn');
    const manualEntryModal = document.getElementById('manualEntryModal');
    const manualEntryForm = document.getElementById('manualEntryForm');
    const qrScannerModal = document.getElementById('qrScannerModal');
    const qrReader = document.getElementById('qr-reader');
    const exportBtn = document.getElementById('exportBtn');
    const infoBtn = document.getElementById('infoBtn');
    const infoModal = document.getElementById('infoModal');
    const tableBody = document.querySelector('#codeTable tbody');

    let html5QrcodeScanner;

    // Toggle Sidebar-Menü
    sidebarBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        sidebarMenu.classList.toggle('hidden');
    });

    // Add-Button Aktionen
    addBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        addMenu.classList.toggle('hidden');
    });

    // Manuelle Eingabe öffnen
    manualEntryBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        addMenu.classList.add('hidden');
        manualEntryModal.classList.remove('hidden');
    });

    // QR-Scanner öffnen
    scanQrBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        addMenu.classList.add('hidden');
        qrScannerModal.classList.remove('hidden');
        startQrScanner();
    });

    // Infos zum Ersteller anzeigen
    infoBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        sidebarMenu.classList.add('hidden');
        infoModal.classList.remove('hidden');
    });

    // Klick außerhalb des Modals schließt das Modal
    manualEntryModal.addEventListener('click', (event) => {
        if (event.target === manualEntryModal) {
            manualEntryModal.classList.add('hidden');
        }
    });

    qrScannerModal.addEventListener('click', (event) => {
        if (event.target === qrScannerModal) {
            qrScannerModal.classList.add('hidden');
            if (html5QrcodeScanner) {
                html5QrcodeScanner.stop().then(ignore => {
                    // Kamera gestoppt
                }).catch(err => {
                    console.error('Kamera konnte nicht gestoppt werden.', err);
                });
            }
        }
    });

    infoModal.addEventListener('click', (event) => {
        if (event.target === infoModal) {
            infoModal.classList.add('hidden');
        }
    });

    // Klick außerhalb des Menüs schließt die Menüs
    document.addEventListener('click', (event) => {
        // Für addMenu
        if (!addMenu.classList.contains('hidden') && !event.target.closest('#addMenu') && !event.target.closest('#addBtn')) {
            addMenu.classList.add('hidden');
        }
        // Für sidebarMenu
        if (!sidebarMenu.classList.contains('hidden') && !event.target.closest('#sidebarMenu') && !event.target.closest('#sidebarBtn')) {
            sidebarMenu.classList.add('hidden');
        }
    });

    // QR-Scanner starten
    function startQrScanner() {
        html5QrcodeScanner = new Html5Qrcode("qr-reader");
        html5QrcodeScanner.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: 250
            },
            qrCodeMessage => {
                // Verarbeitung des QR-Codes
                parseOtpAuthUrl(qrCodeMessage);
                qrScannerModal.classList.add('hidden');
                html5QrcodeScanner.stop();
            },
            errorMessage => {
                // Fehler beim Scannen
            })
            .catch(err => {
                console.error('QR-Scanner konnte nicht gestartet werden.', err);
            });
    }

    // Verarbeitung der otpauth URL
    function parseOtpAuthUrl(url) {
        try {
            const decodedUrl = decodeURIComponent(url);
            const urlObj = new URL(decodedUrl);
            if (urlObj.protocol !== 'otpauth:') {
                alert('Ungültiger QR-Code.');
                return;
            }
            const secret = urlObj.searchParams.get('secret');
            const label = urlObj.pathname.slice(1);
            if (secret && label) {
                addCode(label, secret);
            } else {
                alert('Ungültiger QR-Code.');
            }
        } catch (error) {
            console.error('Fehler beim Parsen der otpauth URL.', error);
        }
    }

    // Manuelles Hinzufügen eines Codes
    manualEntryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const service = document.getElementById('service').value.trim();
        const secret = document.getElementById('secret').value.trim();

        if (service && secret) {
            addCode(service, secret);
            manualEntryForm.reset();
            manualEntryModal.classList.add('hidden');
        }
    });

    // Funktion zum Hinzufügen eines Codes
    function addCode(service, secret) {
        const codes = JSON.parse(localStorage.getItem('twoFACodes')) || [];
        codes.push({ service, secret });
        localStorage.setItem('twoFACodes', JSON.stringify(codes));
        loadCodes();
    }

    // Funktion zum Laden der Codes
    function loadCodes() {
        tableBody.innerHTML = '';
        const codes = JSON.parse(localStorage.getItem('twoFACodes')) || [];
        codes.forEach((entry, index) => {
            const row = document.createElement('tr');

            const serviceCell = document.createElement('td');
            serviceCell.textContent = entry.service;
            row.appendChild(serviceCell);

            const codeCell = document.createElement('td');
            const codeValue = generateTOTP(entry.secret);
            codeCell.textContent = codeValue;
            row.appendChild(codeCell);

            const actionsCell = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Löschen';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => deleteCode(index));
            actionsCell.appendChild(deleteBtn);
            row.appendChild(actionsCell);

            tableBody.appendChild(row);
        });
    }

    // Funktion zum Löschen eines Codes
    function deleteCode(index) {
        const codes = JSON.parse(localStorage.getItem('twoFACodes')) || [];
        codes.splice(index, 1);
        localStorage.setItem('twoFACodes', JSON.stringify(codes));
        loadCodes();
    }

    // Funktion zum Generieren des TOTP-Codes
    function generateTOTP(secret) {
        return otplib.authenticator.generate(secret);
    }

    // Codes initial laden
    loadCodes();

    // Codes alle 30 Sekunden aktualisieren
    setInterval(loadCodes, 30000);

    // Exportieren der Codes
    exportBtn.addEventListener('click', () => {
        const codes = localStorage.getItem('twoFACodes');
        const blob = new Blob([codes], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = '2fa_codes_backup.json';
        a.click();

        URL.revokeObjectURL(url);
        sidebarMenu.classList.add('hidden');
    });
});
