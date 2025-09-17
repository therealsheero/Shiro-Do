chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "notifyNow") {
    sendNotification();
  }

  if (msg.action === "enableNotifications") {
    const frequency = msg.frequencyHours;
    chrome.alarms.clear("sendNotification", () => {
      chrome.alarms.create("sendNotification", { periodInMinutes: frequency * 60 });
    });
    sendNotification(); 
  }

  if (msg.action === "disableNotifications") {
    chrome.alarms.clear("sendNotification");
  }
});
async function sendNotification() {
  const { tasks } = await chrome.storage.local.get("tasks");
  const pendingTasks = tasks ? tasks.filter(t => !t.completed) : [];
  const taskCount = pendingTasks.length;

  chrome.notifications.create({
    type: "basic",
    iconUrl: "assets/icon.png",
    title: "Shiro - Do Reminder (Do your tasks!)",
    message: taskCount
      ? `You have ${taskCount} pending task(s).`
      : "All tasks completed! 🎉",
    priority: 2
  });
}
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "sendNotification") sendNotification();
});
chrome.runtime.onStartup.addListener(async () => {
  const { frequencyHours } = await chrome.storage.local.get("frequencyHours");
  if (frequencyHours) {
    chrome.alarms.create("sendNotification", { periodInMinutes: frequencyHours * 60 });
  }
});
