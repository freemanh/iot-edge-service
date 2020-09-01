const fs = require('fs');

let product = JSON.parse(fs.readFileSync('./products/sample-product.json'));
let device = JSON.parse(fs.readFileSync('./devices/sample-device.json'));

// create an empty modbus client
var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU();

// open connection to a tcp line
client.connectTCP("192.168.0.203", { port: 502 });
client.setID(device.slaveId);

// read the values of 10 registers starting at address 0
// on device number 1. and log the values to the console.
setInterval(function () {
    var results = []
    product.properties.forEach(prop => {
        client.readHoldingRegisters(prop.register.start, prop.register.quantity, function (err, data) {
            results.push({ "index": prop.code, "name": prop.name, "value": data.data[0] * (prop.data.step * 1000) / 1000 })
        });
    });

    setTimeout(() => {
        console.log('time: ' + new Date().toLocaleTimeString())
        console.log(results)
    }, 3000);

}, 5000);

