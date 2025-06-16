// Redirect if not logged in
const token = localStorage.getItem('token');
const username = localStorage.getItem('username');
if (!token || !username) {
  window.location.href = 'index.html';
}

// Logout
document.getElementById('logoutButton').addEventListener('click', function() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = 'index.html';
});

// Fetch and render tasks
const taskList = document.getElementById('taskList');
async function fetchTasks() {
  const res = await fetch(`http://localhost:3000/api/tasks/${username}`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.textContent = task.text;
    li.className = task.completed ? 'completed' : '';
    li.dataset.id = task._id;

    // Toggle complete
    li.addEventListener('click', () => toggleTask(task._id));

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(task._id);
    });

    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

// Add task
document.getElementById('taskForm').addEventListener('submit', async function(event) {
  event.preventDefault();
  const text = document.getElementById('taskInput').value.trim();
  if (!text) return;
  await fetch('http://localhost:3000/api/tasks', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });
  document.getElementById('taskInput').value = '';
  fetchTasks();
});

// Toggle task
async function toggleTask(id) {
  await fetch(`http://localhost:3000/api/tasks/${id}/toggle`, {
    method: 'PUT',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  fetchTasks();
}

// Delete task
async function deleteTask(id) {
  await fetch(`http://localhost:3000/api/tasks/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  fetchTasks();
}

// Initial load
fetchTasks();
