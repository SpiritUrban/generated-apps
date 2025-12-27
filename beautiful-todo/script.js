document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');
    const dateDisplay = document.getElementById('date-display');

    // Set Date
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);

    // Default Tasks if empty
    const defaultTasks = [
        { id: 1, text: "Welcome to your new To-Do list", completed: false },
        { id: 2, text: "Try adding a new task above", completed: false },
        { id: 3, text: "Hover over me to see delete option", completed: true }
    ];

    // Load tasks
    let tasks = JSON.parse(localStorage.getItem('beautiful-todo-tasks')) || defaultTasks;

    function saveTasks() {
        localStorage.setItem('beautiful-todo-tasks', JSON.stringify(tasks));
        checkEmptyState();
    }

    function checkEmptyState() {
        if (tasks.length === 0) {
            emptyState.classList.add('visible');
        } else {
            emptyState.classList.remove('visible');
        }
    }

    function renderTasks() {
        todoList.innerHTML = '';
        tasks.forEach(task => {
            createTaskElement(task);
        });
        checkEmptyState();
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'checkbox-wrapper';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(task.id));

        checkboxWrapper.appendChild(checkbox);

        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = task.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        deleteBtn.addEventListener('click', () => deleteTask(task.id, li));

        li.appendChild(checkboxWrapper);
        li.appendChild(span);
        li.appendChild(deleteBtn);

        // Prepend for "newest first" visual feel, or append. Let's append to match array order.
        todoList.appendChild(li);
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') return;

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };

        tasks.push(newTask); // Add to end
        createTaskElement(newTask);
        saveTasks();
        taskInput.value = '';
        
        // Scroll to bottom (since we appended)
        todoList.scrollTop = todoList.scrollHeight;
    }

    function toggleTask(id) {
        tasks = tasks.map(t => {
            if (t.id === id) {
                return { ...t, completed: !t.completed };
            }
            return t;
        });
        saveTasks();
        
        // Update DOM class without full re-render for performance/animation
        const el = document.querySelector(`li[data-id="${id}"]`);
        if (el) {
            el.classList.toggle('completed');
        }
    }

    function deleteTask(id, element) {
        // Animate removal
        element.style.transform = 'translateX(20px)';
        element.style.opacity = '0';
        
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks(); // Full re-render to ensure clean state
        }, 300);
    }

    // Event Listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Initial Render
    renderTasks();
});
