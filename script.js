document.addEventListener('DOMContentLoaded', function () {
    const enableWifiCheckbox = document.getElementById('enable-wifi-checkbox');
    const useUEMAuthCheckbox = document.getElementById('use-ue-auth-checkbox');
    const enableSystemAppsCheckbox = document.getElementById('enable-system-apps-checkbox');
    const wifiSection = document.getElementById('wifi-section');
    const generateBtn = document.getElementById('generate-btn');
    const saveBtn = document.getElementById('save-btn');
    const regenerateBtn = document.getElementById('regenerate-btn');
    const qrCodeContainer = document.getElementById('qrcode');
    const jsonContentArea = document.getElementById('json-content');
    const errorMessage = document.getElementById('error-message');
    const instructionText = document.getElementById('instruction-text');  // New instructional text element
    
    let defaultJson = {
        "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.airwatch.androidagent/com.airwatch.agent.DeviceAdministratorReceiver",
        "android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM": "6kyqxDOjgS30jvQuzh4uvHPk-0bmAD-1QU7vtW7i_o8=\n",
        "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "https://play.google.com/managed/downloadManagingApp?identifier=hub",
        "android.app.extra.PROVISIONING_SKIP_ENCRYPTION": false,
        "android.app.extra.PROVISIONING_WIFI_SECURITY_TYPE": "none",
        "android.app.extra.PROVISIONING_WIFI_SSID": "",
        "android.app.extra.PROVISIONING_WIFI_PASSWORD": "",
        "android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED": true,
        "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
            "serverurl": "",
            "gid": "",
            "un": "",
            "pw": "",
            "useUEMAuthentication": "false"
        }
    };

    let updatedJsonString = "";  // Variable to hold the updated JSON string

    // Hide Save, Regenerate buttons, and instruction text initially
    saveBtn.style.display = 'none';
    regenerateBtn.style.display = 'none';
    instructionText.style.display = 'none';

    // Display or hide the WiFi section based on checkbox
    enableWifiCheckbox.addEventListener('change', function () {
        wifiSection.style.display = enableWifiCheckbox.checked ? 'block' : 'none';
    });

    // Method to generate QR Code and display the JSON in an editable text box
    function generateQRCode(qrString) {
        // Encode the string in UTF-8
        const utf8String = new TextEncoder().encode(qrString);
        const encodedString = new TextDecoder('utf-8').decode(utf8String);

        // Clear previous QR code (if any)
        qrCodeContainer.innerHTML = "";

        // Generate and display the QR code
        try {
            new QRCode(qrCodeContainer, {
                text: encodedString,
                width: 450,
                height: 450,
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (err) {
            errorMessage.textContent = "Error generating QR code: " + err.message;
            errorMessage.style.display = 'block';
        }

        // Display the editable JSON string in the text area
        jsonContentArea.value = qrString;
        document.getElementById('qr-json-container').style.display = 'block';
    }

    // Event listener for Generate QR Code button
    generateBtn.addEventListener('click', function () {
        const serverName = document.getElementById('server-name').value.trim();
        const groupId = document.getElementById('group-id').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!serverName || !groupId) {
            errorMessage.textContent = 'Please fill in all required fields.';
            errorMessage.style.display = 'block';
            return;
        }

        // Get WiFi values if enabled
        if (enableWifiCheckbox.checked) {
            const wifiSSID = document.getElementById('wifi-ssid').value.trim();
            const wifiPassword = document.getElementById('wifi-password').value.trim();
            if (!wifiSSID || !wifiPassword) {
                errorMessage.textContent = 'Please fill in WiFi SSID and Password.';
                errorMessage.style.display = 'block';
                return;
            }
            defaultJson["android.app.extra.PROVISIONING_WIFI_SECURITY_TYPE"] = "WPA";
            defaultJson["android.app.extra.PROVISIONING_WIFI_SSID"] = wifiSSID;
            defaultJson["android.app.extra.PROVISIONING_WIFI_PASSWORD"] = wifiPassword;
        } else {
            defaultJson["android.app.extra.PROVISIONING_WIFI_SECURITY_TYPE"] = "none";
            defaultJson["android.app.extra.PROVISIONING_WIFI_SSID"] = "";
            defaultJson["android.app.extra.PROVISIONING_WIFI_PASSWORD"] = "";
        }

        // Update JSON values with user input
        defaultJson["android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE"].serverurl = serverName;
        defaultJson["android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE"].gid = groupId;
        defaultJson["android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE"].un = username;
        defaultJson["android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE"].pw = password;
        defaultJson["android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE"].useUEMAuthentication = useUEMAuthCheckbox.checked ? "true" : "false";
        defaultJson["android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED"] = enableSystemAppsCheckbox.checked;

        // Convert the updated JSON object to a string
        updatedJsonString = JSON.stringify(defaultJson);

        // Generate the QR Code using the updated JSON string
        generateQRCode(updatedJsonString);

        // Show the save, regenerate buttons, and instructional text after first generation
        saveBtn.style.display = 'inline-block';  // Show the Save button
        generateBtn.style.display = 'none';
        regenerateBtn.style.display = 'inline-block';
        instructionText.style.display = 'block';  // Show the instructional text
    });

    // Event listener for Save button
    saveBtn.addEventListener('click', function () {
        try {
            updatedJsonString = jsonContentArea.value;
            const parsedJson = JSON.parse(updatedJsonString);  // Parse to ensure valid JSON
            defaultJson = { ...parsedJson };
            errorMessage.style.display = 'none';
        } catch (error) {
            errorMessage.textContent = 'Invalid JSON format. Please correct the JSON.';
            errorMessage.style.display = 'block';
        }
    });

    // Event listener for Regenerate QR Code button
    regenerateBtn.addEventListener('click', function () {
        generateQRCode(updatedJsonString);
    });
});
