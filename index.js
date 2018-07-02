const request=require('request');
const rp=require('request-promise');
const path=require('path');
const headers=require('./headers');
const download=require('./download');
const sizeOf=require('image-size');
const cheerio = require('cheerio')
const {postModel,userModel}=require('./db');
//服务路径
const serverPath='G:\\work\\react-graphql';
var options = {
    proxy:{
      host:'127.0.0.1',
      port:1080
    },
    json: true
};


//从路径里获取图片数据
const getPhotoFromPath=(imagePath)=>{
  try{
  let size=sizeOf(path.join(serverPath,imagePath));
  return {url:formatPathToSrc(imagePath),width:size.width,height:size.height}
  }catch(err){
    throw `get image size error ${err}`
  }
}


//从帖子里获取用户
const getUserFromPost=(post)=>{
  let {tumblelog:{name,title,avatar_url_512}}=post;
  return{
    name:name,
    nick_name:title,
    avatar:avatar_url_512,
  }
}


//下载单个图片
const getPhotoItem=async (item,userID)=>{
  let photoPath=await download({src:item['photo-url-1280'],userID,serverPath}).catch(err=>{
    throw `photo download error ${err}`
  })
  return {
    url:formatPathToSrc(photoPath),
    width:item.width,
    height:item.height
  };
}


//获取图片列表
const getPhotoList=async (list,userID)=>{
  let promiseList=[]
  for(var item of list){
    promiseList.push(getPhotoItem(item,userID));
  }
  let data=await Promise.all(promiseList);
  return data;
}


//添加用户到数据库
const cleckUserToDB=async (user)=>{
  let resUser=await userModel.findOne({name:user.name}).exec();
  if(resUser)return resUser;
  return await userModel(user).save();
}


//格式化路径到src
const formatPathToSrc=(path)=>{
  return path.replace(/files[\\|/]+/,'/')
}


//下载帖子
const downloadPost=async (remotePost)=>{
  //查询文章是否存在
  if(await postModel.findOne({sourceId:remotePost.id}).count().exec()>0){
    console.warn(`The article [${remotePost.slug}] has already existed!`);
    return;
  }
  let user=getUserFromPost(remotePost);
  let avatarPath=await download({src:user.avatar,userID:user.name,serverPath}).catch(err=>{
    throw `avatar download error ${err}`
  })
  //下载用户头像
  user.avatar=formatPathToSrc(avatarPath);
  //添加用户到数据库
  user=await cleckUserToDB(user);
  //本地的帖子
  let localPost={
    user,
    content:remotePost.slug,
    creationDate:new Date(remotePost.date),
    updateDate:new Date(),
    hotNum:remotePost['note-count'],
    commentNum:0,
    likeNum:0,
    readNum:0,
    sourceId:remotePost.id,
    type:remotePost.type,
    tags:remotePost.tags,
  };
  if(remotePost.type=="photo"){
    let thumbnailPath=await download({src:remotePost['photo-url-1280'],userID:user.name,serverPath}).catch(err=>{
      throw `thumbnail download error ${err}`
    })
    //下载封面
    localPost.thumbnail=getPhotoFromPath(thumbnailPath);
    if(remotePost.photos.length>0){
      //下载所有图片
      localPost.photos=await getPhotoList(remotePost.photos,user.name);
    }
  }else if(remotePost.type=="video"){
    //下载视频
    let videoSource=remotePost['video-player'];
    const $ = cheerio.load(videoSource);
    //封面处理
    let thumbnailSrc=$('video').eq(0).attr('poster')
    let thumbnailPath=await download({src:thumbnailSrc,userID:user.name,serverPath}).catch(err=>{
      throw `thumbnail download error ${err}`
    })
    localPost.thumbnail=getPhotoFromPath(thumbnailPath);

    let videoSrc=$('video>source').eq(0).attr('src')
    let videoPath=await download({src:videoSrc,userID:user.name,serverPath}).catch(err=>{
          throw `video download error ${err}`
        })
    localPost.src=formatPathToSrc(videoPath)

  }else{
    console.warn(`The ${remotePost.type} is Unknown type!`);
    return;
  }
  //添加到数据库
  await postModel(localPost).save()
}


const main=async(userID,page)=>{
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
  }catch(err){
    console.error(`Get Html Error ${err}`);
  }
  if(res){
    let data=JSON.parse(res.substring(4,res.length-2));
    totalPage=Math.ceil(data['posts-total']/num);
    for(let remotePost of data.posts){
      await downloadPost(remotePost).catch(err=>{
        console.error(err);
      })
    }
    console.log(`total page: ${totalPage}`);
  }
  if(page<totalPage){
    main(userID,page+1)
  }
}

main('schoolgirlbaby',1)
