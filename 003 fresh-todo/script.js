document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');
    const dateDisplay = document.getElementById('date-display');
    const countDisplay = document.getElementById('count-display');
    const clearDoneBtn = document.getElementById('clear-done');

    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateDisplay.textContent = new Date().toLocaleDateString('ru-RU', options);

    const defaultTasks = [
        { id: 1, text: 'Сделать одну важную задачу', completed: false },
        { id: 2, text: 'Запланировать следующий шаг', completed: false }
    ];

    const storedTasks = localStorage.getItem('fresh-todo-tasks');
    let tasks = storedTasks ? JSON.parse(storedTasks) : defaultTasks;

    function saveTasks() {
        localStorage.setItem('fresh-todo-tasks', JSON.stringify(tasks));
        updateCount();
        checkEmptyState();
    }

    function updateCount() {
        const total = tasks.length;
        const done = tasks.filter(task => task.completed).length;
        countDisplay.textContent = total === 0 ? '0 задач' : `${done}/${total} выполнено`;
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
        tasks.forEach(task => createTaskElement(task));
        updateCount();
        checkEmptyState();
    }

    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(task.id));

        const text = document.createElement('span');
        text.className = 'task-text';
        text.textContent = task.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.setAttribute('aria-label', 'Удалить задачу');
        deleteBtn.textContent = '✕';
        deleteBtn.addEventListener('click', () => deleteTask(task.id, li));

        li.appendChild(checkbox);
        li.appendChild(text);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };

        tasks.push(newTask);
        createTaskElement(newTask);
        saveTasks();
        taskInput.value = '';
        todoList.scrollTop = todoList.scrollHeight;
    }

    function toggleTask(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();

        const el = document.querySelector(`li[data-id=\"${id}\"]`);
        if (el) {
            el.classList.toggle('completed');
        }
    }

    function deleteTask(id, element) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(12px)';
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== id);
            renderTasks();
            saveTasks();
        }, 200);
    }

    function clearDone() {
        tasks = tasks.filter(task => !task.completed);
        renderTasks();
        saveTasks();
    }

    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') addTask();
    });
    clearDoneBtn.addEventListener('click', clearDone);

    renderTasks();
});
