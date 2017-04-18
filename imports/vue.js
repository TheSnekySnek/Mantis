var bTabs = { tabs:[] };
const webSuggestionsData = {search: "", suggestions: []};
const bookmarksData = { bookmarks: [
  
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
