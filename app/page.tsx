import Link from "next/link";
import { prisma } from "./lib/prisma";
import { createBoard, logout } from "./actions"; 
import { getSession } from "./lib/session";      
import { redirect } from "next/navigation"; 
import { SubmitButton } from "./components/SubmitButton";     

export default async function Home() {
  
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

 
  const boards = await prisma.board.findMany({
    where: {
      userId: session.userId // 
    },
    orderBy: { createdAt: 'desc' },
    include: {
      tasks: {
        select: { status: true }
      }
    }
  });

  const user = await prisma.user.findUnique({ where: { id: session.userId }});

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-blue-500">TaskMaster Pro</h1>
          <p className="text-gray-400">Hola, {user?.name} </p>
        </div>

        <div className="flex gap-4 items-center">
          
            <form action={createBoard} className="flex gap-2">
            <input 
              type="text" 
              name="title" 
              placeholder="Nuevo Tablero..." 
              className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
            
           
            <SubmitButton 
              text="+ Crear" 
              loadingText="..." 
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition min-w-[100px]"
            />
          </form>
        </div>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Mis Tableros</h2>
        
        {boards.length === 0 ? (
          <div className="border-2 border-dashed border-gray-700 rounded-xl p-10 text-center text-gray-500">
            <p>No tienes tableros creados aún.</p>
            <p className="text-sm">¡Crea el primero arriba!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {boards.map((board) => {
              const totalTasks = board.tasks.length;
              const completedTasks = board.tasks.filter(t => t.status === 'DONE').length;
              const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

              return (
                <Link 
                  href={`/board/${board.id}`} 
                  key={board.id} 
                  className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition border border-gray-700 shadow-lg block group hover:border-blue-500 relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition">{board.title}</h3>
                      <span className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded">
                        {new Date(board.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Progreso</span>
                      <span>{progress}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          progress === 100 ? 'bg-green-500' : 'bg-blue-600'
                        }`} 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    <div className="mt-4 text-right">
                      <span className="text-xs text-gray-500">
                        {completedTasks} / {totalTasks} tareas
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}