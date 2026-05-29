'use client'

import { useState } from "react";

export default function Cadastro(){

    const[checkbox,setCheckbox] =useState(true)

    return (
        <div className="flex min-h-screen items-center justify-center">
            <form className="flex flex-col gap-4 w-96 p-6 border rounded-lg mt-5 mb-5 shadow-md">
                <h1 className="flex items-center justify-center">Cadastro</h1>
                <input type="text" className="border rounded-lg p-2" placeholder="Nome"/>
                <input type="text" className="border rounded-lg p-2" placeholder="CPF"/>
                <input type="number" className="border rounded-lg p-2" placeholder="Telefone: (83) 91234-1234"/>
                <input type="date" className="border rounded-lg p-2"/>
                <input type="email" className="border rounded-lg p-2" placeholder="email"/>
                <input type="password" className="border rounded-lg p-2" placeholder="Senha"/>
        
                <div className="flex flex-col">
                    <label>Aluno da UNIPÊ</label>
                    <input type="checkbox" checked={checkbox} onChange={() => setCheckbox(!checkbox)}/>
                </div>
                    
                {checkbox && (
                    <div className="flex flex-col gap-4">
                        <input type="number" className="border rounded-lg p-2" placeholder="RGM"/>
                        <select className="border rounded-lg p-2">
                            <option value="Administração">Administração</option>
                            <option value="Análise e Desenvolvimento de Sistemas">Análise e Desenvolvimento de Sistemas</option>
                            <option value="Ciência da Computação">Ciência da Computação</option>
                        </select>
                        </div>
                )}
                    
                <label htmlFor="">Selecione o curso:</label>
                <select className="border rounded-lg p-2">
                    <option value="">Selecione</option>
                    <option value="">Gestão de RH</option>
                    <option value="">Empreendedorismo</option>
                </select>

                <button type="submit" className="border rounded-md p-2 bg-blue-400">Cadastrar</button>

            </form>
        </div>
    );
}