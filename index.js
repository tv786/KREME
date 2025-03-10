document.getElementById("form").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent default form submission
    document.getElementById("message").textContent = "Submitting...";
    document.getElementById("message").style.display = "block";
    document.getElementById("submit-button").disabled = true;

    // Collect main form data
    var formData = {
        invoiceDate: document.getElementById("invoiceDate").value,
        buyerName: document.getElementById("buyerName").value,
        buyerAddress: document.getElementById("buyerAddress").value,
        addAmount: document.getElementById("addAmount").value,
        paymentStatus: document.getElementById("paymentStatus").value,
        remarks: document.getElementById("remarks").value,
        totalInvoiceAmount: document.getElementById("totalInvoiceAmount").value,
        items: [] // Array to store repeater fields
    };

    // Collect repeater field data
    document.querySelectorAll("#itemTableBody tr").forEach(row => {
        let itemData = {
            itemName: row.cells[0].querySelector("select").value,
            itemQty: row.cells[1].querySelector("input").value,
            itemsUnit: row.cells[2].querySelector("select").value,
            itemRate: row.cells[3].querySelector("input").value,
            totalAmount: row.cells[4].querySelector("input").value
        };
        formData.items.push(itemData);
    });

    console.log("Sending Data:", formData); // Debugging

    // Send data using no-cors to avoid 405 preflight request
    fetch("https://script.google.com/macros/s/AKfycbwUy0Ei7NjFzrGXK__5sjb-t2QrLdRtusuN6MwfoRIHm97ETBCfPCxQ-vmzujWwlbI/exec", {
        method: "POST",
        mode: "no-cors",  // ✅ Prevents OPTIONS preflight request
        headers: { "Content-Type": "application/x-www-form-urlencoded" }, // ✅ Avoids triggering CORS issues
        body: JSON.stringify(formData)  // ✅ Sending data as JSON
    })
    .then(response => {
        console.log("Response from server:", response);
        document.getElementById("message").textContent = "Data submitted successfully!";
        document.getElementById("message").style.backgroundColor = "green";
        document.getElementById("message").style.color = "beige";
        document.getElementById("form").reset();
        document.getElementById("submit-button").disabled = false;

        setTimeout(() => {
            document.getElementById("message").textContent = "";
            document.getElementById("message").style.display = "none";
        }, 2600);
    })
    .catch(error => {
        console.error("Fetch error:", error);
        document.getElementById("message").textContent = "An error occurred while submitting the form.";
    });
});

// Add Item Functionality
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

// Calculate total for individual items
function calculateTotal(input) {
    const row = input.parentNode.parentNode;
    const qty = parseFloat(row.cells[1].querySelector('input').value) || 0;
    const rate = parseFloat(row.cells[3].querySelector('input').value) || 0;
    const total = qty * rate;
    row.cells[4].querySelector('input').value = total.toFixed(2);
    updateTotalInvoiceAmount();
}

// Update total invoice amount
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
