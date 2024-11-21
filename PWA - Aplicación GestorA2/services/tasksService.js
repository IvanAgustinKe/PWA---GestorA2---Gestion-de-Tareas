import {
  TaskDataIncomplete,
  FailedToAddTask,
  TaskIDOrDataNotProvided,
  TaskIDNotProvided,
  ErrorGettingTasks,
  ErrorUpdatingTheTask,
  ErrorDeletingTask,
} from "../constants/constants.js";

const API_URL = "https://673b956896b8dcd5f3f6d8ef.mockapi.io/api/v1/Tasks";

export const getTasks = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`${ErrorGettingTasks}`);
    }
    const tasks = await response.json();

    tasks.forEach((task) => {
      task.fechacreacion = task.fechacreacion || new Date().toISOString();
    });

    tasks.sort((a, b) => {
      if (a.estado === "completada" && b.estado !== "completada") return 1;
      if (a.estado !== "completada" && b.estado === "completada") return -1;
      return new Date(b.fechacreacion) - new Date(a.fechacreacion);
    });

    return tasks;
  } catch (error) {
    console.error(`${ErrorGettingTasks}`, error);
    return [];
  }
};

export const addTask = async (task) => {
  try {
    if (!task.titulo || !task.descripcion || !task.estado) {
      throw new Error(`${TaskDataIncomplete}`);
    }
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error(`${FailedToAddTask}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`${FailedToAddTask}`, error);
    throw error;
  }
};

export const updateTask = async (id, updatedTask) => {
  try {
    if (!id || !updatedTask) {
      throw new Error(`${TaskIDOrDataNotProvided}`);
    }

    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask),
    });
    if (!response.ok) {
      throw new Error(`${ErrorUpdatingTheTask}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`${ErrorUpdatingTheTask}`, error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    if (!id) {
      throw new Error(`${TaskIDNotProvided}`);
    }

    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`${ErrorDeletingTask}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`${ErrorDeletingTask}`, error);
    throw error;
  }
};
