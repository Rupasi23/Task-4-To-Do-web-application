document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task-input');
    const addTaskButton = document.getElementById('add-task-button');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter-button');
    const themeToggle = document.getElementById('theme-toggle');
    const dateDisplay = document.querySelector('.date-display');

    let tasks = []; // Array to store tasks
    let currentFilter = 'all';

    // Function to display the current date
    function updateDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = now.toLocaleDateString(undefined, options);
    }

    // Initial date display
    updateDate();

    // Update date every minute
    setInterval(updateDate, 60000);

    // Load tasks from localStorage
    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
            renderTasks();
        }
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Function to render tasks based on the current filter
    function renderTasks() {
        taskList.innerHTML = ''; // Clear the list

        let filteredTasks = [...tasks]; // Create a copy to avoid modifying the original array

        if (currentFilter === 'active') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        }

        // Sort tasks: incomplete on top, completed at the bottom (only for "All" filter)
        if (currentFilter === 'all') {
            filteredTasks.sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);
        }

        filteredTasks.forEach(task => {
            const listItem = createTaskElement(task);
            taskList.appendChild(listItem);
        });
    }

    // Function to create a task list item
    function createTaskElement(task) {
        const listItem = document.createElement('li');
        listItem.classList.add('task-item');
        if (task.completed) {
            listItem.classList.add('completed');
        }

        listItem.innerHTML = `
            <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''}>
            <label for="task-${task.id}" class="task-text" contenteditable="false">${task.text}</label>
            <button class="delete-button" aria-label="Delete task"><i class="fas fa-trash"></i></button>
        `;

        const checkbox = listItem.querySelector('input[type="checkbox"]');
        const taskText = listItem.querySelector('.task-text');
        const deleteButton = listItem.querySelector('.delete-button');

        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            listItem.classList.toggle('completed', task.completed);
            saveTasks();
            renderTasks(); // Re-render to update sorting in "All" view
        });

        taskText.addEventListener('click', () => {
            taskText.contentEditable = true;
            taskText.focus();
        });

        taskText.addEventListener('blur', () => {
            taskText.contentEditable = false;
            task.text = taskText.textContent;
            saveTasks();
        });

        deleteButton.addEventListener('click', () => {
            // Add fade-out animation before removing the task
            listItem.style.transition = 'opacity 0.3s';
            listItem.style.opacity = '0';
            setTimeout(() => {
                tasks = tasks.filter(t => t.id !== task.id);
                listItem.remove();
                saveTasks();
                renderTasks();
            }, 300); // Wait for the animation to complete
        });

        return listItem;
    }

    // Function to add a new task with animation
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            const newTask = {
                id: Date.now(),
                text: taskText,
                completed: false
            };
            tasks.push(newTask);
            saveTasks();

            // Create task element
            const listItem = createTaskElement(newTask);

            // Initially hide the task item
            listItem.style.opacity = '0';
            listItem.style.transform = 'translateY(-20px)'; // Move it slightly up

            taskList.appendChild(listItem);

            // Animate the task item
            setTimeout(() => {
                listItem.style.transition = 'opacity 0.3s, transform 0.3s';
                listItem.style.opacity = '1';
                listItem.style.transform = 'translateY(0)';
            }, 10); // Small delay to ensure the element is added to the DOM

            taskInput.value = '';
        }
    }

    // Event listener for adding a task
    addTaskButton.addEventListener('click', addTask);
    taskInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // Event listeners for filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            renderTasks();
        });
    });

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme); // Store theme preference
    });

    // Load theme from localStorage
    function loadTheme() {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            document.documentElement.setAttribute('data-theme', storedTheme);
        } else {
            document.documentElement.setAttribute('data-theme', 'light'); // Default theme
        }
    }

    // Initialize
    loadTheme();
    loadTasks();
});
