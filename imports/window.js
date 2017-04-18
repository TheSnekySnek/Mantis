$( ".v-tabs" ).sortable({axis: "x", containment: "parent", tolerance: "pointer"});
$( ".v-tabs" ).disableSelection();

$( ".left-items" ).sortable({axis: "x", containment: "parent"});
$( ".left-items" ).disableSelection();

$( ".favBar" ).sortable({axis: "x", containment: "parent", tolerance: "pointer"});
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
