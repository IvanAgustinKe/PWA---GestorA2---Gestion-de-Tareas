import { deleteTask, updateTask, getTasks } from "../services/tasksService.js";
import {
  AreYouSureYouWantToDeleteThisTask,
  ErrorDeletingTask,
  PleaseEnterNewStatus,
  ErrorUpdatingTask,
  InvalidStatus,
} from "../constants/constants.js";

export const renderTasks = (taskListElement, tasks) => {
  taskListElement.innerHTML = "";

  tasks.sort((a, b) => {
    if (a.estado === "completada" && b.estado !== "completada") return 1;
    if (a.estado !== "completada" && b.estado === "completada") return -1;

    return new Date(b.fechacreacion) - new Date(a.fechacreacion);
  });

  tasks.forEach((task) => {
    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card");
    taskCard.setAttribute("data-id", task.id);
    taskCard.setAttribute("data-status", task.estado);

    if (task.estado === "completada") {
      taskCard.classList.add("completed");
    }

    taskCard.innerHTML = `
            <h3 class="task-title">${task.titulo}</h3>
            <p class="task-date">Creada el: ${new Date(
              task.fechacreacion
            ).toLocaleString()}</p>
            <p class="task-description">${task.descripcion}</p>
        `;

    if (task.estado === "completada" && task.fechafinalizacion) {
      const completionDate = document.createElement("p");
      completionDate.classList.add("task-completion-date");
      completionDate.textContent = `Completada el: ${new Date(
        task.fechafinalizacion
      ).toLocaleString()}`;
      taskCard.appendChild(completionDate);
    }

    const playButton = document.createElement("button");
    playButton.classList.add("play-button", "btn");
    playButton.setAttribute("aria-label", "Reproducir tarea");
    playButton.textContent = "";

    const editButton = document.createElement("button");
    editButton.classList.add("edit-button", "btn");
    editButton.setAttribute("aria-label", "Editar tarea");
    editButton.textContent = "";

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button", "btn");
    deleteButton.setAttribute("aria-label", "Eliminar tarea");
    deleteButton.textContent = "";

    const statusButton = document.createElement("button");
    statusButton.classList.add("status-button", "btn");
    statusButton.setAttribute("aria-label", "Cambiar estado");
    statusButton.textContent = "";

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");
    buttonContainer.appendChild(playButton);
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(statusButton);

    taskCard.appendChild(buttonContainer);

    deleteButton.addEventListener("click", async () => {
      if (confirm(`${AreYouSureYouWantToDeleteThisTask}`)) {
        try {
          await deleteTask(task.id);

          const updatedTasks = await getTasks();
          renderTasks(taskListElement, updatedTasks);
        } catch (error) {
          console.error(`${ErrorDeletingTask}`, error);
        }
      }
    });

    editButton.addEventListener("click", () => openEditDialog(task));

    playButton.addEventListener("click", () => playTaskDescription(task));

    statusButton.addEventListener("click", async () => {
      const estados = ["pendiente", "en progreso", "completada"];
      let nuevoEstado = prompt(
        `${PleaseEnterNewStatus} (${estados.join(", ")}):`,
        task.estado
      );
      if (nuevoEstado && estados.includes(nuevoEstado)) {
        const updatedTask = { ...task, estado: nuevoEstado };
        if (nuevoEstado === "completada" && !task.fechafinalizacion) {
          updatedTask.fechafinalizacion = new Date().toISOString();
        }
        try {
          await updateTask(task.id, updatedTask);

          const updatedTasks = await getTasks();
          renderTasks(taskListElement, updatedTasks);
        } catch (error) {
          console.error(`${ErrorUpdatingTask}`, error);
        }
      } else {
        alert(`${InvalidStatus}`);
      }
    });

    taskListElement.appendChild(taskCard);
  });
};

const openEditDialog = (task) => {
  const taskDialog = document.getElementById("task-dialog");
  const taskForm = document.getElementById("task-form");
  const taskDialogTitle = document.getElementById("task-dialog-title");

  taskDialogTitle.textContent = "Editar tarea";

  document.getElementById("task-title").value = task.titulo;
  document.getElementById("task-detail").value = task.descripcion;
  document.getElementById("task-status").value = task.estado;

  taskForm.setAttribute("data-editing", task.id);
  taskDialog.showModal();
};

const playTaskDescription = (task) => {
  const savedConfig = JSON.parse(localStorage.getItem("speechConfig")) || {
    speed: 1,
  };
  const synth = window.speechSynthesis;
  const utterThis = new SpeechSynthesisUtterance(
    `${task.titulo}. ${task.descripcion}`
  );
  const voices = synth.getVoices();
  if (savedConfig.voice) {
    utterThis.voice = voices.find((voice) => voice.name === savedConfig.voice);
  }
  utterThis.rate = savedConfig.speed;

  const taskCard = document.querySelector(`.task-card[data-id='${task.id}']`);
  if (taskCard) {
    taskCard.classList.add("playing");
  }

  synth.speak(utterThis);

  utterThis.onend = () => {
    if (taskCard) {
      taskCard.classList.remove("playing");
    }
  };
};
