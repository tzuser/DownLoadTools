const path=require('path');
const fs = require('fs');
const ROOT_PATH=path.resolve(__dirname,"../react-graphql/files")
const {postSchema,userSchema} = require('./db')

const filesObj={};
const getFiles=(dirPath)=>{
	let fileNames=fs.readdirSync(dirPath);
	for(let fileName of fileNames){
		let filePath=path.join(dirPath,fileName);
		let fileStats=fs.statSync(filePath);
		if(fileStats.isDirectory()){//isDirectory
			getFiles(filePath)//Recursive
		}else{
			let fileRelative=filePath.replace(ROOT_PATH,'');
			let fileRemoveUser=fileRelative.substring(fileRelative.indexOf('/',1))
			
			if(filesObj[fileRemoveUser]){
				//postSchema.findOne({})
				filesObj[fileRemoveUser].push({
					path:filePath,
					url:fileRelative,
					toUrl:fileRemoveUser
				})
				console.log('------------------------------------')
				console.log('fileRemoveUser',fileRemoveUser)
				console.log('filePath',filesObj[fileRemoveUser])
			}else{
				filesObj[fileRemoveUser]=[
				{
					path:filePath,
					url:fileRelative,
					toUrl:fileRemoveUser
				}];
			}

			/*if(fileRelative.indexOf(1)>20){
				console.log('------------------------------------')
				console.log('LEN:',fileRelative.indexOf(1))
				console.log('fileRelative',fileRelative)
				console.log('fileRemoveUser',fileRemoveUser)
			}*/
		}
	}
}

getFiles(ROOT_PATH)