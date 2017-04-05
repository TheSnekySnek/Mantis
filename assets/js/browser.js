onload = () => {

  const auto = require('google-autocomplete');

  const storage = require('electron-json-storage');
  storage.set('store', {history: []}, function(error) {
    if (error) throw error;

  });
  var disableNext = false;

  var curTab = "";
  var bTabs = { tabs:[] };
  var webSuggestionsData = {search: "", suggestions: []};
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

  function newTab(url) {
    var newId = makeid();
    bTabs.tabs.push({url: url, id: newId, name: "", tmpUrl: url});
    curTab = newId;
    displayTab(newId);
    $('#searchBar').val("");
  }

  function displayTab(id) {
    $('.tab[web-id="' + id + '"]').css('visibility', 'visible');
    $('.tab[web-id="' + id + '"] > webview').focus();
    $('.tab:not([web-id="' + id + '"])').css('visibility', 'hidden');
    curTab = id;
    $(".v-tab").removeClass("tab-selected")
    console.log($(".v-tab[tab-id='" + id +"']"));
    $(".v-tab[tab-id='" + id +"']").addClass("tab-selected")
    console.log(".v-tab[tab-id='" + id +"']");
    $('#searchBar').val(getUrlById(id));
  }
  $(document).arrive("webview", function() {
    var webview = $(this)[0];
    webview.addEventListener('did-start-loading', loadstart)
    webview.addEventListener('did-stop-loading', loadstop)
    webview.addEventListener('did-fail-load', loadfail)
    webview.addEventListener('new-window', newWindow)
    webview.addEventListener('page-favicon-updated', favicon)
    webview.addEventListener('did-get-response-details', response)

  });

  const response = (e) =>{

  }

  const favicon = (e) =>{
    if(e.favicons.length > 0)
    $(".v-tab[tab-id='" + e.srcElement.id +"'] > .fav > img").attr('src', e.favicons[0]);

    console.log(e.favicons);
  }

  const loadstart = (e) => {
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
    disableNext = true;
    e.srcElement.loadURL("file://" + __dirname + "/assets/error/105.html");
  }

  const newWindow = (event) => {
    console.log("New page: " + event.url);
    newTab(event.url);
  }

  const loadstop = (e) => {
    console.log(e);
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
    var historyEntry = {url: pageLoad, time: Date.now()}
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
    bTabs.tabs[index].name = webview.getTitle();
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
    if (e.which == 13 || e.which == 38 || e.which == 40) {
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
  $('#searchBar').keypress(function (e) {


    if (e.which == 13) {

      var url = $('#searchBar').val();
      var finUrl = url;
      if((url.indexOf('.') < 0 && url.indexOf(':') < 0)|| (url.indexOf('.') == url.lenght || url.indexOf('.') == 0)){
        finUrl = "https://www.google.com/#q=" + url;
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
  $('#homeBtn').click(function (e) {
    var webview = $('#' + curTab)[0];
    webview.loadURL("https://www.google.com");
  });
  $('.add-tab').click(function (e) {
    newTab("https://www.google.com");
  });
  $('.v-tabs').on('click', '.v-tab', function() {
    var tabId = $(this).attr('tab-id');
    console.log(tabId);
    displayTab(tabId);
    curTab = tabId;
  });
  $('#refreshBtn').click(function (e) {
    var webview = $('#' + curTab)[0];
    webview.reload();
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

  $('#historyBtn').click(function (e) {

  });

  newTab("https://www.google.com");

  function makeid()
  {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }

  const remote = require('electron').remote;
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
    displayTab(bTabs.tabs[bTabs.tabs.length-1].id);
  }





}
