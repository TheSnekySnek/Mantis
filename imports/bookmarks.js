$('.favBar').on('click', '.bookmark', function() {
  var markUrl = $(this).attr('mark-url');
  var index = $.map(bTabs.tabs, function(obj, index) {
      if(obj.id == curTab) {
          return index;
      }
  })[0]
  bTabs.tabs[index].url = markUrl;
});

$('.search-right').on('click', '#bookmarkBtn', function(event) {
  $('#bookmarkName').val($('#' + curTab)[0].getTitle());
  $('.bookmarkInf').show();
});

$('#bookmarkSaveBtn').click(function (event) {
  $('.bookmarkInf').hide();
  var name = $('#bookmarkName').val();
  console.log("book");
  console.log(name);
  saveBookmark({ name: name, url: getUrlById(curTab)});
});

$('#bookmarkDeleteBtn').click(function (event) {
  $('.bookmarkInf').hide();
});

function saveBookmark(bookmark) {
  bookmarksData.bookmarks.push(bookmark);
  storage.get('bookmarks', function(error, data) {
    if (data[0].name) {
      data.push(bookmark);
      storage.set('bookmarks', data, function(error) {
        if (error) throw error;

      });
    }
    else {
      storage.set('bookmarks', [bookmark], function(error) {
        if (error) throw error;

      });
    }

  });
}

function initBookmarks() {
  storage.get('bookmarks', function(error, data) {
    if (data[0].name) {
      bookmarksData.bookmarks = data;
    }
  });
}
initBookmarks();
