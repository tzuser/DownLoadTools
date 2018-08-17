let {userModel}=require("./db.js");
const request=require('request');
const rp=require('request-promise');
const path=require('path');
const headers=require('./headers');
const {downloadPost,options,ExistError}=require('./process');

(async ()=>{
  const userlist=await userModel.find({isUpdate:true}).exec()
  for(let user of userlist){
    await main(user.name,1)
  }
})()

const main=async(userID,page,htmlErrorNumber=0)=>{
  let num=20;
  let start=(page-1)*num
  let uri=`https://${userID}.tumblr.com/api/read/json?callback=api&num=${num}&start=${start}`
  let res;
  let totalPage=9999;
  try{
    res=await rp({
      ...options,
      method: 'GET',
      headers:{
        ...headers,
        'Host':`${userID}.tumblr.com`,
      },
      uri,
      json:false,
      })
      htmlErrorNumber=0;
  }catch(err){
    console.error(`Get Html Error`);
    htmlErrorNumber++;
    if(htmlErrorNumber>5){
      console.log("页面获取错误")
      return;
    }
  }
  if(res){
  	let data;
  	try{
    	data=JSON.parse(res.substring(4,res.length-2));
    }catch(err){
    	console.log('json error ')
    	return;
    }
    totalPage=Math.ceil(data['posts-total']/num);
    let existNumb=0;
    for(let remotePost of data.posts){
      if(existNumb>10){
        console.log(`${userID} 更新完成`)
        return
      }
      await downloadPost(remotePost).catch(err=>{
        if(err instanceof ExistError){
          existNumb++;
          console.log("文章已经存在");
        }
      })
    }
    console.log(`total page: ${totalPage}`);
  }
  if(page<totalPage){
   await main(userID,page+1,htmlErrorNumber)
  }
}
