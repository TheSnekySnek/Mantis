onload = () => {


  const storage = require('electron-json-storage');
  storage.set('store', {history: []}, function(error) {
    if (error) throw error;

  });

  var curTab = "";
  var bTabs = { tabs:[] };
  var visualTabs = new Vue({
    el: '.v-tabs',
    data: bTabs
  })
  var browser = new Vue({
    el: '.webBrowser',
    data: bTabs
  })

  function newTab(url) {
    var newId = makeid();
    bTabs.tabs.push({url: url, id: newId, name: ""});
    curTab = newId;
    displayTab(newId);
  }

  function displayTab(id) {
    $('.tab').hide();
    console.log($('#' + id));
    $('#' + id).parent().show();
    curTab = id;
    $(".v-tab").removeClass("tab-selected")
    console.log($(".v-tab[tab-id='" + id +"']"));
    $(".v-tab[tab-id='" + id +"']").addClass("tab-selected")
    console.log(".v-tab[tab-id='" + id +"']");
  }
  $(document).arrive("webview", function() {
    var webview = $(this)[0];
    webview.addEventListener('did-start-loading', loadstart)
    webview.addEventListener('did-stop-loading', loadstop)
    webview.addEventListener('did-fail-loading', loadfail)
    webview.addEventListener('new-window', newWindow)
  });

  const loadstart = (e) => {
    console.log("Loading...");

  }

  const loadfail = (e) => {
    console.log(e);
    console.log("fail");

  }

  const newWindow = (event) => {
    console.log("New page: " + event.url);
    newTab(event.url);

  }

  const loadstop = (e) => {
    console.log(e);
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
        console.log(rh);
      }
      else{
        storage.set('store', {history: [historyEntry]}, function(error) {
          if (error) throw error;

        });
      }
    });
    console.log(index);
    bTabs.tabs[index].name = webview.getTitle();
    console.log(pageLoad);
    $('#searchBar').val(pageLoad);
  }


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
      console.log(finUrl);
      var webview = $('#' + curTab)[0];
      webview.loadURL(finUrl);
    }
  });
  $('#backBtn').click(function (e) {
    var webview = $('#' + curTab)[0];
    webview.goBack();
  });
  $('#forwardBtn').click(function (e) {
    var webview = $('#' + curTab)[0];
    webview.goBack();
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
