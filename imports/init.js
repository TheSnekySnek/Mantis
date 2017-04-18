const auto = require('google-autocomplete');
const remote = require('electron').remote;
const storage = require('electron-json-storage');
const path = require('path');

var disableNext = false;

var incognitoMode = false;

var playerOffset = $('.progress-bar').position().left;
var playerClick = false;

var volumeOffset = $('.songVol').offset().left;
var volumeClick = false;

var curTab = "";

function makeid()
{
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < 10; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

newTab("https://www.google.com");

var player = $('#musicPlayer').get();
player[0].volume = 0.1;
