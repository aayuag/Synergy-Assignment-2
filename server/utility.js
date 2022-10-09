const bcrypt=require('bcryptjs')
const userModel=require("./Models/userModel")

const checkexistinguser=async(email)=>{
    let existing=false
    await userModel.find({email:email}).then((userData)=>{
        if(userData.length){
            existing=true
        }
    })
    return existing
}

const checkadmin=(email)=>{
    const admin=process.env.ADMIN
    if(email==admin){
        return true
    }else{
        return false
    }
}

const generatePasswordHash= (password) => {
    const salt = 10;
    return new Promise((resolve,reject)=>{
        bcrypt.genSalt(salt).then((hashsalt)=>{
            bcrypt.hash(password,hashsalt).then((passwordhash)=>{
                resolve(passwordhash)
            })
        })
    })
}



module.exports={generatePasswordHash,checkadmin,checkexistinguser};