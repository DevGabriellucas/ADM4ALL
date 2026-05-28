export default function Cadastro(){
    return (
        <div className="flex min-h-screen items-center justify-center">
            <form className="flex flex-col gap-4 w-96 p-6 border rounded-lg">
                <h1 className="flex items-center justify-center">Cadastro</h1>
                <input type="text" className="border rounded-lg p-2" placeholder="Nome"/>
                <input type="email" className="border rounded-lg p-2" placeholder="email"/>
                <input type="password" className="border rounded-lg p-2" placeholder="Senha"/>
                <button type="submit" className="border rounded-md p-2 bg-blue-400">Cadastrar</button>
            </form>
        </div>
    );
}