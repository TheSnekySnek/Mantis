$('.v-tabs').on('mousedown', '.v-tab', function(e) {
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
