import Link from "next/link";
import { registerUser } from "../actions";
import { SubmitButton } from "../components/SubmitButton";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Crear Cuenta</h1>
        
        <form action={registerUser} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input 
              type="text" 
              name="name" 
              className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
              required 
            />
          </div>
          
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
            text="Registrarse" 
            loadingText="Creando cuenta..." 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition mt-4"
            />
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          ¿Ya tienes cuenta? <Link href="/login" className="text-blue-400 hover:underline">Inicia Sesión</Link>
        </p>
      </div>
    </main>
  );
}