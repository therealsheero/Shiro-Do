document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskList = document.getElementById("taskList");

  // Load tasks from storage when popup opens
  chrome.storage.local.get(["tasks"], (result) => {
    if (result.tasks) {
      result.tasks.forEach((task) => renderTask(task));
    }
  });

  // Add new task
  addTaskBtn.addEventListener("click", () => {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const task = { text: taskText, completed: false };
    renderTask(task);
    saveTask(task);

    taskInput.value = "";
  });

  // Render a task to the list
  function renderTask(task) {
    const li = document.createElement("li");
    if (task.completed) li.classList.add("completed");

    const span = document.createElement("span");
    span.textContent = task.text;

    // Toggle complete on click
    span.addEventListener("click", () => {
      li.classList.toggle("completed");
      task.completed = !task.completed;
      updateStorage();
    });

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.textContent = "✕";
    delBtn.classList.add("deleteBtn");
    delBtn.addEventListener("click", () => {
      li.remove();
      deleteTask(task);
    });

    li.appendChild(span);
    li.appendChild(delBtn);
    taskList.appendChild(li);
  }

  // Save a new task
  function saveTask(task) {
    chrome.storage.local.get(["tasks"], (result) => {
      const tasks = result.tasks ? result.tasks : [];
      tasks.push(task);
      chrome.storage.local.set({ tasks });
    });
  }

  // Update all tasks (when toggled complete)
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

  // Delete a task
  function deleteTask(taskToDelete) {
    chrome.storage.local.get(["tasks"], (result) => {
      let tasks = result.tasks ? result.tasks : [];
      tasks = tasks.filter((t) => t.text !== taskToDelete.text);
      chrome.storage.local.set({ tasks });
    });
  }
});
