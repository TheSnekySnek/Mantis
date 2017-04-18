storage.get('music', function(error, data) {
  $('.folder-path').text(data.folder[0]);
});

function playerPlay() {
  if($('#musicPlayer').attr("src") == ""){
    initMusic();
  }
  else{
    $('#musicPlayer')[0].play();
    $('#mPauseBtn').removeClass('fa-play');
    $('#mPauseBtn').addClass('fa-pause');
  }
}
function playerPause() {
  $('#musicPlayer')[0].pause();
  $('#mPauseBtn').removeClass('fa-pause');
  $('#mPauseBtn').addClass('fa-play');
}

function playerStop() {
  playerPause();
  musicData.path = "";
  musicData.name = "Stopped";
  musicData.time = 0;
  musicData.timeCss = "0%"
  musicData.timeStr = "0:00";
  musicData.len = 0;
  musicData.index = 0;
}

function playNextSong(back) {
  var songs = musicData.songs;
  if(back){
    musicData.index > 0 ? musicData.index-- : musicData.index = songs.length-1;
  }
  else {
    musicData.index < songs.length-1 ? musicData.index++ : musicData.index = 0;
  }
  var song = songs[musicData.index];
  musicData.path = song;
  musicData.name = song.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "");
  musicData.time = 0;
  musicData.timeCss = "0%"
  musicData.timeStr = "0:00";
  var player = $('#musicPlayer').get();
  musicData.len = player[0].duration
  setTimeout(function () {
    playerPlay();
  }, 1000)
}

function calculatePlayerBar() {
  var cur = musicData.time;
  var len = musicData.len;
  var cal = cur * 100 / len;
  musicData.timeCss = cal +"%";
};
function setPlayerTime(tm) {
  musicData.time = tm;
  var minutes = Math.floor(tm / 60);
  var seconds = Math.floor(tm - minutes * 60);
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  musicData.timeStr = minutes + ":" + seconds;
  calculatePlayerBar();
};

function initMusic(dirName) {
  var mDir = path.join(__dirname, '../../main.js');
  console.log(mDir);
  var songs = remote.require('./main').initMusicFiles(dirName);
  musicData.songs = songs;
  playNextSong();
}

function setVolume(vl) {
  var player = $('#musicPlayer').get();
  player[0].volume = vl / 200;
  player.volume = vl / 100;
  musicData.volume = vl / 100;
  musicData.volumeStr = vl + "%";
  musicData.volumeCss = vl +"%";
}

$( window ).resize(function() {
  checkTabSize();
  playerOffset = $('.progress-bar').position().left;
  volumeOffset = $('.songVol').offset().left;
});
$('.progress-bar').mouseleave(function(){
  playerClick = false;
});
$(document).mouseup(function(){
  playerClick = false;
})
$('.progress-bar').mousedown(function(){
  playerClick = true;
  console.log(event.pageX);
  var x = event.pageX - playerOffset;
  var len = musicData.len;
  var playerLen = 200;
  var e = (x * len) / playerLen;
  console.log(e);
  if(e <= len)
    var player = $('#musicPlayer').get();
    console.log("cha");
    player[0].currentTime = e;
    setPlayerTime(e);
});
$( ".progress-bar" ).mousemove(function( event ) {

  if(playerClick){
    var x = event.pageX - playerOffset;
    var len = musicData.len;
    var playerLen = 200;
    var e = (x * len) / playerLen;
    console.log(e);
    if(e <= len)
      var player = $('#musicPlayer').get();
      console.log("cha");
      player[0].currentTime = e;
      setPlayerTime(e);
  }
});

$(".songVol").mouseleave(function(){
  volumeClick = false;
  console.log("leave");
});
$(document).mouseup(function(){
  volumeClick = false;
})
$(".songVol").mousedown(function(){
  volumeClick = true;
  console.log("vol");
  var x = event.pageX - volumeOffset;
  var len = 100;
  var volumeLen = 60;
  var e = Math.floor((x * len) / volumeLen);
  console.log(e);
  if(e <= len && e >= 0)
    setVolume(e);
});
$( ".songVol" ).mousemove(function( event ) {

  if(volumeClick){
    var x = event.pageX - volumeOffset;
    var len = 100;
    var volumeLen = 60;
    var e = Math.floor((x * len) / volumeLen);
    console.log(e);
    if(e <= len && e >= 0)
      setVolume(e);
  }
});

$('#musicPlayer').on("durationchange", function() {
  musicData.len = this.duration;
});

$('#musicPlayer').on("timeupdate", function() {
  setPlayerTime(this.currentTime);
});

$('#musicPlayer').on("ended", function() {
  playNextSong();
});

$('#mPauseBtn').click(function() {
  var player = $('#musicPlayer').get();
  player[0].paused ? playerPlay() : playerPause();
});

$('#mForwardBtn').click(function() {
  playNextSong();
});

$('#mBackBtn').click(function() {
  playNextSong(true);
});

$('#mStopBtn').click(function() {
  playerStop();
});

$('#musicSelect').click(function() {
  musicSelectDir();
});

function musicSelectDir() {
  var dialog = remote.require('electron').dialog;

  var path = dialog.showOpenDialog({
      properties: ['openDirectory']
  });
  if (path) {
    path[0] += "\\";
    storage.set('music', {folder: path}, function(error) {
      if (error) throw error;
      console.log(path);
      initMusic(path[0]);
    });
  }
};
