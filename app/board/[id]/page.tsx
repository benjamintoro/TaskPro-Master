import { prisma } from "../../lib/prisma";
import { createTask, deleteBoard } from "../../actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import BoardDnD from "../../components/BoardDnD";

export default async function BoardPage({ params }: { params: { id: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const boardId = parseInt(resolvedParams.id);

 // En app/board/[id]/page.tsx
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      tasks: {
        orderBy: { createdAt: 'desc' }
        
      }
    },
  });

  if (!board) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="mb-8">
        <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
          &larr; Volver a Tableros
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{board.title}</h1>
          <form action={deleteBoard}>
            <input type="hidden" name="boardId" value={board.id} />
            <button className="text-red-500 hover:text-red-400 text-sm border border-red-900 bg-red-900/20 px-3 py-1 rounded">
              Eliminar Tablero
            </button>
          </form>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
        <h2 className="text-lg font-semibold mb-4">Nueva Tarea</h2>
        <form action={createTask} className="flex gap-2">
          <input type="hidden" name="boardId" value={board.id} />
          <input 
            type="text" 
            name="title" 
            placeholder="¿Qué hay que hacer?" 
            className="flex-1 bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
            required
            autoFocus
          />
          <button 
            type="submit"
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium transition"
          >
            Añadir
          </button>
        </form>
      </div>

      
      <BoardDnD board={board} />
      
    </main>
  );
}