var blessed = require('blessed');

// Create a screen object.
var screen = blessed.screen({
  smartCSR: true,
});

screen.title = 'my window title';

let InfoBox = blessed.box({
  label: ' {bold}{yellow-fg}Info{/yellow-fg}{/bold} ',
  top: '0',
  left: '50%',
  width: '50%',
  height: '30%',
  tags: true,
  border: {
    type: 'line',
  },
});

screen.append(InfoBox);

let BreakBtn = blessed.button({
  parent: InfoBox,
  content: 'break',
  top: '70%',
  right: '0',
  width: '30%',
  height: '20%',
  style: {
    fg: 'blue',
    bg: 'black',
    border: {
      fg: 'blue',
    },
    scrollbar: {
      bg: 'blue',
    },
    focus: {
      bg: 'red',
    },
    hover: {
      bg: 'red',
    },
  },
});
const setUserInfo = ({ nick_name, name, userIndex = '-', userLen = '-' }) => {
  InfoBox.setLine(0, `Name: ${name}`);
  InfoBox.setLine(1, `NickName: ${nick_name}`);
  InfoBox.setLine(2, `User: ${userIndex}/${userLen}`);
};
const setPostInfo = ({ postIndex = '-', postLen = '-' }) => {
  InfoBox.setLine(4, `Post: ${postIndex}/${postLen}`);
};
const setPageInfo = ({ pageIndex = '-', pageLen = '-' }) => {
  InfoBox.setLine(3, `Page: ${pageIndex}/${pageLen}`);
};

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

var userList = blessed.list({
  parent: screen,
  label: ' {bold}{cyan-fg}User List{/cyan-fg}{/bold}',
  tags: true,
  draggable: false,
  top: '0',
  left: '0',
  width: '50%',
  height: '30%',
  keys: true,
  vi: true,
  mouse: true,
  border: 'line',
  scrollbar: {
    ch: ' ',
    track: {
      bg: 'cyan',
    },
    style: {
      inverse: true,
    },
  },
  style: {
    item: {
      hover: {
        bg: 'blue',
      },
    },
    selected: {
      bg: 'blue',
      bold: true,
    },
  },
});

let logger = blessed.log({
  label: ' {bold}{red-fg}Log{/red-fg}{/bold} ',
  top: '30%',
  left: '0%',
  width: '100%',
  height: '70%',
  scrollback: 100,
  tags: true,
  keys: false,
  vi: true,
  mouse: false,
  border: {
    type: 'line',
  },
  style: {
    border: {
      fg: 'blue',
    },
  },
  scrollbar: {
    ch: ' ',
    track: {
      bg: 'yellow',
    },
    style: {
      inverse: true,
    },
  },
});

screen.append(logger);
global.logger = logger;

screen.render();
module.exports = {
  setUserInfo,
  setPostInfo,
  setPageInfo,
  userList,
  logger,
  screen,
  BreakBtn,
};
