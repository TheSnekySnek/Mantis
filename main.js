const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}
const electron = require('electron')
// Module to control application life.
const app = electron.app
app.commandLine.appendSwitch("js-flags", "--reduced-referrer-granularity");

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const session = electron.session
const storage = require('electron-json-storage');

const path = require('path')
const url = require('url')
const request = require('request')
const fs = require('fs');


var userDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var dir = path.join(userDir, "Music/");

storage.get('music', function(error, data) {
  if (error) {
    console.log(error);
  }
  else if(data){
    dir = data.folder[0];
  }

});

storage.get('music', function(error, data) {
  if (error) {
    console.log(error);
  }
  else if(data){
    dir = data.folder[0] + "/";
  }
  console.log(data);
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

let mainWindow
let torHandler

function createWindow () {
  // Create the browser window.
  console.log("normal");
  mainWindow = new BrowserWindow({width: 1170, height: 770, frame: false, minWidth: 740, minHeight: 220, icon: __dirname + '/assets/icons/logo256.ico', webPreferences: { plugins: true }})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'assets/ui/index.html'),
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
app.on('ready', function() {
  createWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})



exports.enableIncognito = function () {

  request({
        url: 'https://www.example.com',
        proxy: "socks5://127.0.0.1:9050"
    }, function (error, response, body) {
        if (error) {
          //console.log(error);
          var spawn = require('child_process').spawn;
          torHandler = spawn(path.join(__dirname, '/assets/tor/Tor/tor.exe'));
          mainWindow.webContents.session.setProxy({proxyRules:"socks5://127.0.0.1:9050"}, function () {console.log("Ingognito Mode");});
          torHandler.stdout.on('data', function(data){
              console.log('stdout:'+ data);
          });
        } else {
            console.log(response);
            mainWindow.webContents.session.setProxy({proxyRules:"socks5://127.0.0.1:9050"}, function () {console.log("Ingognito Mode");});
        }
    });
}

exports.disableIncognito = function () {
  torHandler ? torHandler.kill() : console.log("Wut???");
  mainWindow.webContents.session.setProxy({proxyRules:""}, function () {console.log("Normal Mode");});

}

exports.startIncognito = function () {
  createTorWindow();
}

exports.initMusicFiles = function (dirName) {
  if(dirName)
    dir = dirName

  var files = fs.readdirSync(dir);
  var songs = [];
  for (var i = 0; i < files.length; i++) {
    var ext = files[i].substr(files[i].lastIndexOf('.') + 1);
    console.log(ext);
    if(ext == "mp3" || ext == "ogg" || ext == "wav" || ext == "mp4"){
      songs.push(dir + files[i]);
    }
  }
  return songs.sort();
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

})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
