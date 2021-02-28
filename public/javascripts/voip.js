const HOST = "https://192.168.0.171:4020"
const DEVICE_CODE = (window.location.hash) ? window.location.hash.slice(1) : "PPBqWA9"
navigator.getUserMedia({ video: true, audio: false }, function (stream) {

    var socket = io(HOST);
    socket.on("hand-shake", (data) => {
        socket.emit("hand-shake", { panel: true })
    })
    var peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: stream
    })
    peer.on('signal', function (data) {
        socket.emit("voip-signal", { signal: data, device_code: DEVICE_CODE })
    })
    socket.on("voip-peering", function (otherSignal) {
        peer.signal(otherSignal)

    })
    peer.on('stream', function (stream) {
        var video = document.createElement('video')
        document.body.appendChild(video)
    
        video.srcObject=stream
        video.play()
      })
}, function (err) {

})