$('#incognitoBtn').click(function() {
  incognitoMode ? disableIncognito() : enableIncognito();
});

$('#settingsBtn').click(function() {
  $('#sidePanel').hasClass('open') ? closePanel() : openPanel();
});

function enableIncognito() {
  incognitoMode = true;
  remote.require('./main').enableIncognito();
  $("<link/>", {
     rel: "stylesheet",
     type: "text/css",
     href: "../css/torMaster.css"
  }).appendTo("head");
}

function disableIncognito() {
  incognitoMode = false;
  remote.require('./main').disableIncognito();
  $('webview').attr("webpreferences", "");
  $('link[rel=stylesheet][href="../css/torMaster.css"]').remove();
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

const favicon = function(e){
  if(e.favicons.length > 0)
  $(".v-tab[tab-id='" + e.srcElement.id +"'] > .fav > img").attr('src', e.favicons[0]);
  console.log(e.favicons);
}

const loadstart = function(e){
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

const loadfail = function(e){
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

const newWindow = function(event){
  console.log("New page: " + event.url);
  newTab(event.url);
}

const loadstop = function(e){
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

global.disableJS = function(){
  $('webview').attr("webpreferences", "javascript=no");
  var webviews = $(".webBrowser").detach();
  console.log(webviews);

  $(".webBrowser").remove();

  $(".container").append(webviews);
}
global.enableJS = function(){
  $('webview').attr("webpreferences", "");
  var webviews = $(".webBrowser").detach();
  console.log(webviews);

  $(".webBrowser").remove();

  $(".container").append(webviews);
}
