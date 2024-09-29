// Initialize Materialize form select
document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems);
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/serviceworker.js')
        .then((reg) => {
          console.log('Service Worker Registered', reg);
        })
        .catch((err) => {
          console.error('Service Worker Registration Failed', err);
        });
    });
  }
  