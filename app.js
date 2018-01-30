// var socket = require("socket.io-client")("https://rustmoney.com:2096", {
//     query: 'token=b14541fc642cfaa8fdfbb285a2f23a3256bf4fcdb06cf43f998c310c4e0e29e93a50f20e24e85d0a185bb907245b43e78dfbe6fc9512509d05ae34f9b13a98799d8756d8eb2261f13926462b27e6f9c6481d7ee41e9b3a6119932e8dbd7285aae35336db638719625b24b1ecaa6475dad6858391aa7a3655ba9245742a5e9c74a0e204d9735fdd3f6b8b5570293181b9',
//     reconnection: false
// });
var csvWriter = require('csv-write-stream');
var fs = require("fs")
var io = require('socket.io-client');
var path = require("path");
var socket = io.connect('https://rustmoney.com:2096', {query:  "token=b14541fc642cfaa8fdfbb285a2f23a3256bf4fcdb06cf43f998c310c4e0e29e93a50f20e24e85d0a185bb907245b43e78df" +
    "be6fc9512509d05ae34f9b13a98799d8756d8eb2261f13926462b27e6f9c6481d7ee41e9b3a6119932e8dbd7285aae35336db638719625b24b1" +
    "ecaa6475dad6858391aa7a3655ba9245742a5e9c74a0e204d9735fdd3f6b8b5570293181b9",reconnect: true});


const express = require('express')
const app = express()
var port = 80;

app.get("/getCrash", function (req, res) {
    res.sendFile(path.join(__dirname, 'out.csv'));
})



app.listen(port, function(){
    console.log('Server Listening on port ' + port)
});

socket.on("connect", function () {
    console.log("Connected");
    socket.emit('provably_fair_h');

})

socket.on("crash info", function (data) {
    // console.log(data);
})

socket.on('crash multiplier', function(data) {
    console.log("Mult: ",data);
});
socket.on('crash end', function(data) {
    var finalPathFile = "out.csv";
    var writer = csvWriter();
    if (!fs.existsSync(finalPathFile))
        writer = csvWriter({ headers: ["time", "secret", "hash", "answer"]});
    else
        writer = csvWriter({sendHeaders: false});

    writer.pipe(fs.createWriteStream('out.csv', {flags:"a"}));
    writer.write({
        time    :   data.time,
        secret  :   data.secret,
        hash    :   data.hash,
        answer  :   data.multiplier
    });
    writer.end();
    console.log("End: ", data);
});

socket.on("crash history", function (data) {
    console.log(data);
})

socket.on('connect_error', function() {
    console.log("Connection Error!")
});
socket.on('disconnect', function() {
    console.log("Disconnected");
});
