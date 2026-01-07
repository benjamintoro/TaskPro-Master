'use server'

import { prisma } from "./lib/prisma";
import { revalidatePath } from "next/cache";
import { hash} from 'bcryptjs'
import { compare } from "bcryptjs"; 
import { createSession, deleteSession } from "./lib/session"; 
import { redirect } from "next/navigation"; 
import { getSession } from "./lib/session";

export async function createBoard(formData: FormData) {
  const session = await getSession(); 
  if (!session) return; 

  const title = formData.get("title") as string;
  if (!title || title.trim() === "") return;

  await prisma.board.create({
    data: {
      title: title,
      userId: session.userId, 
    },
  });

  revalidatePath("/");
}

export async function createTask(formData: FormData) {
  const title = formData.get("title") as string;
  const boardId = parseInt(formData.get("boardId") as string);

  if (!title || !boardId) return;

  await prisma.task.create({
    data: {
      title,
      boardId,
    },
  });

  revalidatePath(`/board/${boardId}`);
}

export async function deleteBoard(formData: FormData) {
  const boardId = parseInt(formData.get("boardId") as string);

  await prisma.task.deleteMany({
    where: { boardId },
  });

  await prisma.board.delete({
    where: { id: boardId },
  });

  revalidatePath("/");
}

export async function updateTaskStatus(formData: FormData) {
  const taskId = parseInt(formData.get("taskId") as string);
  const status = formData.get("status") as string;
  const boardId = formData.get("boardId") as string;

  await prisma.task.update({
    where: { id: taskId },
    data: { status },
  });

  revalidatePath(`/board/${boardId}`);
}

export async function deleteTask(formData: FormData) {
  const taskId = parseInt(formData.get("taskId") as string);
  const boardId = formData.get("boardId") as string;

  try {
    await prisma.task.delete({
      where: { id: taskId },
    });
  } catch (error) {

  }

  revalidatePath(`/board/${boardId}`);
}

export async function cyclePriority(formData: FormData) {
  const taskId = parseInt(formData.get("taskId") as string);
  const currentPriority = formData.get("currentPriority") as string;
  const boardId = formData.get("boardId") as string;

  let newPriority = "LOW";
  if (currentPriority === "LOW") newPriority = "MEDIUM";
  else if (currentPriority === "MEDIUM") newPriority = "HIGH";
  
  // Si es HIGH, vuelve a LOW automáticamente

  await prisma.task.update({
    where: { id: taskId },
    data: { priority: newPriority },
  });

  revalidatePath(`/board/${boardId}`);
}

export async function updateTaskContent(formData: FormData) {
  const taskId = parseInt(formData.get("taskId") as string);
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDateStr = formData.get("dueDate") as string;
  const boardId = formData.get("boardId") as string;

  await prisma.task.update({
    where: { id: taskId },
    data: { 
      title,
      description,
      dueDate: dueDateStr ? new Date(dueDateStr) : null
    },
  });

  revalidatePath(`/board/${boardId}`);
}

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || !name) return;


  const hashedPassword = await hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    redirect("/login");
  } catch (error) {
    console.error("Error al registrar:", error);

  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;


  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return;
  }


  const isPasswordValid = await compare(password, user.password);

  if (!isPasswordValid) {
    return;
  }


  await createSession(user.id);


  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}