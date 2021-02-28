
const HOST = "https://api.dev.together.shamot.ir"
const DOMAIN = ".shamot.ir"
const DEVICE_CODE = (window.location.hash) ? window.location.hash.slice(1) : "PPBqWA9"
var firmware = {
    build: -1
}
// let slideshow = {
//     photos:[]
// }
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;domain=" + DOMAIN;
}
setCookie("device-code", DEVICE_CODE)
function getFirmwareInfo(cb=()=>{}) {
    axios.get("http://localhost:3002/firmware").then(response => {
        return cb(response.data)
    }).catch(e => {
        return cb(firmware)
    })
}
function setFirmware(){
   getFirmwareInfo((newFirmware)=>{
       firmware={...newFirmware}
       console.log("weFrame Firmware build ",firmware.build)
   })
}
setFirmware()
setInterval(function () {
    if(firmware.build==-1)setFirmware()
    var newFirmware = getFirmwareInfo
    if (newFirmware.build > firmware.build)
        location.reload();

}, 1 * 60 * 1000)

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
let fadeOutById = (id) => {
    document.getElementById(id).style.opacity = 0
}
let fadeInById = (id) => {
    document.getElementById(id).style.opacity = 1
}
let showOnly = (name) => {
    switch (name) {
        case "pairing":
            fadeOutById("slideshow")
            fadeOutById("video-container")
            fadeOutById("home-container")
            fadeInById("setup")
            fadeInById("pairing-container")
            fadeOutById("complete-setup-container")
            clearInterval(clockIntrv)
            clearInterval(slideshowInterval)



            break;
        case "paired":
            fadeInById("setup")
            fadeInById("complete-setup-container")
            fadeOutById("pairing-container")
            fadeOutById("slideshow")
            fadeOutById("video-container")
            fadeOutById("home-container")
            clearInterval(clockIntrv)
            clearInterval(slideshowInterval)



            break;
        case "home":
            fadeOutById("setup")
            fadeOutById("slideshow")
            fadeOutById("video-container")
            fadeInById("home-container")
            initClock()
            clearInterval(slideshowInterval)

            break;
        case "slideshow":
            fadeOutById("setup")
            fadeInById("slideshow")
            fadeOutById("video-container")
            fadeOutById("home-container")
            clearInterval(clockIntrv)


            break;
        case "voip":
            fadeOutById("setup")
            fadeOutById("slideshow")
            fadeInById("video-container")
            fadeOutById("home-container")
            clearInterval(clockIntrv)
            clearInterval(slideshowInterval)


            break;
    }
}
var getBrowserInfo = (cb = () => { }) => {
    axios.get("https://www.cloudflare.com/cdn-cgi/trace").then(response => {
        console.log("cf", response.data)
        let lines = response.data.split(/\r\n|\n|\r/);
        console.log("lines", lines)
        let cfData = {}
        lines.map(l => {
            let key = l.split("=")
            cfData[key[0]] = key[1]
        })
        console.log("cloudflare", cfData)
        return cb(null, { loc: cfData.loc, colo: cfData.colo, ip: cfData.ip, uag: cfData.uag })
        // axios.get("http://api.geonames.org/timezoneJSON?lat=47.01&lng=10.2&username=mrtech").then(geoResp => {
        //         return cb(null, response.data)

        //     }).catch(e => {
        //         return cb(e)
        //     })
    }).catch(e => {
        return cb(e)
    })
}
let info = {}
getBrowserInfo((err, data) => {
    if (err) return;
    info = data;
    console.log(moment().tz("America/Los_Angeles").format("jYYYY/jM/jD hh:mm"))
})
var socket = io(HOST);
var user = {}
var Device = (!getCookie("device") || getCookie("device") == "") ? {} : getCookie("device")
if (Device.language == "fa") {
    moment.loadPersian({ dialect: "persian-modern" })
    document.getElementsByTagName(body)[0].style.font = `14px "SahelBold", "Lucida Grande", Helvetica, Arial, sans-serif`;
    document.getElementById("home-calendar").style["font-size"] = "10vw";
}
function updateCalendar() {
    console.log("m")
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (Device && Device.timezone) timezone = Device.timezone
    console.log(timezone, Device.timezone)
    console.log("m", moment().tz(timezone).format((Device.calendar == "jalali") ? "jdddd jD jMMMM jYY" : "ddd D MMMM YYYY"))
    let setCal = () => {
        try {
            document.getElementById("home-calendar").innerText = moment().tz(timezone).format((Device.calendar == "jalali") ? "dddd jD jMMMM jYY" : "ddd D MMMM YYYY")
        } catch (e) {
            console.log("triggered")
            setTimeout(() => setCal(), 2000)
        }
    }
    setCal()

}
setTimeout(() => {

    updateCalendar();
}, 5000)
socket.on("hand-shake", (data) => {
    console.log("hand shaking")
    socket.emit("hand-shake", { device_code: DEVICE_CODE })
})
socket.on("you-there", (data) => {
    console.log("ping!", data)
    if (!data) return
    socket.emit("im-here", { timestamp: Date.now(), id: data.id })
})
socket.on("slideshow", (data) => {
    let { slideshow, device } = data
    Device = device
    setCookie("device", JSON.stringify(device))
    slideshow.photos = slideshow.photos.map(photo => `http://localhost:3002/files/cache?url=${photo}?device-code=${DEVICE_CODE}`)
    console.log(slideshow)
    if (slideshow.photos && slideshow.photos.length > 0) {
        showOnly("slideshow")
        return genJsSlideshow(slideshow.photos)
    }
    showOnly("home")



})
socket.on("setup-pairing", (data) => {
    showOnly("pairing")

    showCode(data.code)
    // if(expirationIntrv)clearInterval(expirationIntrv)
    showExpiration(data.expireAt)
    console.log(new Date(data.expireAt))
})
socket.on("setup-paired", data => {
    user = data.user;
    showOnly("paired")
    setTimeout(() => {
        document.getElementById("complete-setup-container").innerHTML = `
        
        <h1 style="
            font-size: 13vw;
            margin-bottom: 0;
        ">${genGreeting(user.firstName)}</h1>
        <h2 style="
            font-size: 4vw;
        ">I need a name. You can set one in the panel.</h2></div>
        `
    }, 5000)
})
socket.on("setup-name", data => {
    setCookie("device", JSON.stringify(data.device))
    Device = data.device
    updateCalendar()
    document.getElementById("complete-setup-container").innerHTML = `
        
        <h1 style="
            font-size: 13vw;
            margin-bottom: 0;
        ">Hmm, So my name is ${data.device.name}. I like it :D</h1>
        `

})
socket.on("weather", data => {
    console.log("weather")
    document.getElementById("weather").innerHTML = `
    <image src="/images/weather/${data.weather.icon}.png" />
    <span id="temperature">${data.app_temp}°</span>
    `;
})
const genGreeting = (name) => {
    let curr = new Date()
    let h = curr.getHours()
    let time = ""
    if (h < 5) time = "night"
    else if (h < 12) time = "morning"
    else if (h < 16) time = "afternoon"
    else if (h < 20) time = "evening"
    else time = "night"

    return `Good ${time}, ${name}!`
}

var peer;
var video;
socket.on("signal", (otherSignal) => {
    console.log("signal", otherSignal, peer)
    if (peer) return;
    navigator.getUserMedia({ video: true, audio: true }, function (stream) {
        console.log("get user media")
        peer = new SimplePeer({
            initiator: false,
            reconnectTimer: 100,
            iceTransportPolicy: 'relay',
            trickle: false,
            stream: stream,
            config: {
                iceServers: [
                    { urls: 'turn:194.5.193.188:3478', username: 'shamot.group@gmail.com', credential: 'wjxQjRnsmNrv8uAU' }

                ]
            }
        })
        peer.on('stream', function (stream) {
            if (!video) {
                video = document.createElement('video')
                document.getElementById("video-container").appendChild(video)
            }

            video.srcObject = stream
            video.play()
            showOnly("voip")
        })
        console.log("other", otherSignal)
        peer.signal(otherSignal.signal)
        peer.on('signal', function (data) {
            socket.emit("signal", { signal: data, panelid: otherSignal.panelid })
        })
        peer.on("error", function (error) {
            console.error("WEBRTC Error:", error)
            socket.emit("webrtc-error", { error, panelid: otherSignal.panelid })
            location.reload();

        })
        peer.on('close', () => {
            socket.emit("webrtc-closed", { panelid: otherSignal.panelid })
            location.reload();

        })
    }, function (err) {

    })
})
socket.on("hangup", (data) => {
    console.log("hangup")
    location.reload();
})
// function updateSlideshow(photos) {
//     let diff = photos.length - slideshow.photos.length
//     if(diff>=0){
//         slideshow.photos.map((old_photo, i) => {
//             if (photos[i] == old_photo) return
//             slideshow.photos[i] = photos[i]

//         })
//     }
//     else{
//         photos.map((new_photo, i) => {
//             if (slideshow.photos[i] == new_photo) return
//             slideshow.photos[i] = photos[i]
//         })
//     }
//     if(diff>0){
//         for(let i=slideshow.photos.length;i<photos;i++){
//             slideshow.photos.push(photos[i])
//         }
//     }


// }
let slideshowInterval
function genJsSlideshow(photos) {
    let delay = 15;
    let html = ``
    let buffer_count = 4;
    if (buffer_count > photos.length) buffer_count = photos.length;
    let buffer = photos.slice(0, buffer_count)
    buffer.map((photo, i) => {
        $("#slideshow").append(`<li>
        <span style="background-image:url('${photo}'); opacity:0;"></span>
        </li>`)
    })
    $(`#slideshow li:nth-child(1) span`).css("opacity", 1);
    let index = 0;
    slideshowInterval = setInterval(() => {
        console.log("change")
        $(`#slideshow li:nth-child(1) span`).css("opacity", 0);
        setTimeout(() => {
            $(`#slideshow li:nth-child(1)`).remove();
            $("#slideshow").append(`<li>
            <span style="background-image:url('${photos[(buffer_count + index) % photos.length]}'); opacity:0;"></span>
            </li>`);
            index++;
            $(`#slideshow li:nth-child(1) span`).css("opacity", 1);

        }, 1000)

    }, delay * 1000)
}
function updateSlideshow(photos) {
    let delay = 10;
    let html = `<style>
    @keyframes imageAnimation {
        0% {
          opacity: 0;
          -webkit-animation-timing-function: ease-in;
          -moz-animation-timing-function: ease-in;
          animation-timing-function: ease-in;
        }
        ${1 * 100 / (photos.length * 4)}% {
          opacity: 1;
          -webkit-animation-timing-function: ease-out;
          -moz-animation-timing-function: ease-out;
          animation-timing-function: ease-out;
        }
        ${3 * 100 / (photos.length * 4)}% {
          opacity: 1;
        }${(photos.length != 1) ?
            `${1 * 100 / photos.length}% {
          opacity: 0;
        }
        100% {
          opacity: 0;
        }`: ""}
      }
    </style>`
    photos.map((photo, i) => {
        html += `<li>
    <span style="background-image:url('${photo}');
    -webkit-animation-delay: ${i * delay}s;
    -moz-animation-delay: ${i * delay}s;
     animation-delay: ${i * delay}s;
     -webkit-animation-duration: ${(photos.length) * delay}s;
    -moz-animation-duration: ${(photos.length) * delay}s;
     animation-duration: ${(photos.length) * delay}s;
     ${(photos.length == 1) ? "animation-iteration-count: 1; animation-fill-mode:forwards; opacity:1;" : ""}"></span>
    </li>`
    })
    document.getElementById("slideshow").innerHTML = html;
}
// axios.get(HOST + '/slideshows?device_code=' + DEVICE_CODE)
//     .then(function (response) {
//         // handle success
//         console.log(response);
//         slideshow = { ...response.data };
//         updateSlideshow(slideshow.photos)


//     })
//     .catch(function (error) {
//         // handle error
//         console.log(error);
//     })
//     .then(function () {
//         // always executed
//     });