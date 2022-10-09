const mongoose=require("mongoose")
const logSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    }
})
const logModel=mongoose.model("logs",logSchema)
module.exports=logModel