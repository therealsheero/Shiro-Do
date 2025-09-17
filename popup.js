document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskList = document.getElementById("taskList");
  const enableNotifBtn = document.getElementById("enableNotif"); 
  const disableNotifBtn = document.getElementById("disableNotif");

  if (enableNotifBtn) {
  enableNotifBtn.addEventListener("click", async () => {
    let frequency = parseFloat(prompt("Enter reminder frequency in hours (e.g., 6):"));
    if (isNaN(frequency) || frequency <= 0.0) return alert("Invalid frequency!");
    await chrome.storage.local.set({ frequencyHours: frequency });
    chrome.runtime.sendMessage({ action: "enableNotifications", frequencyHours: frequency });
    alert(`Notifications enabled! You will get reminders every ${frequency} hour(s).`);
  });
  }
  if (disableNotifBtn) {
    disableNotifBtn.addEventListener("click", async () => {
      await chrome.storage.local.remove(["frequencyHours"]);
      chrome.runtime.sendMessage({ action: "disableNotifications" });
      alert("Notifications disabled!");
    });
  }
  chrome.storage.local.get(["tasks"], (result) => {
    if (result.tasks) {
      result.tasks.forEach((task) => renderTask(task));
    }
    updateProgress();
  });

  addTaskBtn.addEventListener("click", () => {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const task = { text: taskText, completed: false };
    renderTask(task);
    saveTask(task);

    taskInput.value = "";
    updateProgress();
  });
  function renderTask(task) {
    const li = document.createElement("li");
    if (task.completed) li.classList.add("completed");
    const span = document.createElement("span");
    span.textContent = task.text;
    span.addEventListener("click", () => {
      li.classList.toggle("completed");
      task.completed = !task.completed;
      updateStorage();
      updateProgress();
    });
    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.classList.add("deleteBtn");
    delBtn.addEventListener("click", () => {
      li.remove();
      deleteTask(task);
      updateProgress();
    });
    li.appendChild(span);
    li.appendChild(delBtn);
    taskList.appendChild(li);
  }
  function updateProgress() {
    const tasks = document.querySelectorAll("#taskList li");
    const completed = document.querySelectorAll("#taskList li.completed");
    const total = tasks.length;
    const percent = total === 0 ? 0 : Math.round((completed.length / total) * 100);
    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
      progressBar.style.width = percent + "%";
      progressBar.textContent = percent + "%";
    }
  }
  function saveTask(task) {
    chrome.storage.local.get(["tasks"], (result) => {
      const tasks = result.tasks ? result.tasks : [];
      tasks.push(task);
      chrome.storage.local.set({ tasks });
    });
  }
  function updateStorage() {
    const tasks = [];
    taskList.querySelectorAll("li").forEach((li) => {
      tasks.push({
        text: li.querySelector("span").textContent,
        completed: li.classList.contains("completed"),
      });
    });
    chrome.storage.local.set({ tasks });
  }
  function deleteTask(taskToDelete) {
    chrome.storage.local.get(["tasks"], (result) => {
      let tasks = result.tasks ? result.tasks : [];
      tasks = tasks.filter((t) => t.text !== taskToDelete.text);
      chrome.storage.local.set({ tasks });
    });
  }
});