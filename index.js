const request = require('request');
const rp = require('request-promise');
const path = require('path');
const headers = require('./headers');
const { downloadPost } = require('./process');
const { options } = require('./config');

const main = async (userID, page) => {
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
  } catch (err) {
    console.error(`Get Html Error ${err}`);
  }
  if (res) {
    let data = JSON.parse(res.substring(4, res.length - 2));
    totalPage = Math.ceil(data['posts-total'] / num);
    for (let remotePost of data.posts) {
      await downloadPost(remotePost).catch(err => {
        console.error(err);
      });
    }
    console.log(`total page: ${totalPage} current page:${page}`);
  }
  if (page < totalPage) {
    main(userID, page + 1);
  }
};
//secretlsggs paintingispoetry
main('bluefox730', 7);
