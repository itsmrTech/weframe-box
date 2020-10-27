const si = require('systeminformation');
var wifi = require('node-wifi');
const axios = require('axios')
const async = require('async')
const nodeDiskInfo = require('node-disk-info')
var piWifi = require('pi-wifi');



async function sendSystemInfo() {

    wifi.init({
        iface: null // network interface, choose a random wifi interface if set to null
    });

    var osInfoResult = await si.osInfo();



    async.parallel({

        current_load: (callback) => {
            si.currentLoad()
                .then(status => {
                    // console.log("CPU current load (%): ", data.currentload)
                    callback(null, status)
                })
                .catch(error => callback(error))
        },
        cpu_temperature: (callback) => {
            si.cpuTemperature()
                .then(data => {
                    // console.log("cpuTemperature: ", data.main)
                    callback(null, data.main)
                })
                .catch(error => callback(error))
        },
        network_interfaces: (callback) => {
            si.networkInterfaces()
                .then(data => {
                    // console.log("networkInterfaces: ", data)
                    callback(null, data)
                })
                .catch(error => callback(error))
        },
        current_wifi: (callback) => {
            console.log("os_distro: ", osInfoResult.distro)
            if (osInfoResult.distro.toLowerCase().indexOf("raspbian") != -1) {

                piWifi.status('wlan0', function (err, status) {
                    if (err) {
                        return console.error(err.message);
                    }
                    console.log("wifi status:",status);
                    callback(null,status);
                });
                // piWifi.status('wlan0')
                // .then(status=>{console.log(status);
                //     callback(null,status)})
                //     .catch(error => callback(error))    
                
            } else {

                wifi.getCurrentConnections()
                    .then(data => {
                        callback(null, data)
                    })
                    .catch(error => callback(error))
            }
        },

        battery: (callback) => {
            si.battery()
                .then(data => {
                    // console.log("battery: ", data)
                    callback(null, data)
                })
                .catch(error => callback(error))

        },
        time: (callback) => {
            callback(null, si.time())
        },
        disk_layout: (callback) => {
            si.diskLayout()
                .then(data => {
                    callback(null, data)
                })
                .catch(error => callback(error))
        },
        ram: (callback) => {
            si.mem()
                .then(data => {
                    callback(null, data)
                })
                .catch(error => callback(error))
        },

        inet_latency: (callback) => {
            return {}
            si.inetLatency("194.5.193.188")
                .then(data => {
                    // console.log("response time in ms", data)
                    callback(null, data)
                })
                .catch(error => callback(error))
        },

        disk_info: (callback) => {
            nodeDiskInfo.getDiskInfo()
                .then(data => {
                    // console.log("disk_info", data)
                    callback(null, data)
                })
                .catch(error => callback(error))
        }



    }, (err, res) => {
        result = {
            device_code: "PPBqWA9",
            performance: {
                cpu_current_load: res.current_load.currentload,
                cpu_average_temperature: res.cpu_temperature.main,
                networks: res.network_interfaces,
                wifi_name: (res.current_wifi[0].ssid)||(res.current_wifi.ssid),
                wifi_quality: (res.current_wifi[0].quality)||(res.current_wifi.frequency),
                battery: res.battery,
                ram_total: res.ram.total,
                ram_free: res.ram.free,
                current_time: res.time.current,
                uptime: res.time.uptime,
                timezone: res.time.timezone,
                timezone_name: res.time.timezoneName,
                server_ping: res.inet_latency,
                disk_info: res.disk_info,

            }
        }
        console.log("result: ", result)
        // axios.post('https://api.dev.together.shamot.ir/devices/stats', result)
        // .then(response=>{
        //     console.log("response: ",response.data,"response code: ",response.status)
        // })
        // .catch(error=>{
        //     console.log("error: ",error)
        // })
    })






    // wifi.init({
    //   iface: null // network interface, choose a random wifi interface if set to null
    // });
    // wifi.getCurrentConnections((error, currentConnections) => {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log(currentConnections);
    //     /*
    //     // you may have several connections
    //     [
    //         {
    //             iface: '...', // network interface used for the connection, not available on macOS
    //             ssid: '...',
    //             bssid: '...',
    //             mac: '...', // equals to bssid (for retrocompatibility)
    //             channel: <number>,
    //             frequency: <number>, // in MHz
    //             signal_level: <number>, // in dB
    //             quality: <number>, // same as signal level but in %
    //             security: '...' //
    //             security_flags: '...' // encryption protocols (format currently depending of the OS)
    //             mode: '...' // network mode like Infra (format currently depending of the OS)
    //         }
    //     ]
    //     */
    //   }
    // });






    // si.networkInterfaceDefault()
    // .then(data => console.log("defaultInterfaces: ",data))
    // .catch(error => console.error("networkInterfaces error: ",error));








    // si.diskLayout()
    // .then(data => console.log("diskLayout: ",data))
    // .catch(error => console.error("diskLayout error: ",error));

    // si.fsSize()
    // .then(data => console.log("fsSize: ",data))
    // .catch(error => console.error("fsSize error: ",error));




}

sendSystemInfo();