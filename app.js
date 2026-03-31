let tasks = [];
let completed = JSON.parse(localStorage.getItem("completedTasks")) || [];

async function loadTasks() {
  const res = await fetch("data/tasks.json");
  tasks = await res.json();
  renderTasks();
  updateProgress();
}

function renderTasks() {
  const container = document.getElementById("task-container");
  container.innerHTML = "";

  tasks.forEach((task, index) => {
    const div = document.createElement("div");
    div.className = "task";
    if (completed.includes(index)) div.classList.add("completed");

    div.innerHTML = task.title;
    div.onclick = () => toggleTask(index);

    container.appendChild(div);
  });
}

function toggleTask(index) {
  if (completed.includes(index)) {
    completed = completed.filter(i => i !== index);
  } else {
    completed.push(index);
  }
  localStorage.setItem("completedTasks", JSON.stringify(completed));
  renderTasks();
  updateProgress();
}

function updateProgress() {
  const percent = (completed.length / tasks.length) * 100;
  document.getElementById("progress-bar").style.width = percent + "%";
}

loadTasks();
