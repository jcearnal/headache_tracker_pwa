// Initialize Materialize form select
document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('select');
  var instances = M.FormSelect.init(elems);

  // Handle form submission to prevent page reload
  const form = document.getElementById('headacheForm');
  form.addEventListener('submit', function (event) {
      event.preventDefault(); // Prevent page reload

      // Collect form data
      const duration = document.getElementById('duration').value;
      const severity = document.getElementById('severity').value;
      const leaveWork = document.getElementById('leaveWork').checked;
      const layDown = document.getElementById('layDown').checked;

      // Log the form data (replace this with IndexedDB storage if needed)
      console.log('Headache logged:', { duration, severity, leaveWork, layDown });

      // Provide feedback to the user
      alert('Headache entry logged successfully!');
  });
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
      navigator.serviceWorker
          .register('./service-worker.js') 
          .then((registration) => {
              console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
              console.error('Service Worker registration failed:', error);
          });
  });
}
