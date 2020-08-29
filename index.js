const si = require('systeminformation');
 
// promises style - new since version 3
// si.cpu()
//   .then(data => console.log(data))
//   .catch(error => console.error(error));
si.cpuCurrentspeed()
.then(data => console.log(data))
  .catch(error => console.error(error));

  si.currentLoad()
.then(data => console.log(data))
  .catch(error => console.error(error));

  si.getAllData()
.then(data => console.log(data))
  .catch(error => console.error(error));

  si.wifiNetworks()
.then(data => console.log(data))
  .catch(error => console.error(error));

  si.networkStats()
.then(data => console.log(data))
  .catch(error => console.error(error));

  si.cpuTemperature()
.then(data => console.log(data))
  .catch(error => console.error(error));