/**
 * Payload Decoder for Milesight Network Server
 *
 * Copyright 2024 Milesight IoT
 *
 * @product VS133
 */
function Decode(fPort, bytes) {
    return milesight(bytes);
}

total_in_chns = [0x03, 0x06, 0x09, 0x0c];
total_out_chns = [0x04, 0x07, 0x0a, 0x0d];
period_chns = [0x05, 0x08, 0x0b, 0x0e];

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
        else if (channel_id === 0xff && channel_type === 0x1f) {
            decoded.firmware_version = readFirmwareVersion(bytes.slice(i, i + 4));
            i += 4;
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
        // LINE TOTAL IN
        else if (includes(total_in_chns, channel_id) && channel_type === 0xd2) {
            var channel_in_name = "line_" + ((channel_id - total_in_chns[0]) / 3 + 1);
            decoded[channel_in_name + "_total_in"] = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // LINE TOTAL OUT
        else if (includes(total_out_chns, channel_id) && channel_type === 0xd2) {
            var channel_out_name = "line_" + ((channel_id - total_out_chns[0]) / 3 + 1);
            decoded[channel_out_name + "_total_out"] = readUInt32LE(bytes.slice(i, i + 4));
            i += 4;
        }
        // LINE PERIOD
        else if (includes(period_chns, channel_id) && channel_type === 0xcc) {
            var channel_period_name = "line_" + ((channel_id - period_chns[0]) / 3 + 1);
            decoded[channel_period_name + "_period_in"] = readUInt16LE(bytes.slice(i, i + 2));
            decoded[channel_period_name + "_period_out"] = readUInt16LE(bytes.slice(i + 2, i + 4));
            i += 4;
        }
        // REGION COUNT
        else if (channel_id === 0x0f && channel_type === 0xe3) {
            decoded.region_1_count = readUInt8(bytes[i]);
            decoded.region_2_count = readUInt8(bytes[i + 1]);
            decoded.region_3_count = readUInt8(bytes[i + 2]);
            decoded.region_4_count = readUInt8(bytes[i + 3]);
            i += 4;
        }
        // REGION DWELL TIME
        else if (channel_id === 0x10 && channel_type === 0xe4) {
            var dwell_chn_name = "region_" + bytes[i];
            decoded[dwell_chn_name + "_avg_dwell"] = readUInt16LE(bytes.slice(i + 1, i + 3));
            decoded[dwell_chn_name + "_max_dwell"] = readUInt16LE(bytes.slice(i + 3, i + 5));
            i += 5;
        } else {
            break;
        }
    }

    return decoded;
}

function readUInt8(bytes) {
    return bytes & 0xff;
}

function readUInt16LE(bytes) {
    var value = (bytes[1] << 8) + bytes[0];
    return value & 0xffff;
}

function readUInt32LE(bytes) {
    var value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
    return (value & 0xffffffff) >>> 0;
}

function includes(datas, value) {
    var size = datas.length;
    for (var i = 0; i < size; i++) {
        if (datas[i] == value) {
            return true;
        }
    }
    return false;
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
    var temp = [];
    for (var idx = 0; idx < bytes.length; idx++) {
        temp.push((bytes[idx] & 0xff).toString(10));
    }
    return temp.join(".");
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
    decoded.type = 'VS133';

    return decoded;
}
