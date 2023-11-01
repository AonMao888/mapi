const express = require("express");
const si = require("systeminformation");
const device = require("express-device");
const os = require('os');
const ejs = require("ejs");
const {getCountryByName} = require('node-countries');
const {phone} = require('phone');
const wifi = require('node-wifi');
const wifipass = require('wifi-password');
const QRCode = require('qrcode');
const sharp = require('sharp');
const bwip = require('bwip-js');
const db = require(__dirname+'/list.json');
const cors = require('cors');

const app = express();
app.use(device.capture());
app.set('view engine','ejs');
app.set('views',__dirname+'/views');
wifi.init({
    iface:null
})
app.use(cors({origin:'*'}))

app.get("/", (req, res) => {
    res.render('home')
})

app.get("/doc", (req, res) => {
    res.redirect('/')
})

app.get("/doc/:name", async(req, res) => {
    let name = req.params.name;
    if(name == 'os'){
        res.sendFile(__dirname+'/html/os.html')
    }else if(name == 'device'){
        res.sendFile(__dirname+'/html/device.html')
    }else if(name == 'country'){
        res.sendFile(__dirname+'/html/country.html')
    }else if(name == 'phone'){
        res.sendFile(__dirname+'/html/phone.html')
    }else if(name == 'wifi'){
        res.sendFile(__dirname+'/html/wifi.html')
    }else if(name == 'qrcode'){
        res.sendFile(__dirname+'/html/qr.html')
    }
})

//get external file
app.get("/home.css", (req, res) => {res.sendFile(__dirname+'/views/css/home.css')})
app.get("/home.js", (req, res) => {res.sendFile(__dirname+'/views/js/home.js')})
app.get("/json", (req, res) => {res.json(db)})

//system informations
app.get("/system/:type", async(req, res) => {
    let type = req.params.type;
    if(type == 'cpu'){
        let got;
        await si.cpu().then((data)=>{got = data})
        res.json(got)
    }else if(type == 'graphic'){
        let got;
        await si.graphics().then((data)=>got = data)
        res.json(got)
    }else if(type == 'memory'){
        let got;
        await si.mem().then((data)=>got = data)
        res.json(got)
    }else if(type == 'connection'){
        let got;
        await si.networkConnections().then((data)=>got = data)
        res.json(got)
    }else if(type == 'system'){
        let got;
        await si.system().then((data)=>got = data)
        res.json(got)
    }else if(type == 'battery'){
        let got;
        await si.battery().then((data)=>got = data)
        res.json(got)
    }
})

//ip address
app.get("/ip",(req,res)=>{
    res.json({
        "ip":ip.address()
    })
})

//device
app.get("/device",(req,res)=>{
    res.send({
        "device":req.device.type
    })
})

//os
app.get("/os",(req,res)=>{
    res.json({
        'platform':os.platform(),
        'type':os.type(),
        'release':os.release(),
        'arch':os.arch(),
        'machine':os.machine(),
        'hostname':os.hostname(),
        'homedir':os.homedir(),
        'tmpdir':os.tmpdir(),
    })
})

//country api
app.get('/country/:name',(req,res)=>{
    var name = req.params.name;
    res.json(getCountryByName(name))
})

//phone number info api
app.get('/phone/:number',(req,res)=>{
    var number = req.params.number;
    res.json(phone(number))
})

//scan wifi networks
app.get('/wifi/:type',async(req,res)=>{
    if(req.device.type == 'phone'){
        return res.send("This api is currently available on Linux, Window and MacOS")
    }
    let type = req.params.type;
    if(type == 'scan'){
        await wifi.scan((error,network)=>{
            if(error){
                res.send(error)
            }else{
                res.json(network)
            }
        })
    }else if(type == 'connect'){
        var ssid = req.query.ssid;
        var pass = req.query.password;
        await wifi.connect({ssid:ssid, password:pass},()=>{
            res.json({
                "status":"connected",
                "error":"none"
            })
        })
    }else if(type == 'disconnect'){
        wifi.disconnect(error=>{
            if(error){
                res.send(error);
            }else{
                res.json({
                    "status":"disconnected!",
                    "error":"none"
                })
            }
        })
    }else if(type == 'current'){
        wifi.getCurrentConnections((err,current)=>{
            if(err){
                res.json(err)
            }else{
                res.json(current)
            }
        })
    }else if(type == 'password'){
        wifipass().then(pass=>{
            res.json({
                "status":"fine",
                "password":pass
            })
        })
    }
     
})

//encryption and decryption api
app.get('/crypto/:type',async(req,res)=>{
    let type = req.params.type;
    let key = req.query.key;
    let text = req.query.text;
    let cryptr = new Cryptr(key);

    if(type == 'encrypt'){
        let data = await cryptr.encrypt(text);
        res.send(data)
    }else if(type == 'decrypt'){

    }else{
        res.send("Are you visit correct api link?")
    }
})

//qr code api
app.get('/qrcode',async(req,res)=>{
    let text = req.query.text;
    let width = req.query.width;
    let height = req.query.height;
    let darkcolor = req.query.dark;
    let lightcolor = req.query.light;
    if(width == null){
        width = 200
    }
    if(height == null){
        height = 200
    }
    let option = {
        errorCorrectionLevel:'H',
        type:'image/jpeg',
        margin:2,
        color:{
            dark:darkcolor,
            light:lightcolor
        },
        quality:1
    }
    let code = await QRCode.toBuffer(text,option);
    const resized = await sharp(code).resize(Number(width),Number(height)).toBuffer();
    res.set('Content-Type','image/png');
    res.send(resized);
})

app.get('/barcode',(req,res)=>{
    let scale,height;
    if(req.query.scale == null){scale = 3}else{scale = req.query.scale}
    if(req.query.height == null){height = 9}else{height = req.query.height}
    const option = {
        bcid: 'code128',
        text: req.query.text,
        scale : scale,
        height: height,

        includetext: true,
        textxalign: 'center'
    }
    const code = bwip.toBuffer(option,(err,url)=>{
        if(err){
            res.send(err)
        }else{
            res.setHeader('Content-Type','image/png')
            res.send(url)
        }
    })
})

app.listen(80, () => { console.log("server started with port 80") })