const userModel=require("../Models/userModel")
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { generatePasswordHash, checkadmin, checkexistinguser } = require('../utility');
const logModel = require("../Models/LogModel");

const router = express.Router()

router.post("/register", async (req, res) => {
    if (await checkexistinguser(req.body.email)) {
        res.status(400).send("User Exists")
    } else {
        const email = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
        if(email===process.env.ADMIN){
            const bool = checkadmin(req.body.email)
            generatePasswordHash(req.body.password).then((passwordhash) => {
                userModel.create({   
                    name: req.body.name,
                    email: req.body.email,
                    password: passwordhash,
                    isAdmin: bool,
                }).then((userdata) => {
                    logModel.create({
                        email:req.body.email,
                        date:new Date(),
                        message:"User Created"
                    }).then((result)=>{
                        res.status(200).send(userdata)
                    })
                    
                }).catch((err) => {
                    res.status(400).send(err)
                })
            }).catch((err) => {
                res.status(400).send(err)
            })
    
        }

    }

})


router.post("/login",(req,res)=>{
    userModel.find({ email: req.body.email }).then((userData) => {
        if (userData.length) {
            bcrypt.compare(req.body.password, userData[0].password).then((val) => {
                if (val) {
                    const authtoken = jwt.sign(userData[0].email, process.env.SECRET_KEY)
                    logModel.create({
                        email:req.body.email,
                        date:new Date(),
                        message:"User Logged In"
                    }).then((data)=>{
                        res.status(200).send({ authtoken })
                    })
                    
                } else {
                    res.status(400).send("Incorrect Password")
                }
            }).catch((err) => {
                res.status(400).send(err)
            })
        } else {
            res.status(400).send("No such User")
        }
    }).catch((err) => {
        res.status(400).send(err)
    })
})

router.post("/forgotpassword", async (req, res) => {
    const email = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
    if(checkadmin(email)){
        userModel.find({ email: req.body.email }).then((userdata) => {

            if (userdata.length) {
                generatePasswordHash(req.body.password).then((passwordhash) => {
                    userModel.updateOne({ email: req.body.user }, { $set: { password: passwordhash } }).then(() => {
                        logModel.create({
                            email:req.body.email,
                            date:new Date(),
                            message:"User Password Changed"
                        }).then((data)=>{
                            res.status(200).send("Password Changed Successfully")
                        })
                        
                    })
                }).catch((err) => {
                    res.status(400).send(err)
                })
            } else {
                res.status(400).send("No such User")
            }
        })
    }else{
        if(email===req.body.email){
            userModel.find({ email: req.body.email }).then((userdata) => {

                if (userdata.length) {
                    generatePasswordHash(req.body.password).then((passwordhash) => {
                        userModel.updateOne({ email: req.body.user }, { $set: { password: passwordhash } }).then(() => {
                            logModel.create({
                                email:req.body.email,
                                date:new Date(),
                                message:"User Password Changed"
                            }).then((data)=>{
                                res.status(200).send("Password Changed Successfully")
                            })
                            
                        })
                    }).catch((err) => {
                        res.status(400).send(err)
                    })
                } else {
                    res.status(400).send("No such User")
                }
            })
        }
    }
})

router.get("/all",(req,res)=>{
    const email = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
    if(checkadmin(email)){
        userModel.find().then((userdata)=>{
            res.status(200).send(userdata)
        }).catch((err) => {
            res.status(400).send(err)
        })
    }
})

router.put("/update",(req,res)=>{
    const email = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
    if(checkadmin(email)){
        userModel.updateOne({email:req.body.email},{$set:req.body }).then(()=>{
            logModel.create({
                email:req.body.email,
                date:new Date(),
                message:"User Updated Successfully"
            }).then((data)=>{
                res.status(200).send("User Updated Successfully")
            })
            
        }).catch((err)=>{
            res.status(400).send(err)
        })
    }
   
})

router.delete("/delete",(req,res)=>{
    const email = jwt.verify(req.headers.authorization, process.env.SECRET_KEY)
    if(checkadmin(email)){
        userModel.deleteOne({email:req.body.email}).then(()=>{
            logModel.create({
                email:req.body.email,
                date:new Date(),
                message:"User Updated Successfully"
            }).then((data)=>{
                res.status(200).send("User Updated Successfully")
            })
            
        }).catch((err)=>{
            res.status(400).send(err)
        })
    }
})

module.exports = router