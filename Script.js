const itemOptions = [
    'MILK 1LTR',
    'CREAM 1LTR',
    'MILK POWDER',
    'GHEE 500ML',
    'GHEE 1000ML',
'SONAI TM POUCH 450ML',
'Flv_Milk - Badam',
'Flv_Milk - Strawberry',
    'Flv_Milk - Chocolate',
];

function addRow() {
    const itemTableBody = document.getElementById('itemTableBody');
    const newRow = itemTableBody.insertRow();
    
    const itemNameCell = newRow.insertCell(0);
    const itemQtyCell = newRow.insertCell(1);
    const itemsUnitCell = newRow.insertCell(2);
    const itemRateCell = newRow.insertCell(3);
    const totalAmountCell = newRow.insertCell(4);
    const actionCell = newRow.insertCell(5);

    const itemNameSelect = document.createElement('select');
    itemNameSelect.name = 'itemName[]';
    itemNameSelect.required = true;

    itemOptions.forEach(option => {
        const itemOption = document.createElement('option');
        itemOption.value = option;
        itemOption.textContent = option;
        itemNameSelect.appendChild(itemOption);
    });

    itemNameCell.appendChild(itemNameSelect);

    itemQtyCell.innerHTML = `<input type="number" name="itemQty[]" min="0" required oninput="calculateTotal(this)">`;
    itemsUnitCell.innerHTML = `<select name="itemsUnit[]" required>
                                <option value="KGS">KGS</option>
                                <option value="PCS">PCS</option>
                                <option value="NOS">NOS</option>
                                <option value="LTR">LTR</option>
                                <option value="BAG">BAG</option>
                                <option value="JAR">JAR</option>
                                <option value="BOX">BOX</option>
                                <option value="PACK">PACK</option>
                              </select>`;
    itemRateCell.innerHTML = `<input type="number" name="itemRate[]" min="0" step="0.01" required oninput="calculateTotal(this)">`;
    totalAmountCell.innerHTML = `<input type="text" name="totalAmount[]" readonly>`;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.innerHTML = '<span class="delete-icon">&#x2716;</span>';
    deleteButton.onclick = function() {
        itemTableBody.deleteRow(newRow.rowIndex);
        updateTotalInvoiceAmount();
    };

    actionCell.appendChild(deleteButton);
}

function calculateTotal(input) {
    const row = input.parentNode.parentNode;
    const qty = parseFloat(row.cells[1].querySelector('input').value) || 0;
    const rate = parseFloat(row.cells[3].querySelector('input').value) || 0;
    const total = qty * rate;
    row.cells[4].querySelector('input').value = total.toFixed(2);
    updateTotalInvoiceAmount();
}

function updateTotalInvoiceAmount() {
    const itemRows = document.querySelectorAll('#itemTableBody tr');
    let totalAmount = 0;

    itemRows.forEach(row => {
        totalAmount += parseFloat(row.cells[4].querySelector('input').value) || 0;
    });

    const addAmount = parseFloat(document.getElementById('addAmount').value) || 0;
    const totalInvoiceAmount = totalAmount + addAmount;

    document.getElementById('totalInvoiceAmount').value = totalInvoiceAmount.toFixed(2);
}

function sendViaWhatsApp() {
    const invoiceDate = new Date(document.getElementById('invoiceDate').value);
    const buyerName = document.getElementById('buyerName').value;
    const buyerAddress = document.getElementById('buyerAddress').value;
    const paymentStatus = document.getElementById('paymentStatus').value;
    const remarks = document.getElementById('remarks').value;
    const addAmount = document.getElementById('addAmount').value;

    const itemRows = document.querySelectorAll('#itemTableBody tr');
    let message = `*Invoice Date:* ${getFormattedDate(invoiceDate)}\n\n*Buyer Name:* ${buyerName}\n*Buyer Address:* ${buyerAddress}\n\n`;

    itemRows.forEach(row => {
        const itemName = row.cells[0].querySelector('select').value;
        const itemQty = row.cells[1].querySelector('input').value;
        const itemsUnit = row.cells[2].querySelector('select').value;
        const itemRate = row.cells[3].querySelector('input').value;
        const totalAmount = row.cells[4].querySelector('input').value;

        message += `*Item Name:* ${itemName}\n*Item Qty:* ${itemQty}\n*Items Unit:* ${itemsUnit}\n*Item Rate:* ₹${itemRate}\n*Total Amount:* ₹${totalAmount}\n\n`;
    });

    message += `*Payment Status:* ${paymentStatus}\n`;
    message += `*Add (+) (₹):* ₹${addAmount}\n`;
message += `*Remarks:* ${remarks}\n`;
    message += '----------------------------------------------------\n';
    message += `*Total Invoice Amount (₹): ₹${document.getElementById('totalInvoiceAmount').value}*\n`;
    message += '----------------------------------------------------';

    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappLink;
}

function getFormattedDate(date) {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
}

function getOrdinalSuffix(number) {
    if (number % 100 >= 11 && number % 100 <= 13) {
        return 'th';
    }
    const lastDigit = number % 10;
    switch (lastDigit) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
    }
}

// Send data to Google Sheets
function sendToGoogleSheet() {
    const invoiceDate = document.getElementById('invoiceDate').value;
    const buyerName = document.getElementById('buyerName').value;
    const buyerAddress = document.getElementById('buyerAddress').value;
    const paymentStatus = document.getElementById('paymentStatus').value;
    const remarks = document.getElementById('remarks').value;
    const addAmount = document.getElementById('addAmount').value;
    const totalInvoiceAmount = document.getElementById('totalInvoiceAmount').value;

    const itemRows = document.querySelectorAll('#itemTableBody tr');
    let items = [];

    itemRows.forEach(row => {
        items.push({
            itemName: row.cells[0].querySelector('select').value,
            itemQty: row.cells[1].querySelector('input').value,
            itemsUnit: row.cells[2].querySelector('select').value,
            itemRate: row.cells[3].querySelector('input').value,
            totalAmount: row.cells[4].querySelector('input').value
        });
    });

    const data = {
        invoiceDate, buyerName, buyerAddress, items, addAmount, paymentStatus, remarks, totalInvoiceAmount
    };

    fetch("AKfycbwphrz4j1Qjgj7poiXD4qNx6YXIqBMLSt2r3PuXbB8", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(response => response.text())
    .then(data => alert("Invoice saved to Google Sheets!"))
    .catch(error => alert("Error: " + error));
}
