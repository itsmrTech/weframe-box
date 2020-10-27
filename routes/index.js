var express = require('express');
var router = express.Router();
var { upsert, getByURL,removeByURLs } = require("../tools/cacheStorage");
var { downloadFile } = require("../tools/file");
var shortid = require("shortid")
var fs=require("fs")
if(!fs.existsSync("public/cache"))fs.mkdirSync("public/cache")
/* GET home page. */
router.get('/files/cache', async function (req, res, next) {
  let { url } = req.query
  let cache = getByURL(url)
  let local_path
  if (cache) local_path = cache.local_path
  else {
    local_path = "public/cache/" + shortid.generate()
    let result = await downloadFile(url, local_path)
    upsert(url, local_path)
  }
  console.log(local_path,cache)

  res.sendFile(local_path, { root: __rootname, headers: { 'Content-Type': 'image/jpeg' } })
});
router.delete('/files/cache',async function(req,res){
  let {urls}=req.body;
  console.log(urls)
  removeByURLs(urls)
  res.status(200).json({done:true})
})

module.exports = router;