const express = require("express");
const si = require("systeminformation");
const app = express();

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


app.listen(80, () => { console.log("server started with port 80") })