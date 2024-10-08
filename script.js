document.addEventListener('DOMContentLoaded', function () {
   
    const enableWifiCheckbox = document.getElementById('enable-wifi-checkbox');
    const useUEMAuthCheckbox = document.getElementById('use-ue-auth-checkbox');
    const enableVIDMCookiesCheckbox = document.getElementById('enable-vidm-cookies-checkbox'); // Updated ID
    const enableSystemAppsCheckbox = document.getElementById('enable-system-apps-checkbox');
    const wifiSection = document.getElementById('wifi-section');
    const generateBtn = document.getElementById('generate-btn');
    const saveBtn = document.getElementById('save-btn');
    const regenerateBtn = document.getElementById('regenerate-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const qrCodeContainer = document.getElementById('qrcode');
    const jsonContentArea = document.getElementById('json-content');
    const errorMessage = document.getElementById('error-message');
    const instructionText = document.getElementById('instruction-text');

        //start with a starting JSON Object, and variable for placeholder updated JSON Object
    let defaultJson = getDefaultJson();
    let updatedJsonString = '';

    // Get the default JSON structure
    function getDefaultJson() {
        return {
            "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.airwatch.androidagent/com.airwatch.agent.DeviceAdministratorReceiver",
            "android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM": "6kyqxDOjgS30jvQuzh4uvHPk-0bmAD-1QU7vtW7i_o8=\n",
            "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "https://play.google.com/managed/downloadManagingApp?identifier=hub",
            "android.app.extra.PROVISIONING_SKIP_ENCRYPTION": false,
            "android.app.extra.PROVISIONING_WIFI_SECURITY_TYPE": "",
            "android.app.extra.PROVISIONING_WIFI_SSID": "",
            "android.app.extra.PROVISIONING_WIFI_PASSWORD": "",
            "android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED": true,
            "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
                "serverurl": "",
                "gid": "",
                "un": "",
                "pw": "",
                "useUEMAuthentication": "false",
                "enable3rdPartyCookiesInVIDM": "false" 
            }
        };
    }

    // Function to toggle WiFi section visibility based on checkbox state
    enableWifiCheckbox.addEventListener('change', function () {
        wifiSection.style.display = enableWifiCheckbox.checked ? 'block' : 'none'; // Toggle visibility
    });

    // Function to Show or hide elements
    function toggleElementVisibility(element, show) {
        element.style.display = show ? 'inline-block' : 'none';
    }

    // Function to  Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    // Function to  Hide error message
    function hideError() {
        errorMessage.style.display = 'none';
    }

    // Function to  Initialize the UI
    function initializeUI() {
        wifiSection.style.display = 'none'; // Ensure Wi-Fi section is hidden on load
        toggleElementVisibility(saveBtn, false);
        toggleElementVisibility(regenerateBtn, false);
        toggleElementVisibility(downloadPdfBtn, false);
        toggleElementVisibility(instructionText, false);
        hideError();
    }

    // Function to  generate QR Code and display the JSON in an editable text box
    //Modified to showcase editable textbox above the QR code for better UX
    //Modified in v01.09
    function generateQRCode(qrString) {
        qrCodeContainer.innerHTML = "";  // Clear previous QR code

        try {
            new QRCode(qrCodeContainer, {
                text: qrString,
                width: 450,
                height: 450,
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (err) {
            showError("Error generating QR code: " + err.message);
        }

        jsonContentArea.value = qrString;
        document.getElementById('qr-json-container').style.display = 'block';
    }

    // Remove Wi-Fi keys from the JSON if Wi-Fi checkbox is not checked
    // Device does not recognize what to do if these lines are not handled properly in DPC Extras
    function removeWifiKeysFromJson(json) {
        if (!enableWifiCheckbox.checked) {
            delete json["android.app.extra.PROVISIONING_WIFI_SECURITY_TYPE"];
            delete json["android.app.extra.PROVISIONING_WIFI_SSID"];
            delete json["android.app.extra.PROVISIONING_WIFI_PASSWORD"];
        }
    }

    // Disable checkboxes after QR code generation to preserve UX
    function disableCheckboxes() {
        enableWifiCheckbox.disabled = true;
        useUEMAuthCheckbox.disabled = true;
        enableSystemAppsCheckbox.disabled = true;
        enableVIDMCookiesCheckbox.disabled = true; // Updated checkbox
    }

    // Event listener for Generate QR Code button
    generateBtn.addEventListener('click', function () {
        const serverName = document.getElementById('server-name').value.trim();
        const groupId = document.getElementById('group-id').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!serverName || !groupId) {
            showError('Please fill in all required fields.');
            return;
        }

        // Get Wi-Fi values if enabled
        if (enableWifiCheckbox.checked) {
            const wifiSSID = document.getElementById('wifi-ssid').value.trim();
            const wifiPassword = document.getElementById('wifi-password').value.trim();
            if (!wifiSSID || !wifiPassword) {
                showError('Please fill in WiFi SSID and Password.');
                return;
            }
            defaultJson["android.app.extra.PROVISIONING_WIFI_SECURITY_TYPE"] = "WPA";
            defaultJson["android.app.extra.PROVISIONING_WIFI_SSID"] = wifiSSID;
            defaultJson["android.app.extra.PROVISIONING_WIFI_PASSWORD"] = wifiPassword;
        }

        // Update JSON values with user input
        defaultJson["android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE"].serverurl = serverName;
        defaultJson["android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE"].gid = groupId;
        defaultJson["android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE"].un = username;
        defaultJson["android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE"].pw = password;
        defaultJson["android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE"].useUEMAuthentication = useUEMAuthCheckbox.checked ? "true" : "false";
        defaultJson["android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED"] = enableSystemAppsCheckbox.checked;
        defaultJson["android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE"].enable3rdPartyCookiesInVIDM = enableVIDMCookiesCheckbox.checked ? "true" : "false"; // Updated logic

        // Remove Wi-Fi keys if Wi-Fi is not enabled
        removeWifiKeysFromJson(defaultJson);

        // Convert the updated JSON object to a string
        updatedJsonString = JSON.stringify(defaultJson);

        // Generate the QR Code using the updated JSON string
        generateQRCode(updatedJsonString);

        // Show the save, regenerate, and download buttons after first generation
        toggleElementVisibility(saveBtn, true);
        toggleElementVisibility(regenerateBtn, true);
        toggleElementVisibility(downloadPdfBtn, true);
        toggleElementVisibility(instructionText, true);
        generateBtn.style.display = 'none';  // Hide generate button after first use

        // Disable the checkboxes after generating the QR code
        disableCheckboxes();
    });

    // Event listener for Save button
    saveBtn.addEventListener('click', function () {
        try {
            updatedJsonString = jsonContentArea.value;
            const parsedJson = JSON.parse(updatedJsonString);  // Parse to ensure valid JSON
            defaultJson = { ...parsedJson };
            hideError();
        } catch (error) {
            showError('Invalid JSON format. Please correct the JSON.');
        }
    });

    // Event listener for Regenerate QR Code button
    regenerateBtn.addEventListener('click', function () {
        generateQRCode(updatedJsonString);
    });

    // Event listener for Download PDF button
    downloadPdfBtn.addEventListener('click', function () {
        const qrCanvas = qrCodeContainer.querySelector('canvas');
        if (qrCanvas) {
            const qrImageData = qrCanvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            pdf.addImage(qrImageData, 'PNG', 15, 40, 180, 180);
            pdf.save('qr-code.pdf');
        } else {
            showError('QR code not available for download.');
        }
    });

    // Initialize the UI on page load
    initializeUI();
});
