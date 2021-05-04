var express = require('express');
var router = express.Router();
var { upsert, getByURL, removeByURLs } = require("../tools/cacheStorage");
var { downloadFile } = require("../tools/file");
var shortid = require("shortid")
var fs = require("fs")
console.log('does public cache exists', fs.existsSync("public/cache"), fs.readdirSync('public/cache')?.length)
if (!fs.existsSync("public/cache")) fs.mkdirSync("public/cache")
console.log('second does public cache exists', fs.existsSync("public/cache"), fs.readdirSync('public/cache')?.length)

router.get('/firmware', async function (req, res, next) {
  return res.status(200).json({
    build: 19
  })
})
/* GET home page. */
router.get('/files/cache', async function (req, res, next) {
  let { url } = req.query
  console.log('url', url)
  let cache = getByURL(url)
  let local_path
  console.log("found cache", cache)
  if (cache) {
    local_path = cache.local_path
    console.log('local_path', local_path, fs.existsSync(local_path))
    if (!fs.existsSync(local_path)) {
      local_path = "public/cache/" + shortid.generate()
      let result = await downloadFile(url, local_path)
      upsert(url, local_path)
    }
  }
  else {
    console.log('new file, going to DOWNLOAD')
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
