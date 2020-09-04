const fs = require('fs');

let devices = []

let files = fs.readdirSync('./devices')
files.forEach(file => {
    devices.push(JSON.parse(fs.readFileSync(`./devices/${file}`)))
})

// create an empty modbus client
var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU();

// open connection to a tcp line
client.connectTCP("192.168.0.203", { port: 502 }).then(() => {

    devices.forEach(async (device) => {
        let product = JSON.parse(fs.readFileSync(`./products/${device.product}.json`));

        console.log(`start to read data of [${device.name}]`)

        // reset device data property
        device.data.lastTimestamp = new Date().getTime()
        device.data.items.length = 0


        client.setID(device.slaveId);

        product.properties.forEach(async (prop) => {
            console.log(prop.name)

            var val = {}
            if (prop.readCmd == 3) {
                val = await client.readHoldingRegisters(prop.register.start, prop.register.quantity);
            } else if (prop.readCmd == 4) {
                val = await client.readInputRegisters(prop.register.start, prop.register.quantity)
            } else if (prop.readCmd == 1) {
                val = await client.readCoils(prop.register.start, prop.register.quantity)
            }

            device.data.items.push({ "index": prop.code, "name": prop.name, "value": val.data[0] * (prop.data.step * 1000) / 1000 })

        });

        console.log(device.data)

    })
});





