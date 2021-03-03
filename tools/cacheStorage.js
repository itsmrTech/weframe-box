var fs = require("fs")
global.images_cache = []
if (!fs.existsSync("cache.json")) fs.writeFileSync("cache.json", JSON.stringify(global.images_cache), { encoding: "utf-8" })
else {
    try {
        let data = JSON.parse(fs.readFileSync("cache.json",{encoding:"utf-8"}))
        global.images_cache = data;
    }
    catch (e) {
        fs.writeFileSync("cache.json", JSON.stringify([]), { encoding: "utf-8" })

    }
}
const updateFile = async () => {
    fs.writeFileSync("cache.json", JSON.stringify(global.images_cache), { encoding: "utf-8" })
}
const upsert = async (url, local_path) => {
    let foundIndex = global.images_cache.findIndex(v => v.url == url)
    if (foundIndex == -1) global.images_cache.push({ url, local_path })
    else
        global.images_cache[foundIndex] = { url, local_path }
    updateFile()
}
const getByURL=(url)=>{
    return global.images_cache.find(v => v.url == url)
}
const removeByURLs=async(urls)=>{
    console.log(global.images_cache.length)
    global.images_cache=global.images_cache.filter(cache=>{
        let found=false;
        urls.map(url=>{
            if(cache.url==url){
                found=true;
                fs.unlink(cache.local_path,()=>{})
            }
        })
        console.log('omiting',cache,found)
        return found
    })
    console.log(global.images_cache.length)

    updateFile()

}
module.exports = { upsert,getByURL,removeByURLs }