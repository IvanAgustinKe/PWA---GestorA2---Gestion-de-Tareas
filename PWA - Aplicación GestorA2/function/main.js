import { getTasks, addTask, updateTask } from "../services/tasksService.js";
import { renderTasks } from "../components/taskList.js";
import {
  TheSelectedTaskWasNotFound,
  ThereWasAnErrorUpdatingTheTaskPleaseTryAgain,
  ErrorGettingTasks,
  ErrorSavingTask,
  ThereWasAnErrorSavingTheTaskPleaseTryAgain,
  PleaseFillOutAllRequiredFields,
  ErrorLoadingTasks,
  ErrorUpdatingTheTask,
} from "../constants/constants.js";

const taskList = document.getElementById("task-list");
const addTaskButton = document.getElementById("add-task");
const taskDialog = document.getElementById("task-dialog");
const taskForm = document.getElementById("task-form");
const cancelTaskButton = document.getElementById("cancel-task");
const menuToggleButton = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const mainContent = document.querySelector("main");

const closeMenuButton = document.getElementById("close-menu");

const menuCreateTask = document.getElementById("menu-create-task");
const menuChangeStatus = document.getElementById("menu-change-status");
const menuConfig = document.getElementById("menu-config");

const changeStatusDialog = document.getElementById("change-status-dialog");
const changeStatusForm = document.getElementById("change-status-form");
const cancelStatusButton = document.getElementById("cancel-status");
const taskSelect = document.getElementById("task-select");
const newStatusSelect = document.getElementById("new-status");

if (typeof HTMLDialogElement === "undefined" || !("showModal" in taskDialog)) {
  dialogPolyfill.registerDialog(taskDialog);
  dialogPolyfill.registerDialog(changeStatusDialog);
}

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const tasks = await getTasks();
    renderTasks(taskList, tasks);
  } catch (error) {
    console.error(`${ErrorLoadingTasks}`, error);
  }
});

menuToggleButton.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  mainContent.classList.toggle("shift");
});

closeMenuButton.addEventListener("click", () => {
  sidebar.classList.remove("open");
  mainContent.classList.remove("shift");
});

sidebar.addEventListener("click", (event) => {
  if (event.target.tagName === "A") {
    sidebar.classList.remove("open");
    mainContent.classList.remove("shift");
  }
});

menuCreateTask.addEventListener("click", () => {
  taskForm.reset();
  taskForm.removeAttribute("data-editing");
  document.getElementById("task-dialog-title").textContent = "Nueva Tarea";
  taskDialog.showModal();
});

addTaskButton.addEventListener("click", () => {
  taskForm.reset();
  taskForm.removeAttribute("data-editing");
  document.getElementById("task-dialog-title").textContent = "Nueva Tarea";
  taskDialog.showModal();
});

cancelTaskButton.addEventListener("click", () => {
  taskForm.reset();
  taskForm.removeAttribute("data-editing");
  taskDialog.close();
});

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const taskTitle = document.getElementById("task-title").value.trim();
  const taskDetail = document.getElementById("task-detail").value.trim();
  const taskStatus = document.getElementById("task-status").value;

  if (!taskTitle || !taskDetail) {
    alert(`${PleaseFillOutAllRequiredFields}`);
    return;
  }

  const taskData = {
    titulo: taskTitle,
    descripcion: taskDetail,
    estado: taskStatus,
  };

  const taskId = taskForm.getAttribute("data-editing");

  try {
    if (taskId) {
      if (taskStatus === "completada") {
        taskData.fechafinalizacion = new Date().toISOString();
      } else {
        delete taskData.fechafinalizacion;
      }
      await updateTask(taskId, taskData);
      taskForm.removeAttribute("data-editing");
    } else {
      taskData.fechacreacion = new Date().toISOString();
      await addTask(taskData);
    }

    const tasks = await getTasks();
    renderTasks(taskList, tasks);
    taskDialog.close();
    taskForm.reset();
  } catch (error) {
    console.error(`${ErrorSavingTask}`, error);
    alert(`${ThereWasAnErrorSavingTheTaskPleaseTryAgain}`);
  }
});

menuConfig.addEventListener("click", () => {
  const configDialog = document.getElementById("config-dialog");
  configDialog.showModal();
});

menuChangeStatus.addEventListener("click", async () => {
  try {
    const tasks = await getTasks();
    taskSelect.innerHTML = "";
    tasks.forEach((task) => {
      const option = document.createElement("option");
      option.value = task.id;
      option.textContent = `${task.titulo} (${task.estado})`;
      taskSelect.appendChild(option);
    });
    changeStatusDialog.showModal();
  } catch (error) {
    console.error(`${ErrorGettingTasks}`, error);
  }
});

cancelStatusButton.addEventListener("click", () => {
  changeStatusDialog.close();
});

changeStatusForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const taskId = taskSelect.value;
  const nuevoEstado = newStatusSelect.value;

  try {
    const tasks = await getTasks();
    const task = tasks.find((t) => t.id === taskId);

    if (task) {
      const updatedTask = { ...task, estado: nuevoEstado };
      if (nuevoEstado === "completada") {
        updatedTask.fechafinalizacion = new Date().toISOString();
      } else {
        delete updatedTask.fechafinalizacion;
      }

      await updateTask(taskId, updatedTask);
      const updatedTasks = await getTasks();
      renderTasks(taskList, updatedTasks);
      changeStatusDialog.close();
    } else {
      alert(`${TheSelectedTaskWasNotFound}`);
    }
  } catch (error) {
    console.error(`${ErrorUpdatingTheTask}`, error);
    alert(`${ThereWasAnErrorUpdatingTheTaskPleaseTryAgain}`);
  }
});
