const path=require('path');
const fs = require('fs');
let {userModel}=require("./db.js");

(async ()=>{
  const userlist=await userModel.find({isUpdate:{$exists:false}}).exec()
  for(let user of userlist){
  	const filename=user.avatar.split('/').pop();
    user.avatar=`/avatar/${filename}`;
    console.log(user.name,user.avatar)
    await user.save();
  }
  console.log('ok')
})()

