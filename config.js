const path=require('path');
const serverPath=path.join(__dirname,'../react-graphql/files');

const proxy={
      host:'127.0.0.1',
      port:8118
    }

const options = {
    proxy:proxy,
    json: true
};

module.exports={
	serverPath,
	options,
	proxy
}