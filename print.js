const print = str => {
  if (global.logger) {
    global.logger.log(str);
  } else {
    console.log(str);
  }
};

module.exports = print;
