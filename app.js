// var socket = require("socket.io-client")("https://rustmoney.com:2096", {
//     query: 'token=b14541fc642cfaa8fdfbb285a2f23a3256bf4fcdb06cf43f998c310c4e0e29e93a50f20e24e85d0a185bb907245b43e78dfbe6fc9512509d05ae34f9b13a98799d8756d8eb2261f13926462b27e6f9c6481d7ee41e9b3a6119932e8dbd7285aae35336db638719625b24b1ecaa6475dad6858391aa7a3655ba9245742a5e9c74a0e204d9735fdd3f6b8b5570293181b9',
//     reconnection: false
// });
const app = require('express')();
var csvWriter = require('csv-write-stream');
var fs = require("fs")
var CrashIO = require('socket.io-client');
var path = require("path");
var CrashSocket = CrashIO.connect('https://rustmoney.com:2096', {query:  "token=b14541fc642cfaa8fdfbb285a2f23a3256bf4fcdb06cf43f998c310c4e0e29e93a50f20e24e85d0a185bb907245b43e78df" +
    "be6fc9512509d05ae34f9b13a98799d8756d8eb2261f13926462b27e6f9c6481d7ee41e9b3a6119932e8dbd7285aae35336db638719625b24b1" +
    "ecaa6475dad6858391aa7a3655ba9245742a5e9c74a0e204d9735fdd3f6b8b5570293181b9",reconnect: true});
var http = require("http").Server(app);
var io = require('socket.io')(http);
const csv=require('csvtojson');



app.set('view engine', 'ejs');
var port = 80;

app.get("/crash.csv", function (req, res) {
    res.sendFile(path.join(__dirname, 'out.csv'));
});

app.get("/", function (req, res) {
    res.render("index.ejs")
});

io.on('connection', function(socket){
    console.log('a user connected');
    getCSV(function (data) {
        socket.emit("totalDraws",data.length);
        data.forEach(function (draw, index, collection) {
            setTimeout(function () {
                socket.emit("addOneItem", {data:draw});
            }, index * 50)

        });

    })

});


function getCSV(cb) {
    var data = [];
    var csvReadStream = fs.createReadStream(__dirname+"/out.csv");
    console.log("Reading");
    csv()
        .fromStream(csvReadStream)
        .on('csv',(csvRow)=>{
            // console.log(csvRow);
            var d = {
                time:csvRow[0],
                secret:csvRow[1],
                hash    :csvRow[2],
                answer     :csvRow[3]
            }
            data.push(d);
        // csvRow is an array
    })
    .on('done',(error)=>{
        cb(data);
    })
    // csv().fromFile((__dirname + 'out.csv'))
    //     .on('json',(jsonObj)=>{
    //         console.log(jsonObj);
    //     data.push(jsonObj);
    // }).on('done',(error)=>{
    //     cb();
    // });
}



http.listen(port, function(){
    console.log('Server Listening on port ' + port)
});

CrashSocket.on("connect", function () {
    console.log("Connected");
});

CrashSocket.on("crash info", function (data) {
    // console.log(data);
})

CrashSocket.on('crash multiplier', function(data) {
    // console.log("Mult: ",data);
});
CrashSocket.on('crash end', function(data) {

    var finalPathFile = "out.csv";
    var writer = csvWriter();
    if (!fs.existsSync(finalPathFile))
        writer = csvWriter({ headers: ["time", "secret", "hash", "answer"]});
    else
        writer = csvWriter({sendHeaders: false});

    writer.pipe(fs.createWriteStream('out.csv', {flags:"a"}));
    var obj = {
        time    :   data.time,
        secret  :   data.secret,
        hash    :   data.hash,
        answer  :   data.multiplier
    }
    writer.write(obj);
    io.emit("addOneItem", {data:obj});

    writer.end();
    console.log("End: ", data);
});

CrashSocket.on("crash history", function (data) {
    console.log(data);
})

CrashSocket.on('connect_error', function() {
    console.log("Connection Error!")
});
CrashSocket.on('disconnect', function() {
    console.log("Disconnected");
});
