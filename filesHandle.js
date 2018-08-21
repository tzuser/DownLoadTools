const path=require('path');
const fs = require('fs');
const ROOT_PATH=path.resolve(__dirname,"../react-graphql/files")
const ROOT_VIDEO_PATH=path.resolve(__dirname,"../react-graphql/files/video")
const ROOT_PHOTO_PATH=path.resolve(__dirname,"../react-graphql/files/photo")
const ROOT_THUMBLR_PATH=path.resolve(__dirname,"../react-graphql/files/tumblr")
const ROOT_AVATAR_PATH=path.resolve(__dirname,"../react-graphql/files/avatar")
const ROOT_THUMBNAIL_PATH=path.resolve(__dirname,"../react-graphql/files/thumbnail")
//const {postSchema,userSchema} = require('./db')

const getNewFileName=(filePath)=>{
	let index=filePath.indexOf('\\',1);
	if(index==-1){
		index=filePath.indexOf('/',1);
	}
	if(index==-1)return false;
	return filePath.substring(index);
}

// 递归创建目录 同步方法
function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
      return true;
    } else {
      if (mkdirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname);
        return true;
      }
    }
  }


const moveFile=(oldPath,newPath)=>{
	if(fs.existsSync(newPath)){
		let oldStats=fs.statSync(oldPath);
		let newStats=fs.statSync(newPath);

		if(oldStats.size>newStats.size){
			console.log(oldStats.size,newStats.size)
			console.log(oldPath,newPath)
			fs.unlinkSync(newPath);
			fs.renameSync(oldPath,newPath);
			//fg
		}else{
			//delete
			fs.unlinkSync(oldPath);
		}
	}else{
		fs.renameSync(oldPath,newPath);
	}
}

const filesObj={};
const getRepeatFiles=(dirPath)=>{
	let fileNames=fs.readdirSync(dirPath);
	let dirList=[];
	for(let fileName of fileNames){
		let filePath=path.join(dirPath,fileName);
		let fileStats=fs.statSync(filePath);
		if(fileStats.isDirectory()){//isDirectory
			getRepeatFiles(filePath)//Recursive
		}else{
			let nameList=filePath.split('/');
			let thisFileName=nameList.pop();

			if(filesObj[thisFileName] && filesObj[thisFileName].length>0){
				filesObj[thisFileName].push(filePath)
				console.log(filesObj[thisFileName])
			}else{
				//console.log(thisFileName)
				filesObj[thisFileName]=[filePath]
			}
		}
	}
}

const getPhoto=(dirPath)=>{
	let fileNames=fs.readdirSync(dirPath);
	let dirList=[];
	for(let fileName of fileNames){
		let filePath=path.join(dirPath,fileName);
		let fileStats=fs.statSync(filePath);
		if(fileStats.isDirectory()){//isDirectory
			getPhoto(filePath)//Recursive
		}else{

			let nameList=filePath.split('/');
			let thisFileName=nameList.pop();
			if(!thisFileName.startsWith('avatar_'))continue;

			let newFilePath=path.join(ROOT_AVATAR_PATH,thisFileName);
			if(filePath!=newFilePath){
				moveFile(filePath,newFilePath)
			}
			
		}
	}
}


const getFiles=(dirPath)=>{
	let fileNames=fs.readdirSync(dirPath);
	let dirList=[];
	for(let fileName of fileNames){
		let filePath=path.join(dirPath,fileName);
		let fileStats=fs.statSync(filePath);
		if(fileStats.isDirectory()){//isDirectory
			getFiles(filePath)//Recursive
		}else{
			let nameList=filePath.split('/');
			let thisFileName=nameList.pop();
			if(thisFileName.endsWith('.jpg') || thisFileName.endsWith('.gif') || thisFileName.endsWith('.png') || thisFileName.endsWith('.jpeg')){
				if(nameList.length==7){
					let dirName=path.join(ROOT_THUMBNAIL_PATH)
					console.log(dirName)
					//mkdirsSync(dirName);
					let newFilePath=path.join(dirName,thisFileName);
					moveFile(filePath,newFilePath)
				}
			}else if(thisFileName.endsWith('.mp4')){
				let newFilePath=path.resolve(ROOT_VIDEO_PATH,thisFileName);
				moveFile(filePath,newFilePath)
			}
		}
	}
}

getPhoto(ROOT_THUMBNAIL_PATH)
console.log('ok')