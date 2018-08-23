const request = require('request');
const rp = require('request-promise');
const path = require('path');
const headers = require('./headers');
const download = require('./download');
const sizeOf = require('image-size');
const { postModel, userModel } = require('./db');
const IMGHOST = 'https://78.media.tumblr.com';
//服务路径
const serverPath = 'G:\\work\\react-graphql';
var options = {
  proxy: {
    host: '127.0.0.1',
    port: 1080,
  },
  json: true,
};
const getImgURL = path => {
  let startKey = path.indexOf('\\');
  return `${IMGHOST}${path.substring(startKey)}`;
};
const main = async () => {
  let cursor;
  cursor = postModel
    .find()
    .populate('user')
    .sort({ _id: -1 })
    .cursor();
  let doc;
  while ((doc = await cursor.next())) {
    let { name: userID, avatar } = doc.user;

    await download({ src: getImgURL(avatar), userID, serverPath }).catch(
      err => {
        console.log(`avatar download error ${err}`);
      }
    );

    if (doc.thumbnail && doc.thumbnail.url) {
      //下载缩略图
      let src = await download({
        src: getImgURL(doc.thumbnail.url),
        userID,
        serverPath,
      }).catch(err => {
        throw `photo download error ${err}`;
      });
      console.log(`thumbnail ${src} download completion`);
    }
    let promiseList = [];
    for (var photo of doc.photos) {
      let src = download({
        src: getImgURL(photo.url),
        userID,
        serverPath,
      }).catch(err => {
        throw `photo download error ${err}`;
      });
      console.log('photo download');
      promiseList.push(src);
    }
    await Promise.all(promiseList);
    //下载图片列表
  }
};
main();
