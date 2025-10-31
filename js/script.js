// --- 1. DOM SELECTORS ---
const todoForm = document.getElementById('to-do-form');
const todoInput = document.getElementById('to-do-input');
const dateInput = document.getElementById('due-date-input');
const todoList = document.getElementById('to-do-list');
const filterSelect = document.getElementById('task-filter');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const html = document.documentElement;

// --- 2. INITIALIZATION & DATA HANDLING ---
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Fungsi untuk menyimpan data ke Local Storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// --- 3. EVENT LISTENERS ---
todoForm.addEventListener('submit', handleAddTask);
filterSelect.addEventListener('change', renderTasks); // Cukup panggil renderTasks
todoList.addEventListener('click', handleTaskActions);
darkModeToggle.addEventListener('click', toggleDarkMode);

// Event listeners untuk menyimpan hasil edit
todoList.addEventListener('focusout', (e) => {
    if (e.target.classList.contains('edit-input')) saveEdit(e.target.closest('.list-item'));
});
todoList.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('edit-input')) saveEdit(e.target.closest('.list-item'));
});

// --- 4. CORE FUNCTIONS ---

/**
 * Menangani penambahan tugas baru.
 */
function handleAddTask(e) {
    e.preventDefault();
    const taskText = todoInput.value.trim();
    const dueDate = dateInput.value;

    if (validateInputs(taskText, dueDate)) {
        const newTask = { id: Date.now(), text: taskText, date: dueDate, completed: false };
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        
        const lastItem = todoList.querySelector('.list-item:last-child');
        if (lastItem) lastItem.classList.add('new-item');
        
        todoForm.reset();
        todoInput.focus();
    }
}

/**
 * Validasi input form.
 */
function validateInputs(taskText, dueDate) {
    let isValid = true;
    
    if (taskText === '') {
        todoInput.classList.add('error-input');
        isValid = false;
    } else {
        todoInput.classList.remove('error-input');
    }

    const today = new Date().toISOString().split('T')[0];
    if (dueDate === '' || dueDate < today) {
        dateInput.classList.add('error-input');
        isValid = false;
    } else {
        dateInput.classList.remove('error-input');
    }

    return isValid;
}

/**
 * Menangani aksi pada item tugas (edit, complete, delete).
 */
function handleTaskActions(e) {
    const target = e.target;
    const listItem = target.closest('.list-item');
    if (!listItem) return;

    const taskId = parseInt(listItem.dataset.id);
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;

    if (target.classList.contains('edit-btn')) {
        listItem.classList.add('editing');
        const textSpan = listItem.querySelector('.task-text');
        const editInput = listItem.querySelector('.edit-input');
        textSpan.style.display = 'none';
        editInput.style.display = 'block';
        editInput.focus();
    } else if (target.classList.contains('check-btn')) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
    } else if (target.classList.contains('delete-btn')) {
        listItem.classList.add('removing');
        setTimeout(() => {
            tasks.splice(taskIndex, 1);
            saveTasks();
            renderTasks();
        }, 300);
    }
}

/**
 * Menyimpan hasil editan.
 */
function saveEdit(listItem) {
    const taskId = parseInt(listItem.dataset.id);
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    const editInput = listItem.querySelector('.edit-input');
    const newText = editInput.value.trim();

    if (taskIndex !== -1 && newText) {
        tasks[taskIndex].text = newText;
        saveTasks();
    }
    renderTasks();
}

/**
 * Merender (menampilkan) semua tugas ke dalam DOM.
 */
function renderTasks() {
    const filterValue = filterSelect.value.toLowerCase();
    let filteredTasks = tasks;

    if (filterValue === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (filterValue === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    }

    todoList.innerHTML = '';

    if (filteredTasks.length === 0) {
        const placeholder = document.createElement('li');
        placeholder.className = 'placeholder-item list-item';
        placeholder.textContent = tasks.length === 0 ? 'No tasks added yet. Add one above!' : 'No tasks match the current filter.';
        todoList.appendChild(placeholder);
        return;
    }

    filteredTasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.className = `list-item ${task.completed ? 'completed' : ''}`;
        listItem.dataset.id = task.id;

        const formattedDate = new Date(task.date + 'T00:00:00').toLocaleDateString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        listItem.innerHTML = `
            <div class="task-info">
                <input type="text" class="edit-input" value="${task.text}" style="display: none;">
                <span class="task-text">${task.text}</span>
                <span class="due-date">Due: ${formattedDate}</span>
            </div>
            <div class="task-actions">
                <button class="action-btn edit-btn" title="Edit Task">✏️</button>
                <button class="action-btn check-btn" title="Mark as Complete">${task.completed ? '✓' : '○'}</button>
                <button class="action-btn delete-btn" title="Delete Task">X</button>
            </div>
        `;
        todoList.appendChild(listItem);
    });
}

// --- 5. DARK MODE ---

/**
 * Mengganti tema antara light dan dark.
 */
function toggleDarkMode() {
    html.classList.toggle('dark');
    const isDarkMode = html.classList.contains('dark');
    darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

/**
 * Memuat tema yang tersimpan saat aplikasi dibuka.
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        html.classList.add('dark');
        darkModeToggle.textContent = '☀️';
    } else {
        html.classList.remove('dark');
        darkModeToggle.textContent = '🌙';
    }
}

// --- INITIAL LOAD ---
loadTheme();
renderTasks();