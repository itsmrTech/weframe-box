var Axios =require("axios");
var fs=require("fs");
async function downloadFile(fileUrl, outputLocationPath) {
    const writer = fs.createWriteStream(outputLocationPath);
  
    return Axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    }).then(response => {
      console.log('fetched')
  // console.log(response.data)
      //ensure that the user can call `then()` only when the file has
      //been downloaded entirely.
  
      return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        let error = null;
        writer.on('error', err => {
          error = err;
          writer.close();
          reject(err);
        });
        writer.on('close', () => {
          if (!error) {
            resolve(true);
          }
          //no need to call the reject here, as it will have been called in the
          //'error' stream;
        });
      });
    }).catch(e=>{
      console.error('dl err',e)
    });
  }
  module.exports={downloadFile}