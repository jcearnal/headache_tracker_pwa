export const showNotification = (message) => {
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notificationMessage");
  
    notificationMessage.textContent = message;
    notification.style.display = "block";
  
    setTimeout(() => {
      notification.style.display = "none";
    }, 5000);
  };
  