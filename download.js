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

const getFileName = src => {
  const urlObj = url.parse(src);
  let splitPathname = urlObj.pathname.split('/');

  let fileName;
  if (splitPathname.includes('video_file')) {
    fileName = splitPathname.find(item => item.startsWith('tumblr_'));
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

const getDirName = name => {
  let splits = name.split('_');
  if (splits.length > 1 && splits[1].length > 3) {
    return splits[1].substr(0, 3);
  }
  return null;
};
const typeToPath = ({ src, type }) => {
  let name = getFileName(src);
  let dirName = getDirName(name);
  let dirPath = path.join(serverPath, type, dirName);
  mkdirs(dirPath);
  return path.join(dirPath, name);
};

const typeToUrl = ({ src, type }) => {
  let name = getFileName(src);
  let dirName = getDirName(name);
  return `/${type}/${dirName}/${name}`;
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


module.exports = downloadFromType;

/*let src = downloadFromType({
  src:
    'https://omekonamezou.tumblr.com/video_file/t:svAtjXCehNZLh4Neob9NOQ/177154356746/tumblr_pcssdphDIk1xb5l8g',
  type: 'video',
});*/

/*

https://omekonamezou.tumblr.com/video_file/t:svAtjXCehNZLh4Neob9NOQ/177154358166/tumblr_pcss7xoebz1xb5l8g
https://omekonamezou.tumblr.com/video_file/t:svAtjXCehNZLh4Neob9NOQ/177154356746/tumblr_pcssdphDIk1xb5l8g

https://78.media.tumblr.com/avatar_d907c23533e7_512.png
https://78.media.tumblr.com/avatar_98e62f459936_512.png

https://78.media.tumblr.com/29d64e1833e7d106dc423abcc44adf09/tumblr_pcuvwaKJo61xnpw9fo1_1280.jpg
https://78.media.tumblr.com/29d64e1833e7d106dc423abcc44adf09/tumblr_pcuvwaKJo61xnpw9fo1_1280.jpg

*/
