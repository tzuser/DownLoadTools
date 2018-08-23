const fs = require('fs');
const path = require('path');
const url = require('url');
const request = require('request');
const { proxy, serverPath } = require('./config');
const print = require('./print');
function mkdirs(dirpath) {
  if (!fs.existsSync(dirpath)) {
    if (!fs.existsSync(path.dirname(dirpath))) {
      mkdirs(path.dirname(dirpath));
    }
    fs.mkdirSync(dirpath);
  }
}

//从url里获取文件名及目录
const getPathFromSrc = ({ src, userID, serverPath }) => {
  let fileName,
    dir = `files/${userID}`;
  const urlObj = url.parse(src);
  let splitPathname = urlObj.pathname.split('/');
  //视频处理
  if (splitPathname.includes('video_file')) {
    //获取文件名称
    fileName = splitPathname.pop();
    if (!fileName.includes('.mp4')) fileName += '.mp4';
  } else if (splitPathname.length >= 3) {
    //存在目录
    //获取文件名称
    fileName = splitPathname.pop();
    //获取目录地址
    dir += splitPathname.join('/');
  } else {
    fileName = urlObj.pathname;
  }
  let fileSrc = path.join(dir, fileName);
  dir = path.join(serverPath, dir);
  return { fileName, dir, fileSrc };
};

const getFileName = src => {
  const urlObj = url.parse(src);
  let splitPathname = urlObj.pathname.split('/');

  let fileName;
  if (splitPathname.includes('video_file')) {
    fileName = splitPathname.find(item => item.startsWith('tumblr_'));
    print(fileName);
    if (fileName == '480') {
      print(
        '/////////////////////////////////////////////////////////////////////////////////////////////////////',
        splitPathname
      );
    }
    if (!fileName.includes('.mp4')) fileName += '.mp4';
  } else {
    fileName = splitPathname.pop();
  }
  return fileName;
};

const typeToPath = ({ src, type }) => {
  let name = getFileName(src);
  return path.join(serverPath, type, name);
};

const typeToUrl = ({ src, type }) => {
  let name = getFileName(src);
  return `/${type}/${name}`;
};

//下载文件
const downloadFromType = async ({ src, type }) => {
  let savePath = typeToPath({ src, type });
  let fileSrc = typeToUrl({ src, type });
  //配置文件路径
  let configFilePath = savePath + '.config';

  //如果文件存在，配置文件不存在时，判定为已下载!
  if (fs.existsSync(savePath) && !fs.existsSync(configFilePath)) {
    print(`The "${savePath}" already exists!`);
    return fileSrc;
  }
  //写入配置文件
  fs.writeFileSync(configFilePath, JSON.stringify({ loadSize: 0 }));
  //创建流
  let fileStream = fs.createWriteStream(savePath);
  //下载文件
  await new Promise((resolve, reject) => {
    request({
      proxy: proxy,
      method: 'GET',
      uri: src,
    })
      .on('end', resolve)
      .on('error', reject)
      .pipe(fileStream);
  });

  //下载完成删除配置文件
  fs.unlinkSync(configFilePath);

  return fileSrc;
};

//下载文件
const download = async ({ src, userID, serverPath }) => {
  let { fileName, dir, fileSrc } = getPathFromSrc({ src, userID, serverPath });
  //创建目录
  mkdirs(dir);
  //下载文件路径
  let filePath = path.join(dir, fileName);
  //配置文件路径
  let configFilePath = filePath + '.config';

  //如果文件存在，配置文件不存在时，判定为已下载!
  if (fs.existsSync(filePath) && !fs.existsSync(configFilePath)) {
    print(`The "${filePath}" already exists!`);
    return fileSrc;
  }
  //写入配置文件
  fs.writeFileSync(configFilePath, JSON.stringify({ loadSize: 0 }));
  //创建流
  let fileStream = fs.createWriteStream(filePath);
  //下载文件
  await new Promise((resolve, reject) => {
    request({
      proxy: proxy,
      method: 'GET',
      uri: src,
    })
      .on('end', resolve)
      .on('error', reject)
      .pipe(fileStream);
  });

  //下载完成删除配置文件
  fs.unlinkSync(configFilePath);

  return fileSrc;
};
module.exports = downloadFromType;

/*let src=downloadFromType({
  src:'https://omekonamezou.tumblr.com/video_file/t:svAtjXCehNZLh4Neob9NOQ/177154356746/tumblr_pcssdphDIk1xb5l8g',
  type:'video'
})
*/
/*

https://omekonamezou.tumblr.com/video_file/t:svAtjXCehNZLh4Neob9NOQ/177154358166/tumblr_pcss7xoebz1xb5l8g
https://omekonamezou.tumblr.com/video_file/t:svAtjXCehNZLh4Neob9NOQ/177154356746/tumblr_pcssdphDIk1xb5l8g

https://78.media.tumblr.com/avatar_d907c23533e7_512.png
https://78.media.tumblr.com/avatar_98e62f459936_512.png

https://78.media.tumblr.com/29d64e1833e7d106dc423abcc44adf09/tumblr_pcuvwaKJo61xnpw9fo1_1280.jpg
https://78.media.tumblr.com/29d64e1833e7d106dc423abcc44adf09/tumblr_pcuvwaKJo61xnpw9fo1_1280.jpg

*/
