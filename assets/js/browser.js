onload = () => {

  const auto = require('google-autocomplete');
  const remote = require('electron').remote;
  const storage = require('electron-json-storage');

  //Vue
  var bTabs = { tabs:[] };
  const webSuggestionsData = {search: "", suggestions: []};
  const bookmarksData = { bookmarks: [
    { name: "Example", url: "http://example.com/" },
    { name: "Hidden Wiki", url: "http://gxamjbnu7uknahng.onion/wiki/index.php/Main_Page" },
    { name: "Demo3", url: "http://example.com/" }
  ]};

  const musicData = {
    name: "Stopped",
    path: "",
    len: 220,
    time: 83,
    timeStr: "0:00",
    timeCss: "0%",
    volumeCss: "10%",
    sep: "|",
    volume: 0.1,
    volumeStr: "10%",
    songs: [],
    index: 0
  };

  var visualTabs = new Vue({
    el: '.v-tabs',
    data: bTabs
  })
  var browser = new Vue({
    el: '.webBrowser',
    data: bTabs
  })

  var webSuggestions = new Vue({
    el: '.suggestions-tab',
    data: webSuggestionsData
  })

  var bookmarks = new Vue({
    el: '.favBar',
    data: bookmarksData
  })

  var musicPlayer = new Vue({
    el: '.musicBar',
    data: musicData
  })


  //musicPlayer
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

  function playNextSong(back = false) {
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

  function initMusic() {
    var songs = remote.require('./main').initMusicFiles();
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


  //Nav
  $('#incognitoBtn').click(function() {
    incognitoMode ? disableIncognito() : enableIncognito();
  });

  $('#settingsBtn').click(function() {
    $('#sidePanel').hasClass('open') ? closePanel() : openPanel();
  });

  $('#musicBtn').click(function() {
    $('.musicBar').hasClass('open') ? closeMusic() : openMusic();
  });

  function enableIncognito() {
    incognitoMode = true;
    remote.require('./main').enableIncognito();
    $("<link/>", {
       rel: "stylesheet",
       type: "text/css",
       href: "./assets/torMaster.css"
    }).appendTo("head");
  }

  function disableIncognito() {
    incognitoMode = false;
    remote.require('./main').disableIncognito();
    $('link[rel=stylesheet][href="./assets/torMaster.css"]').remove();
  }

  function newTab(url) {
    var newId = makeid();
    bTabs.tabs.push({url: url, id: newId, name: "", tmpUrl: url});
    curTab = newId;
    displayTab(newId);
    $('#searchBar').val("");
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

  function checkTabSize() {
    var tabsWidth = $('.container').width();
    var tabs = bTabs.tabs.length;
    if(tabs * 195 > tabsWidth - 350){
      var tW = ((tabsWidth - 350) / (tabs)) -2;
      $('.v-tab').css('width', tW)
      $('.v-tab').css('margin-left', 1)
      $('.v-tab').css('margin-right', 1)
      $('.v-tab > p').css('width', tW - 40)
      $('.v-tab > .hide-text').hide();
    }
    else{
      $('.v-tab').css('width', 185)
      $('.v-tab > p').css('width', 115)
      $('.v-tab').css('margin-left', 5)
      $('.v-tab').css('margin-right', 5)
      $('.v-tab > .hide-text').show();
    }
  }

  function displayTab(id) {
    curTab = id;
    $('.tab[web-id="' + id + '"]').css('visibility', 'visible');
    $('.tab[web-id="' + id + '"] > webview').focus();
    $('.tab:not([web-id="' + id + '"])').css('visibility', 'hidden');
    $(".v-tab").removeClass("tab-selected")
    console.log($(".v-tab[tab-id='" + id +"']"));
    $(".v-tab[tab-id='" + id +"']").addClass("tab-selected")
    console.log(".v-tab[tab-id='" + id +"']");
    $('#searchBar').val(getUrlById(id));
  }
  $(document).arrive(".v-tab", function() {
    checkTabSize();
  })
  $(document).arrive("webview", function() {
    var webview = $(this)[0];
    webview.addEventListener('did-start-loading', loadstart)
    webview.addEventListener('did-stop-loading', loadstop)
    webview.addEventListener('did-fail-load', loadfail)
    webview.addEventListener('new-window', newWindow)
    webview.addEventListener('page-favicon-updated', favicon)
  });

  const favicon = (e) =>{
    if(e.favicons.length > 0)
    $(".v-tab[tab-id='" + e.srcElement.id +"'] > .fav > img").attr('src', e.favicons[0]);
    console.log(e.favicons);
  }

  const loadstart = (e) => {
    $('#refreshBtn').removeClass('fa-refresh');
    $('#refreshBtn').addClass('fa-times');
    $('.is-secure').hide();
    $('#searchBar').removeClass('sec');
    $(".v-tab[tab-id='" + e.srcElement.id +"'] > .fav > img").hide();
    $('.v-tab[tab-id="'+ e.srcElement.id +'"] > .lc').show();
    var index = $.map(bTabs.tabs, function(obj, index) {
        if(obj.id == e.srcElement.id) {
            return index;
        }
    })[0]
    bTabs.tabs[index].name = e.srcElement.src;
    $('.suggestions-tab').removeClass("act");
    webSuggestionsData.suggestions = [];
    console.log("Loading...");
  }

  const loadfail = (e) => {
    console.log(e);
    console.log("fail");
    switch (e.errorCode) {
      case -501:
        //ask to add
        console.log("Push");
        var dList = remote.getGlobal("ignoredDomains").urls
        dList.push(extractHostname(e.srcElement.src));
        remote.getGlobal("ignoredDomains").urls = dList;
        console.log(remote.getGlobal("ignoredDomains").urls);
        break;
      case -120:
        disableNext = true;
        e.srcElement.loadURL("file://" + __dirname + "/assets/error/105.html");
        break;
      case -105:
        disableNext = true;
        e.srcElement.loadURL("file://" + __dirname + "/assets/error/105.html");
        break;
      default:

    }
  }

  const newWindow = (event) => {
    console.log("New page: " + event.url);
    newTab(event.url);
  }

  const loadstop = (e) => {
    console.log(e);
    $('#refreshBtn').removeClass('fa-times');
    $('#refreshBtn').addClass('fa-refresh');
    $('.v-tab[tab-id="'+ e.srcElement.id +'"] > .lc').hide();
    $(".v-tab[tab-id='" + e.srcElement.id +"'] > .fav > img").show();
    var webview = e.srcElement;
    console.log(webview.id);
    var index = $.map(bTabs.tabs, function(obj, index) {
        if(obj.id == webview.id) {
            return index;
        }
    })[0]
    console.log("Stopped Loading");
    var pageLoad = webview.getURL();
    if(!incognitoMode)
      addHistory(pageLoad)
    var title = webview.getTitle();
    bTabs.tabs[index].name = title;
    document.title = title;
    if(!disableNext){
      bTabs.tabs[index].tmpUrl = pageLoad;
      console.log(pageLoad);
      $('#searchBar').val(pageLoad);
      if(pageLoad.indexOf("https://") == 0){
        $('.is-secure').show();
        $('#searchBar').addClass('sec');
      }
    }
    else {
      disableNext = false;
    }
  }

  function getUrlById(id) {
    var url = $.map(bTabs.tabs, function(obj, index) {
        if(obj.id == id) {
            return obj.tmpUrl;
        }
    })[0]
    return url;
  }

  $('#searchBar').keypress(function (e) {
    if (e.which == 13) {
      var url = $('#searchBar').val();
      var finUrl = url;

      if((url.indexOf('.') < 0 && url.indexOf(':') < 0)|| (url.indexOf('.') == url.lenght || url.indexOf('.') == 0)){
        if(incognitoMode){
          finUrl = "https://www.duckduckgo.com/?q=" + url;
        }
        else {
          finUrl = "https://www.google.com/#q=" + url;
        }
      }
      else if(!url.startsWith("http://") && !url.startsWith("https://")){
        finUrl = "https://" + url;
      }
      var index = $.map(bTabs.tabs, function(obj, index) {
          if(obj.id == curTab) {
              return index;
          }
      })[0]
      bTabs.tabs[index].url = finUrl;

    }
  });

  $('#backBtn').click(function (e) {
    var webview = $('#' + curTab)[0];
    webview.goBack();
  });
  $('#forwardBtn').click(function (e) {
    var webview = $('#' + curTab)[0];
    webview.goForward();
  });
  $('#refreshBtn').click(function (e) {
    var webview = $('#' + curTab)[0];
    webview.reload();
  });
  $('#homeBtn').click(function (e) {
    var webview = $('#' + curTab)[0];
    if (incognitoMode) {
      webview.loadURL("https://www.duckduckgo.com");
    }
    else {
      webview.loadURL("https://www.google.com");
    }
  });
  $('.add-tab').click(function (e) {
    if (incognitoMode) {
      newTab("https://www.duckduckgo.com");
    }
    else {
      newTab("https://www.google.com");
    }
  });

  //bookmarks
  $('.favBar').on('click', '.bookmark', function() {
    var markUrl = $(this).attr('mark-url');
    var index = $.map(bTabs.tabs, function(obj, index) {
        if(obj.id == curTab) {
            return index;
        }
    })[0]
    bTabs.tabs[index].url = markUrl;
  });


  //suggestions
  $('.suggestions-tab').on('click', '.suggestion', function() {
    var selected = $(this).find('p').text();
    $('#searchBar').val(selected);
    var index = $.map(bTabs.tabs, function(obj, index) {
        if(obj.id == curTab) {
            return index;
        }
    })[0]
    bTabs.tabs[index].url = "https://www.google.com/#q=" + selected;
    $('.suggestions-tab').removeClass("act");
    webSuggestionsData.suggestions = [];
  });
  $("#searchBar").on("paste keyup", function(e) {
    if (e.which == 13 || e.which == 38 || e.which == 40 || incognitoMode) {
      return;
    }
    if(!$('.suggestions-tab > .suggestion.sel').length){
      $('.suggestions-tab > .suggestion:nth-child(1)').addClass('sel');
    }
    var value = $('#searchBar').val();
    webSuggestionsData.search = value;
    auto.getQuerySuggestions(value, function(err, suggestions) {
      if (value == "") {
        $('.suggestions-tab').removeClass("act");
      }
      if(value.indexOf('://') < 0){
        var newArr = [];
        for (var i = 0; i < suggestions.length; i++) {
          if((suggestions[i].relevance >= 600 || i < 4) && i < 5){
            newArr.push(suggestions[i].suggestion);
          }
        }
        webSuggestionsData.suggestions = newArr;
      }
      if(webSuggestionsData.suggestions.length > 0){
        $('.suggestions-tab').addClass("act");
      }
    })
  });

  $('#searchBar').keydown(function (e) {
    $('.is-secure').hide();
    $('#searchBar').removeClass('sec');
    if($('.suggestions-tab').hasClass('act')){
      var selIndex = $('.sel').index() + 1;
      if (e.which == 40 && selIndex < $(".suggestions-tab").children().length) {
        selIndex++;
        $('.suggestions-tab > .suggestion.sel').removeClass('sel');
        $('.suggestions-tab > .suggestion:nth-child(' + selIndex +')').addClass('sel');
        $('#searchBar').val($('.suggestions-tab > .suggestion.sel > p').text());
      }
      else if (e.which == 38 && selIndex != 1) {
        e.preventDefault();
        selIndex--;
        $('.suggestions-tab > .suggestion.sel').removeClass('sel');
        $('.suggestions-tab > .suggestion:nth-child(' + selIndex +')').addClass('sel');
        $('#searchBar').val($('.suggestions-tab > .suggestion.sel > p').text());
      }
      if(e.which == 38){
        e.preventDefault();
      }
    }
  });


  //window
  $( ".v-tabs" ).sortable({axis: "x", containment: "parent", tolerance: "pointer"});
  $( ".v-tabs" ).disableSelection();

  $( ".left-items" ).sortable({axis: "x", containment: "parent"});
  $( ".left-items" ).disableSelection();

  $( ".favBar" ).sortable({axis: "x", containment: "parent"});
  $( ".favBar" ).disableSelection();

  function openPanel() {
    $('.tab').width($(document).width() - $('#sidePanel').width() - 15);
    $('#sidePanel').removeClass('close');
    $('#sidePanel').addClass('open');
  }
  function closePanel() {
    $('.tab').width("100%");
    $('#sidePanel').removeClass('open');
    $('#sidePanel').addClass('close');
  }

  function openMusic() {
    $('.search-right').removeClass("full-bar")
    $('.top-connector').removeClass("full-bar")
    $('#searchBar').removeClass("full-bar")
    $('.musicBar').removeClass('close');
    $('.musicBar').addClass('open');
  }
  function closeMusic() {
    $('.search-right').addClass("full-bar")
    $('.top-connector').addClass("full-bar")
    $('#searchBar').addClass("full-bar")
    $('.musicBar').removeClass('open');
    $('.musicBar').addClass('close');
  }

  $('.min-icon').click(function (e) {
    var window = remote.getCurrentWindow();
    window.minimize();
  });
  $('.max-icon').click(function (e) {
    var window = remote.getCurrentWindow();
    if (!window.isMaximized()) {
        window.maximize();
    } else {
        window.unmaximize();
    }
  });

  $('.close-icon').click(function (e) {
    var window = remote.getCurrentWindow();
    window.close();
  });
  function deleteTab(id) {
    var index = $.map(bTabs.tabs, function(obj, index) {
        if(obj.id == id) {
            return index;
        }
    })[0]
    bTabs.tabs.splice(index, 1);
    checkTabSize();
    console.log(id);
    console.log(curTab);
    if (id == curTab) {
      displayTab(bTabs.tabs[bTabs.tabs.length -1].id);
    }
    else {
      displayTab(curTab);
    }

  }


  //history
  storage.set('store', {history: []}, function(error) {
    if (error) throw error;
  });

  function addHistory(url) {
    var historyEntry = {url: url, time: Date.now()}
    storage.get('store', function(error, data) {
      if (error) throw error;
      if(data.history){
        var rh = data;
        rh.history.push(historyEntry);
        storage.set('store', rh, function(error) {
          if (error) throw error;

        });
      }
      else{
        storage.set('store', {history: [historyEntry]}, function(error) {
          if (error) throw error;

        });
      }
    });
  }

  //Tabs
  $('.v-tabs').on('click', '.v-tab', function(e) {
    if(e.target != $(this).find('div.tab-close')[0]){
      var tabId = $(this).attr('tab-id');
      curTab = tabId;
      console.log(tabId);
      displayTab(tabId);
    }
  });

  $('.v-tabs').on('click', '.tab-close', function() {
    var id = $(this).parent().attr('tab-id');
    if(bTabs.tabs.length <= 1){
      var window = remote.getCurrentWindow();
      window.close();
    }
    setTimeout(function() {
      deleteTab(id);
    }, 100);
  });

  $('.v-tabs').on('mouseenter', '.v-tab', function() {
    $(this).find('.tab-close').animate({ opacity: 0.99 }, 0);
  });
  $('.v-tabs').on('mouseleave', '.v-tab', function() {
    $(this).find('.tab-close').animate({ opacity: 0.01 }, 0);
  });





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
}
