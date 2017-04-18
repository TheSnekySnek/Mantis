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
