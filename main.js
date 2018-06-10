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
  else if(data && data.folder){
    console.log(data)
    dir = data.folder[0];
  }

});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

let mainWindow
let torHandler

function createWindow () {
  // Create the browser window.
  console.log("normal");
  mainWindow = new BrowserWindow({width: 1170, height: 770, frame: false, minWidth: 740, minHeight: 220, icon: __dirname + '/assets/icons/logo256.ico', webPreferences: { plugins: true }})
  mainWindow.webContents.setWebRTCIPHandlingPolicy("disable_non_proxied_udp")
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
  //AdBlock
  /*session.defaultSession.webRequest.onBeforeRequest(['*://*./*'], function(details, callback) {
    var test_url = details.url;
    var check_block_list =/\.(gr|hk||fm|eu|it|es|is|net|ke|me||tz|za|zm|uk|us|in|com|de|fr|zw|tv|sk|se|php|pk|pl)\/ads?[\-_./\?]|(stats?|rankings?|tracks?|trigg|webtrends?|webtrekk|statistiche|visibl|searchenginejournal|visit|webstat|survey|spring).*.(com|net|de|fr|co|it|se)|cloudflare|\/statistics\/|torrent|[\-_./]ga[\-_./]|[\-_./]counter[\-_./\?]|ad\.admitad\.|\/widgets?[\-_./]?ads?|\/videos?[\-_./]?ads?|\/valueclick|userad|track[\-_./]?ads?|\/top[\-_./]?ads?|\/sponsor[\-_./]?ads?|smartadserver|\/sidebar[\-_]?ads?|popunder|\/includes\/ads?|\/iframe[-_]?ads?|\/header[-_]?ads?|\/framead|\/get[-_]?ads?|\/files\/ad*|exoclick|displayad|\ajax\/ad|adzone|\/assets\/ad*|advertisement|\/adv\/*\.|ad-frame|\.com\/bads\/|follow-us|connect-|-social-|googleplus.|linkedin|footer-social.|social-media|gmail|commission|adserv\.|omniture|netflix|huffingtonpost|dlpageping|log204|geoip\.|baidu|reporting\.|paypal|maxmind|geo\.|api\.bit|hits|predict|cdn-cgi|record_|\.ve$|radar|\.pop|\.tinybar\.|\.ranking|.cash|\.banner\.|adzerk|gweb|alliance|adf\.ly|monitor|urchin_post|imrworldwide|gen204|twitter|naukri|hulu.com|baidu|seotools|roi-|revenue|tracking.js|\/tracking[\-_./]?|elitics|demandmedia|bizrate|click-|click\.|bidsystem|affiliates?\.|beacon|hit\.|googleadservices|metrix|googleanal|dailymotion|ga.js|survey|trekk|visit_|arcadebanners?|visitor\.|ielsen|cts\.|link_|ga-track|FacebookTracking|quantc|traffic|evenuescien|roitra|pixelt|pagetra|metrics|[-_/.]?stats?[.-_/]?|common_|accounts\.|contentad|iqadtile|boxad|audsci.js|ebtrekk|seotrack|clickalyzer|\/tracker\/|ekomi|clicky|[-_/.]?click?[.-_/]?|[-_/.]?tracking?[.-_/]?|[-_/.]?track?[.-_/]?|ghostery|hscrm|watchvideo|clicks4ads|mkt[0-9]|createsend|analytix|shoppingshadow|clicktracks|admeld|google-analytics|-analytic|googletagservices|googletagmanager|tracking\.|thirdparty|track\.|pflexads|smaato|medialytics|doubleclick|cloudfront|-static|-static-|static-|sponsored-banner|static_|_static_|_static|sponsored_link|sponsored_ad|googleadword|analytics\.|googletakes|adsbygoogle|analytics-|-analytic|analytic-|googlesyndication|google_adsense2|googleAdIndexTop|\/ads\/|google-ad-|google-ad?|google-adsense-|google-adsense.|google-adverts-|google-adwords|google-afc-|google-afc.|google\/ad\?|google\/adv\.|google160.|google728.|_adv|google_afc.|google_afc_|google_afs.|google_afs_widget|google_caf.js|google_lander2.js|google_radlinks_|googlead|googleafc.|googleafs.|googleafvadrenderer.|googlecontextualads.|googleheadad.|googleleader.|googleleads.|googlempu.|ads_|_ads_|_ads|easyads|easyads|easyadstrack|ebayads|[.\-_/\?](ads?|clicks?|tracks?|tracking|logs?)[.\-_/]?(banners?|mid|trends|pathmedia|tech|units?|vert*|fox|area|loc|nxs|format|call|script|final|systems?|show|tag\.?|collect*|slot|right|space|taily|vids?|supply|true|targeting|counts?|nectar|net|onion|parlor|2srv|searcher|fundi|nimation|context|stats?|vertising|class|infuse|includes?|spacers?|code|images?|vers|texts?|work*|tail|track|streams?|ability||world*|zone|position|vertisers?|servers?|view|partner|data)[.\-_/]?/gi
    var check_white_list =/status|premoa.*.jpg|rakuten|nitori-net|search\?tbs\=sbi\:|google.*\/search|ebay.*static.*g|\/shopping\/product|aclk?|translate.googleapis.com|encrypted-|product|www.googleadservices.com\/pagead\/aclk|target.com|.css/gi;
    var block_me = check_block_list.test(test_url);
    var release_me = check_white_list.test(test_url);

    if(release_me){
      callback({cancel: false})
    }else if(block_me){
      console.log(test_url)
      callback({cancel: true});
    }else{
      callback({cancel: false})
    }
  });*/
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



//Need to work on this
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


