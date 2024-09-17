# Enhanced Payload Decoder for Milesight Network Server

This is a fork from the [official Milesight Repo.](https://github.com/Milesight-IoT/codec)

I added usefull and for us needed information about the sensor to the payload encoder to use this information via mqtt.

# Added info

the added infos are based on the [LoRaObject](https://github.com/Milesight-IoT/SensorDecoders/blob/main/LoRaObject.md)

```json
    decoded.devEUI = LoRaObject.devEUI;
    decoded.applicationName = LoRaObject.applicationName;
    decoded.deviceName = LoRaObject.deviceName;
    decoded.rssi = LoRaObject.rxInfo[0].rssi;
    decoded.loRaSNR = LoRaObject.rxInfo[0].loRaSNR;
    decoded.mac = LoRaObject.rxInfo[0].mac;
    decoded.gw = LoRaObject.rxInfo[0].name;
    decoded.timestamp = LoRaObject.time;
    decoded.type = 'AM307L';
```

# Before

```json
{ 
  "battery": 96,
  "co2": 421, 
  "humidity": 56,
  "light_level": 4,
  "pir": 1,
  "pressure": 1025.4,
  "temperature": 27.8,
}
```
# After
```json
{
  "devEUI": "24e124707e111005",
  "deviceName": "Multisensor AM307L",
  "type": "AM307L",
  "gw": "Local Gateway",  
  "mac": "24e124fffef8706c",
  "timestamp": "2024-09-17T18:04:35.151882Z",
  "applicationID": 5,
  "applicationName": "cloud",  
  "loRaSNR": 10.5,
  "rssi": -89,

  "battery": 96,
  "co2": 421,
  "humidity": 56,
  "light_level": 4,
  "pir": 1,
  "pressure": 1025.4,  
  "temperature": 27.8,
  "tvoc": 1,  
}
```

# How to use on UG65+ Gateways

1. Download this repo as [ZIP file](https://github.com/corgan2222/codec/archive/refs/heads/release.zip).
2. On your Milesight Gateway go to "Network Server/Payload Codec"
3. Choose Local upload and select the downloaded release.zip

Only the bigger Gateways have the feature to upload all codecs at once. On the smaler gateways like the UG63 mini you have to copy each payload codec by hand.


