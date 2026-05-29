'use client'

import { useState } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function Cadastro(){

    const[checkbox,setCheckbox] =useState(true) //Se o checkbox constar marcado aparece os inputs internos, else nao aparece

    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center gap-y-16 bg-linear-to-bl from-brand-dark/90 via-brand-medium/90 to-brand-light/90 p-4 font-poppins xl:flex-row xl:gap-x-20 xl:gap-y-0">
            <form className="flex flex-col gap-4 w-96 p-6 border rounded-lg mt-5 mb-5 shadow-md">
                <h1 className="flex items-center justify-center">Cadastro</h1>
                <Input type="text" className="border rounded-lg p-2" placeholder="Nome"/>
                <Input type="text" className="border rounded-lg p-2" placeholder="CPF"/>
                <Input type="number" className="border rounded-lg p-2" placeholder="Telefone: (83) 91234-1234"/>
                <Input type="date" className="border rounded-lg p-2"/>
                <Input type="email" className="border rounded-lg p-2" placeholder="email"/>
                <Input type="password" className="border rounded-lg p-2" placeholder="Senha"/>
        
                <div className="flex flex-col">
                    <label>Aluno da UNIPÊ</label>
                    <Input type="checkbox" checked={checkbox} onChange={() => setCheckbox(!checkbox)}/>
                </div>
                    
                {checkbox && (
                    <div className="flex flex-col gap-4">
                        <Input type="number" className="border rounded-lg p-2" placeholder="RGM"/>
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

                <Button type="submit" className="bg-brand-dark text-white p-2 rounded-lg">Cadastrar</Button>

            </form>
        </main>
    );
}