let {userModel}=require("./db.js");
const request=require('request');
const rp=require('request-promise');
const path=require('path');
const headers=require('./headers');
const {downloadPost,options,ExistError}=require('./process');

(async ()=>{
  const postlist=await post.find().exec()
  for(let user of postlist){
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
    let data=JSON.parse(res.substring(4,res.length-2));
    totalPage=Math.ceil(data['posts-total']/num);
    let existNumb=0;
    for(let remotePost of data.posts){
      if(existNumb>10){
        console.log(`${userID} 更新完成`)
        return
      }
      
      if(remotePost["reblogged-root-name"]!=remotePost["reblogged-from-name"]){
        
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
    main(userID,page+1,htmlErrorNumber)
  }
}
