const path=require('path');
const fs = require('fs');
const ROOT_PATH=path.resolve(__dirname,"../react-graphql/files")

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
				console.log('------------------------------------')
				console.log('fileRelative',fileRelative)
				console.log('fileRelative2',filesObj[fileRemoveUser])
				console.log('fileRemoveUser',fileRemoveUser)
			}else{
				filesObj[fileRemoveUser]=fileRelative;
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