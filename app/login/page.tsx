import Link from "next/link";
import { loginUser } from "../actions";
import { SubmitButton } from "../components/SubmitButton"; // <--- Importar

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Bienvenido</h1>
        <p className="text-gray-400 text-center mb-6">Inicia sesión en TaskMaster</p>
        
        <form action={loginUser} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              name="email" 
              className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
              required 
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
            <input 
              type="password" 
              name="password" 
              className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
              required 
            />
          </div>

          
          <SubmitButton 
            text="Entrar" 
            loadingText="Verificando..." 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition mt-4"
          />
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          ¿No tienes cuenta? <Link href="/register" className="text-blue-400 hover:underline">Regístrate</Link>
        </p>
      </div>
    </main>
  );
}