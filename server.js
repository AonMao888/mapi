const express = require("express");
const si = require("systeminformation");
const ip = require('ip');
const device = require("express-device");
const os = require('os');
const app = express();
app.use(device.capture());

app.get("/", (req, res) => {
    res.send("HOme")
})

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
    res.send(req.device.type)
})

//os
app.get("/os",(req,res)=>{
    res.json({
        'platform':os.platform(),
        'release':os.release(),
        'arch':os.arch(),
        'type':os.type(),
        'tmpdir':os.tmpdir(),
        'machine':os.machine(),
        'hostname':os.hostname()
    })
})

app.listen(80, () => { console.log("server started with port 80") })