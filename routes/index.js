var express = require('express');
var router = express.Router();
var { upsert, getByURL, removeByURLs } = require("../tools/cacheStorage");
var { downloadFile } = require("../tools/file");
var shortid = require("shortid")
var fs = require("fs")
if (!fs.existsSync("public/cache")) fs.mkdirSync("public/cache")
router.get('/firmware', async function (req, res, next) {
  return res.status(200).json({
    build: 15
  })
})
/* GET home page. */
router.get('/files/cache', async function (req, res, next) {
  let { url } = req.query
  console.log('url', url)
  let cache = getByURL(url)
  let local_path
  console.log(cache)
  if (cache) {
    local_path = cache.local_path
    if (!fs.existsSync(local_path)) {
      local_path = "public/cache/" + shortid.generate()
      let result = await downloadFile(url, local_path)
      upsert(url, local_path)
    }
  }
  else {
    local_path = "public/cache/" + shortid.generate()
    let result = await downloadFile(url, local_path)
    upsert(url, local_path)
  }
  console.log(local_path, cache)

  res.sendFile(local_path, { root: __rootname, headers: { 'Content-Type': 'image/jpeg' } })
});
router.delete('/files/cache', async function (req, res) {
  let { urls } = req.body;
  console.log('delete', urls)
  removeByURLs(urls)
  res.status(200).json({ done: true })
})
router.get('/files/cache/total', async function (req, res) {
  return res.status(200).json({
    urls: global.images_cache.map(im => im.url)
  })
})

module.exports = router;
