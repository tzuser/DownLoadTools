const request = require('request');
const rp = require('request-promise');
const path = require('path');
const downloadFromType = require('./download');
const sizeOf = require('image-size');
const cheerio = require('cheerio');
const { postModel, userModel } = require('./db');
const { serverPath } = require('./config');
const print = require('./print');
class ExistError extends Error {
  constructor({ msg, id }) {
    super();
    this.msg = msg;
    this.id = id;
  }
}

//从路径里获取图片数据
const getPhotoFromPath = imagePath => {
  try {
    let size = sizeOf(path.join(serverPath, imagePath));
    return {
      url: formatPathToSrc(imagePath),
      width: size.width,
      height: size.height,
    };
  } catch (err) {
    throw `get image size error ${err}`;
  }
};

//从帖子里获取用户
const getUserFromPost = post => {
  let {
    tumblelog: { name, title, avatar_url_512 },
  } = post;
  return {
    name: name,
    nick_name: title,
    avatar: avatar_url_512,
    roles: ['tumblr'],
  };
};

//从帖子里获取root用户
const getRootUserFromPost = post => {
  let name = post['reblogged-root-name'];
  if (!name) return null;
  return {
    name,
    nick_name: post['reblogged-root-title'],
    avatar: post['reblogged_root_avatar_url_512'],
    roles: ['tumblr'],
  };
};
//从帖子里获取from用户
const getFromUserFromPost = post => {
  let name = post['reblogged-from-name'];
  if (!name) return null;
  return {
    name,
    nick_name: post['reblogged-from-title'],
    avatar: post['reblogged_from_avatar_url_512'],
    roles: ['tumblr'],
  };
};
//下载单个图片
const getPhotoItem = async (item, userID) => {
  let photoPath = await downloadFromType({
    src: item['photo-url-1280'],
    type: 'tumblr',
  }).catch(err => {
    throw `photo download error ${err}`;
  });
  return {
    url: formatPathToSrc(photoPath),
    width: item.width,
    height: item.height,
  };
};

//获取图片列表
const getPhotoList = async (list, userID) => {
  let promiseList = [];
  for (var item of list) {
    promiseList.push(getPhotoItem(item, userID));
  }
  let data = await Promise.all(promiseList);
  return data;
};

//添加用户到数据库
const cleckUserToDB = async user => {
  let resUser = await userModel.findOne({ name: user.name }).exec();
  if (resUser) return resUser;
  return await userModel(user).save();
};

//格式化路径到src
const formatPathToSrc = path => {
  return path.replace(/files[\\|/]+/, '/');
};
//添加
const addUser = async user => {
  let avatarPath = await downloadFromType({
    src: user.avatar,
    type: 'avatar',
  }).catch(err => {
    throw `avatar download error ${err}`;
  });
  //下载用户头像
  user.avatar = formatPathToSrc(avatarPath);
  //添加用户到数据库
  user = await cleckUserToDB(user);
  return user;
};
//下载帖子
const downloadPost = async remotePost => {
  //查询文章是否存在
  if (
    (await postModel
      .findOne({ sourceId: remotePost.id })
      .countDocuments()
      .exec()) > 0
  ) {
    print(`The article [${remotePost.slug}] has already existed!`);
    throw new ExistError({ msg: 'post already exist', id: remotePost.id });
  }
  let user = getUserFromPost(remotePost);
  user = await addUser(user);

  let rootUser = getRootUserFromPost(remotePost);
  if (rootUser) {
    rootUser = await addUser(rootUser);
  }
  let formUser = getFromUserFromPost(remotePost);
  if (formUser) {
    formUser = await addUser(formUser);
  }
  //本地的帖子
  let localPost = {
    user: user,
    content: remotePost.slug,
    creationDate: new Date(remotePost.date),
    updateDate: new Date(),
    hotNum: remotePost['note-count'],
    commentNum: 0,
    likeNum: 0,
    readNum: 0,
    sourceId: remotePost.id,
    type: remotePost.type,
    tags: remotePost.tags,
    rootUser: rootUser,
    fromUser: formUser,
  };
  if (remotePost.type == 'photo') {
    let thumbnailPath = await downloadFromType({
      src: remotePost['photo-url-1280'],
      type: 'tumblr',
    }).catch(err => {
      print(remotePost);
      throw `thumbnail download error ${err}`;
    });
    //下载封面
    localPost.thumbnail = getPhotoFromPath(thumbnailPath);
    if (remotePost.photos.length > 0) {
      //下载所有图片
      localPost.photos = await getPhotoList(remotePost.photos, user.name);
    }
  } else if (remotePost.type == 'video') {
    //下载视频
    let videoSource = remotePost['video-player'];
    const $ = cheerio.load(videoSource);
    //封面处理
    let thumbnailSrc = $('video')
      .eq(0)
      .attr('poster');
    let thumbnailPath = await downloadFromType({
      src: thumbnailSrc,
      type: 'tumblr',
    }).catch(err => {
      throw `thumbnail download error ${err}`;
    });
    localPost.thumbnail = getPhotoFromPath(thumbnailPath);

    let videoSrc = $('video>source')
      .eq(0)
      .attr('src');
    let videoPath = await downloadFromType({
      src: videoSrc,
      type: 'video',
    }).catch(err => {
      throw `video download error ${err}`;
    });
    localPost.src = formatPathToSrc(videoPath);
  } else {
    throw new ExistError({ msg: 'unknown type', id: remotePost.id });
    print(`The ${remotePost.type} is Unknown type!`);
    return;
  }
  //添加到数据库
  await postModel(localPost).save();
};
module.exports = {
  downloadPost,
  formatPathToSrc,
  getUserFromPost,
  getPhotoFromPath,
  getPhotoList,
  cleckUserToDB,
  ExistError,
};
