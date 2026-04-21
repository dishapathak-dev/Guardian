
let map;
let marker;

// Load saved contacts when page opens
let contacts = JSON.parse(localStorage.getItem("contacts")) || [];

// Save contacts to local storage
function saveContacts() {
    localStorage.setItem("contacts", JSON.stringify(contacts));
}

// Add contact
function addContact() {
    let name = document.getElementById("contactName").value;
    let number = document.getElementById("contactNumber").value;
    let imageInput = document.getElementById("contactImage");
    let imageFile = imageInput.files[0];

    if(name === "" || number === "") {
        alert("Please fill all fields");
        return;
    }

    let reader = new FileReader();

    reader.onload = function(e) {
        let contact = {
    name: name,
    number: number,
    image: e.target.result,
    priority: false
};

        contacts.push(contact);
        saveContacts();
        displayContacts();

        document.getElementById("contactName").value = "";
        document.getElementById("contactNumber").value = "";
        imageInput.value = "";
    };

    if(imageFile) {
        reader.readAsDataURL(imageFile);
    } else {
        reader.onload({ target: { result: "https://via.placeholder.com/40" }});
    }
}

// SOS Button
let countdownInterval;

document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("sosBtn").addEventListener("click", function() {

        let overlay = document.getElementById("countdownOverlay");
        let number = document.getElementById("countdownNumber");

        overlay.style.display = "flex";

        let count = 5;
        number.innerText = count;

        countdownInterval = setInterval(function() {
            count--;
            number.innerText = count;

            if(count <= 0) {
                clearInterval(countdownInterval);
                overlay.style.display = "none";
                activateSOS();
            }
        }, 1000);
    });

});

function triggerFakeCall() {
    let name = prompt("Enter Caller Name:", "Mom");
    if(name) {
        document.getElementById("callerName").innerText = name;
    }

    document.getElementById("fakeCallScreen").style.display = "flex";

    let sound = document.getElementById("ringtone");
    sound.play();
}

function endCall() {
    document.getElementById("fakeCallScreen").style.display = "none";

    let sound = document.getElementById("ringtone");
    sound.pause();
    sound.currentTime = 0;
}
let mediaRecorder;
let audioChunks = [];

async function startRecording() {
    document.getElementById("recordStatus").innerText = "🎙 Recording: ON";
document.getElementById("recordStatus").className = "active-status";
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.start();

    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const a = document.createElement("a");
        a.href = audioUrl;
        a.download = "SHEshield_Evidence.mp3";
        a.click();

        audioChunks = [];
    };
}

function stopRecording() {
    document.getElementById("recordStatus").innerText = "🎙 Recording: OFF";
document.getElementById("recordStatus").className = "inactive-status";
    mediaRecorder.stop();
}

function displayContacts() {
    let list = document.getElementById("contactList");
    list.innerHTML = "";

    contacts.forEach(function(contact, index) {

        let li = document.createElement("li");

        let img = document.createElement("img");
        img.src = contact.image;
        img.className = "profile-pic";

        let text = document.createElement("span");
        text.textContent = contact.name + " - " + contact.number;

        // ⭐ Priority Star
        let starBtn = document.createElement("button");
        starBtn.innerHTML = contact.priority ? "⭐" : "☆";

if(contact.priority) {
    starBtn.classList.add("star-active");
}
        starBtn.className = "star-btn";
        starBtn.onclick = function() {
            setPriority(index);
        };

        // 🗑 Delete Button
        let deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = "🗑";
        deleteBtn.className = "delete-btn";
        deleteBtn.onclick = function() {
            deleteContact(index);
        };

        li.appendChild(img);
        li.appendChild(text);
        li.appendChild(starBtn);
        li.appendChild(deleteBtn);

        list.appendChild(li);
    });
}

displayContacts();

function deleteContact(index) {
    contacts.splice(index, 1);
    saveContacts();
    displayContacts();
}

function setPriority(index) {

    // Remove priority from all
    contacts.forEach(contact => contact.priority = false);

    // Set selected contact as priority
    contacts[index].priority = true;

    saveContacts();
    displayContacts();
}
function cancelSOS() {
    clearInterval(countdownInterval);
    document.getElementById("countdownOverlay").style.display = "none";
}

function activateSOS() {
    // Show Emergency Mode UI
document.getElementById("emergencyStatus").style.display = "block";

let priorityContact = contacts.find(contact => contact.priority);

if (priorityContact) {
    document.getElementById("priorityDisplay").innerText =
        "Alerting: ⭐ " + priorityContact.name;
} else {
    document.getElementById("priorityDisplay").innerText =
        "No priority contact selected.";
}
    startRecording();

    navigator.geolocation.getCurrentPosition(function(position) {

        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        document.getElementById("map").style.display = "block";

        if (!map) {
    map = L.map('map').setView([lat, lon], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    marker = L.marker([lat, lon]).addTo(map);
} else {
    marker.setLatLng([lat, lon]);
    map.setView([lat, lon], 15);
}

marker.bindPopup("🚨 You are here!").openPopup();

    });
}
let liveTrackingInterval;
let liveMap;
let liveMarker;

function startLiveTracking() {
    document.getElementById("trackStatus").innerText = "📡 Live Tracking: ON";
document.getElementById("trackStatus").className = "active-status";
    clearInterval(liveTrackingInterval);

    document.getElementById("map").style.display = "block";

    navigator.geolocation.getCurrentPosition(function(position) {

        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        // Create map only once
        if (!liveMap) {
            liveMap = L.map('map').setView([lat, lon], 15);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(liveMap);

            liveMarker = L.marker([lat, lon]).addTo(liveMap)
                .bindPopup("📍 Live Location")
                .openPopup();
        }

        // Update location every 3 seconds
        liveTrackingInterval = setInterval(function() {

            navigator.geolocation.getCurrentPosition(function(pos) {

                let newLat = pos.coords.latitude;
                let newLon = pos.coords.longitude;

                liveMarker.setLatLng([newLat, newLon]);
                liveMap.setView([newLat, newLon]);

            });

        }, 3000);
    });
}

function stopLiveTracking() {
    document.getElementById("trackStatus").innerText = "📡 Live Tracking: OFF";
document.getElementById("trackStatus").className = "inactive-status";
    clearInterval(liveTrackingInterval);
}
function shareTrackingLink() {

    let btn = document.getElementById("shareBtn");
    let message = document.getElementById("linkMessage");

    // Add loading effect
    btn.classList.add("loading");
    btn.innerHTML = "Generating secure link <span class='spinner'></span>";

    setTimeout(function() {

        let fakeLink = "https://sheshield-live-track.com/session/" + 
                       Math.random().toString(36).substring(2, 10);

        navigator.clipboard.writeText(fakeLink);

        btn.classList.remove("loading");
        btn.innerHTML = "📤 Share Tracking Link";

        message.innerText = "✅ Secure tracking link copied!";
        
        setTimeout(function() {
            message.innerText = "";
        }, 3000);

    }, 2000); // 2-second fake processing delay
}
const toggleBtn = document.getElementById("themeToggle");

// Load saved theme
let savedTheme = localStorage.getItem("theme") || "light";
document.body.classList.add(savedTheme);

updateButtonText(savedTheme);

toggleBtn.addEventListener("click", function() {
    if (document.body.classList.contains("light")) {
        document.body.classList.remove("light");
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
        updateButtonText("dark");
    } else {
        document.body.classList.remove("dark");
        document.body.classList.add("light");
        localStorage.setItem("theme", "light");
        updateButtonText("light");
    }
});

function updateButtonText(theme) {
    toggleBtn.innerText = theme === "dark" ? "Switch to Light Mode" : "Enable Stealth Mode";
}

// 🎤 HANDS-FREE VOICE CONTROL (NO BUTTON)

window.addEventListener("load", () => {

    const voiceOutput = document.getElementById("voiceOutput");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        if (voiceOutput) {
            voiceOutput.innerText = "❌ Voice not supported";
        }
        return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;   // keeps listening
    recognition.interimResults = false;
    recognition.lang = "en-US";

    function startListening() {
        recognition.start();
        console.log("Voice started");
        if (voiceOutput) {
            voiceOutput.innerText = "🎤 Listening...";
        }
    }

    recognition.onresult = (event) => {
        const text = event.results[event.results.length - 1][0].transcript.toLowerCase();

        console.log("Heard:", text);

        if (voiceOutput) {
            voiceOutput.innerText = "Heard: " + text;
        }

        // 🚨 SOS
        if (text.includes("help") || text.includes("sos")) {
            document.getElementById("sosBtn").click();
        }

        // 📡 Tracking
        else if (text.includes("start tracking")) {
            startLiveTracking();
        }

        else if (text.includes("stop tracking")) {
            stopLiveTracking();
        }

        // 🎙 Recording
        else if (text.includes("start recording")) {
            startRecording();
        }

        // 📞 Fake call
        else if (text.includes("call")) {
            triggerFakeCall();
        }
    };

    // 🔁 auto restart
    recognition.onend = () => {
        recognition.start();
    };

    // 🚀 start immediately
    startListening();

});

// Aesthetic Mode Toggle
const uiToggle = document.getElementById("uiToggle");

uiToggle.addEventListener("click", () => {
    document.body.classList.toggle("aesthetic-mode");

    if (document.body.classList.contains("aesthetic-mode")) {
        uiToggle.innerText = "🔄 Normal Mode";
        localStorage.setItem("uiMode", "aesthetic");
    } else {
        uiToggle.innerText = "✨ Aesthetic Mode";
        localStorage.setItem("uiMode", "normal");
    }
});

// Load saved mode
if (localStorage.getItem("uiMode") === "aesthetic") {
    document.body.classList.add("aesthetic-mode");
    uiToggle.innerText = "🔄 Normal Mode";
}