const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const fs = require('fs');
const dir = "C:\\Users\\Diego\\Desktop\\";

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1170, height: 770, frame: false})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))



  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

exports.initMusicFiles = function () {
  var files = fs.readdirSync(dir);
  var songs = [];
  for (var i = 0; i < files.length; i++) {
    var ext = files[i].substr(files[i].lastIndexOf('.') + 1);
    console.log(ext);
    if(ext == "mp3" || ext == "ogg" || ext == "wav" || ext == "aac"){
      songs.push(dir + files[i]);
    }
  }
  return songs;
}

function extractHostname(url) {
  var domain;
  //find & remove protocol (http, ftp, etc.) and get domain
  if (url.indexOf("://") > -1) {
      domain = url.split('/')[2];
  }
  else {
      domain = url.split('/')[0];
  }

  //find & remove port number
  domain = domain.split(':')[0];

  return domain;
}

global.ignoredDomains = {urls: []};

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  console.log(global.ignoredDomains.urls);
  if (global.ignoredDomains.urls.includes(extractHostname(url))) {
    // Verification logic.
    event.preventDefault()
    callback(true)
  } else {
    callback(true)
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
