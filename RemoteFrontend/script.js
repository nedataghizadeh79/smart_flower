// import mqtt module
const mqtt = require('mqtt');

let isManual = false;
let isPumpOn = false;
let isLightOn = false;

const toggleContainer = document.getElementById('toggleContainer');
const toggleButton = document.getElementById('toggleButton');
const lightWaterContainer = document.getElementById('light-water');

const lightButton = document.getElementById("light");
const waterButton = document.getElementById("water");


//////////////////////////////// MQTT Stuff ////////////////////////////////

// Create a client instance
const client = mqtt.connect('ws://ae7977bb.emqx.cloud:8083/mqtt', {
    username: 'pot3',
    password: 'pot3',
    clientId: 'pot3',
    clean: true,
});

client.on('connect', onConnect);
client.on('message', onMessageArrived);
client.on('error', onFailure);
client.on('disconnect', onConnectionLost);


console.log("trying to connect");

// Called when the client connects successfully
function onConnect() {
    console.log("Connected to MQTT broker");

    // Subscribe to a topic
    client.subscribe("data");
    // client.subscribe("mode");
}

// Called when the connection is lost
function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.log("Connection lost: " + responseObject.errorMessage);
    }
}

// Called when a message arrives
function onMessageArrived(topic, message) {
    console.log("Received message on " + topic + " -> " + message.toString());
    if (topic != "data") {
        return;
    }

    metrics = JSON.parse(message.toString())["metrics"];
    updateMetrics(metrics);

    // isManual = metrics["manual"] == 1;
    updateForState(false);
}

// Called when the connection fails
function onFailure(error) {
    console.log("Connection failed: " + error.errorMessage);
}


//////////////////////////////// UI Stuff ////////////////////////////////


function sendSignal() {

    if (!isManual) {
        isLightOn = false;
        isPumpOn = false;
    }

    if (!isLightOn) {
        lightButton.classList.add("off");
    } else {
        lightButton.classList.remove("off");
    }

    if (!isPumpOn) {
        waterButton.classList.add("off");
    } else {
        waterButton.classList.remove("off");
    }

    messageJson = {
        "mode" : isManual ? 1 : 0,
        "light" : isLightOn ? 1 : 0,
        "pump" : isPumpOn? 1 : 0
    }

    client.publish("mode", JSON.stringify(messageJson) , {qos:2 , retain:true} );
    console.log("salam2")

}


lightButton.addEventListener("click", function() {
    isLightOn = !isLightOn;
    sendSignal();
});

// Button 2 click event handler
document.getElementById("water").addEventListener("click", function() {
    isPumpOn = !isPumpOn;
    sendSignal();
});



function updateForState(shouldSendSignal) {
    if (isManual) {
        toggleButton.textContent = 'Manual';
        toggleContainer.classList.add('active');
        lightWaterContainer.classList.remove('disabled');
    } else {
        toggleButton.textContent = 'Automatic';
        toggleContainer.classList.remove('active');
        lightWaterContainer.classList.add('disabled');
    }
    if (shouldSendSignal) {
        sendSignal();
    }
    console.log("salam6")

}

// Function to handle the toggle state
function toggleState() {
    isManual = !isManual;
    updateForState(true);
}

function updateMetrics(metrics) {
    document.getElementById("tempareture-value").textContent = metrics["temp"];
    document.getElementById("humidity-value").textContent = metrics["hum"];
    document.getElementById("moisture-value").textContent = metrics["moisture_value"];

    if (metrics["light_value"] == 1) {
        document.getElementById("brightness").classList.remove("off");
    } else {
        document.getElementById("brightness").classList.add("off");
    }

    if (metrics["moisture_state"] == 1) {
        document.getElementById("moisture").classList.remove("off");
    } else {
        document.getElementById("moisture").classList.add("off");
    }

    if (metrics["water_lvl"] == 1) {
        document.getElementById("waterlevel").classList.remove("off");
    } else {
        document.getElementById("waterlevel").classList.add("off");
    }
    console.log("salam3")

}




// Add a click event listener to the toggle button
toggleButton.addEventListener('click', toggleState);
