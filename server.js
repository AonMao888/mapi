const express = require("express");
const si = require("systeminformation");
const ip = require('ip');
const device = require("express-device");
const os = require('os');
const ejs = require("ejs");
const {getCountryByName} = require('node-countries');
const {phone} = require('phone');

const app = express();
app.use(device.capture());
app.set('view engine','ejs');
app.set('views',__dirname+'/views')

app.get("/", (req, res) => {
    res.render('home')
})

//get external file
app.get("/home.css", (req, res) => {res.sendFile(__dirname+'/views/css/home.css')})
app.get("/home.js", (req, res) => {res.sendFile(__dirname+'/views/js/home.js')})
app.get("/json", (req, res) => {res.sendFile(__dirname+'/list.json')})

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

app.listen(80, () => { console.log("server started with port 80") })