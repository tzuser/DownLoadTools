let { userModel } = require('./db.js');
const rp = require('request-promise');
const headers = require('./headers');
const { downloadPost, ExistError } = require('./process');
const { options } = require('./config');
const {
  setUserInfo,
  setPostInfo,
  setPageInfo,
  userList,
  BreakBtn,
} = require('./view.js');
const print = require('./print');

BreakBtn.on('click', function(data) {
  isBreak = true;
});

let isBreak = false;
let userIndex = null;
const getUser = async (list, index) => {
  if (userIndex) {
    index = userIndex;
    userIndex = null;
  }
  let user = list[index];
  let len = list.length;
  setUserInfo({
    nick_name: user.nick_name,
    name: user.name,
    userIndex: index,
    userLen: len,
  });
  setUserList(list, index);
  await main(user.name, 1);
  index++;
  return await getUser(list, index);
};

const setUserList = (list, index) => {
  let nextLen = 10;
  if (userList.items.length == 0) {
    for (let i = 0; i < nextLen; i++) {
      let item = list[index + i];
      if (item) {
        userList.addItem(item.name);
      }
    }
  } else {
    userList.addItem(list[index + nextLen - 1].name);
  }
  userList.select(index);
};

(async () => {
  const userlist = await userModel.find({ isUpdate: true }).exec();
  getUser(userlist, 70);
})();

const main = async (userID, page, htmlErrorNumber = 0) => {
  let num = 20;
  let start = (page - 1) * num;
  let uri = `https://${userID}.tumblr.com/api/read/json?callback=api&num=${num}&start=${start}`;
  let res;
  let totalPage = 9999;
  try {
    res = await rp({
      ...options,
      method: 'GET',
      headers: {
        ...headers,
        Host: `${userID}.tumblr.com`,
      },
      uri,
      json: false,
    });
    htmlErrorNumber = 0;
  } catch (err) {
    htmlErrorNumber++;
    if (htmlErrorNumber > 3) {
      print('get html error');
      return;
    }
  }
  if (res) {
    let data;
    try {
      data = JSON.parse(res.substring(4, res.length - 2));
    } catch (err) {
      print('json error ');
      return;
    }
    totalPage = Math.ceil(data['posts-total'] / num);
    setPageInfo({ pageIndex: page, pageLen: totalPage });
    let existNumb = 0;

    let postIndex = 0;
    for (let remotePost of data.posts) {
      if (isBreak) {
        isBreak = false;
        print(`${userID} Break`);
        return;
      }
      setPostInfo({ postIndex, postLen: data.posts.length });
      postIndex++;
      if (existNumb > 6) {
        print(`${userID} did update`);
        return;
      }
      await downloadPost(remotePost).catch(err => {
        if (err instanceof ExistError) {
          existNumb++;
          print('post already exist');
        } else {
          print(err);
        }
      });
    }
    print(`total page: ${totalPage}`);
  }
  if (page < totalPage && page < 100) {
    await main(userID, page + 1, htmlErrorNumber);
  }
};
