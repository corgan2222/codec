/**
 * Payload Decoder for Milesight Network Server
 *
 * Copyright 2024 Milesight IoT
 *
 * @product WS502 v2 physical switch
 */
function Decode(fPort, bytes) {
    return milesight(bytes);
}

function milesight(bytes) {
    var decoded = {};
    injectLoRaData(decoded);

    for (var i = 0; i < bytes.length; ) {
        var channel_id = bytes[i++];
        var channel_type = bytes[i++];

        // IPSO VERSION
        if (channel_id === 0xff && channel_type === 0x01) {
            decoded.ipso_version = readProtocolVersion(bytes[i]);
            i += 1;
        }
        // HARDWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x09) {
            decoded.hardware_version = readHardwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // FIRMWARE VERSION
        else if (channel_id === 0xff && channel_type === 0x0a) {
            decoded.firmware_version = readFirmwareVersion(bytes.slice(i, i + 2));
            i += 2;
        }
        // DEVICE STATUS
        else if (channel_id === 0xff && channel_type === 0x0b) {
            decoded.device_status = 1;
            i += 1;
        }
        // LORAWAN CLASS TYPE
        else if (channel_id === 0xff && channel_type === 0x0f) {
            decoded.lorawan_class = bytes[i];
            i += 1;
        }
        // SERIAL NUMBER
        else if (channel_id === 0xff && channel_type === 0x16) {
            decoded.sn = readSerialNumber(bytes.slice(i, i + 8));
            i += 8;
        }
        // SWITCH STATE
        else if (channel_id === 0x08 && channel_type === 0x29) {
            // payload (0 0 0 0 0 0 0 0)
            //  Switch    3 2 1   3 2 1
            //          ------- -------
            // bit mask  change   state
            decoded.switch_1 = bytes[i] & 1;
            decoded.switch_1_change = (bytes[i] >> 4) & 1;

            decoded.switch_2 = (bytes[i] >> 1) & 1;
            decoded.switch_2_change = (bytes[i] >> 5) & 1;
            i += 1;
        } else {
            break;
        }
    }

    return decoded;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readInt16LE(bytes) {
    var ref = readUInt16LE(bytes);
    return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes) {
    var ref = readUInt32LE(bytes);
    return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function readProtocolVersion(bytes) {
    var major = (bytes & 0xf0) >> 4;
    var minor = bytes & 0x0f;
    return "v" + major + "." + minor;
}

function readHardwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = (bytes[1] & 0xff) >> 4;
    return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes) {
    var major = bytes[0] & 0xff;
    var minor = bytes[1] & 0xff;
    return "v" + major + "." + minor;
}

function readSerialNumber(bytes) {
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
    }
    return temp.join("");
}


function injectLoRaData(decoded) {
    decoded.devEUI = LoRaObject.devEUI;
    decoded.applicationName = LoRaObject.applicationName;
    decoded.deviceName = LoRaObject.deviceName;
    decoded.rssi = LoRaObject.rxInfo[0].rssi;
    decoded.loRaSNR = LoRaObject.rxInfo[0].loRaSNR;
    decoded.mac = LoRaObject.rxInfo[0].mac;
    decoded.gw = LoRaObject.rxInfo[0].name;
    decoded.timestamp = LoRaObject.time;
    decoded.type = 'WS502v2physicalswitch';

    return decoded;
}
