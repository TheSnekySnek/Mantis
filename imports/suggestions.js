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
