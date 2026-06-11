'use client'

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import {Select} from "@/components/Select"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  cadastroFormDataSchema,
  type CadastroFormData
} from "@/schemas/cadastroSchema";

export default function Cadastro(){

    const[checkbox,setCheckbox] =useState(true) //Se o checkbox constar marcado aparece os inputs internos, else nao aparece

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<CadastroFormData>({
        resolver: zodResolver(cadastroFormDataSchema)
    });

    const cadastroSubmit = (data: CadastroFormData) => {
        console.log(data);
    };

    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center gap-y-16 bg-linear-to-bl from-brand-dark/90 via-brand-medium/90 to-brand-light/90 p-4 font-poppins xl:flex-row xl:gap-x-20 xl:gap-y-0">
            <h1 className="flex items-center justify-center text-2xl font-bold">Cadastro</h1>
                <form onSubmit={handleSubmit(cadastroSubmit)} 
                    className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-[#9FA3C7E5]/60 px-6 py-9">
                <Input type="text" className="rounded-lg p-2" placeholder="Nome" {...register("nome")} error={errors.nome?.message}/>
                <Input type="text" className="rounded-lg p-2" placeholder="CPF" {...register("cpf")}error={errors.cpf?.message}/>
                <Input type="tel" className="rounded-lg p-2" placeholder="Telefone" {...register("telefone")} error={errors.telefone?.message}/>
                <Input type="date" className="rounded-lg p-2" {...register("dataNascimento")}/>
                <Input type="email" className="rounded-lg p-2" placeholder="email" {...register("email")} error={errors.email?.message}/>
                <Input type="password" className="rounded-lg p-2" placeholder="Senha"/>
        
                <div className="flex items-center gap-3">
                    <Input type="checkbox" checked={checkbox} {...register("isAlunoUnipe")} onChange={() => setCheckbox(!checkbox)}/>
                    <label>Aluno da UNIPÊ</label>
                </div>
                    
                {checkbox && (
                    <div className="flex flex-col gap-4">
                        <Input type="number" className="rounded-lg p-2" placeholder="RGM"/>
                        <Select className="w-full max-w-full rounded-lg p-2" {...register("cursoUnipe")}>
                            <option value="ADM">ADM</option>
                            <option value="ADS">ADS</option>
                            <option value="CC">Ciência da Computação</option>
                        </Select>
                    </div>
                )}
                    
                <label htmlFor="">Selecione o treinamento:</label>
                <Select className="w-full max-w-full rounded-lg p-2">
                    <option value="RH">Gestão de RH</option>
                    <option value="Emp">Empreendedorismo</option>
                </Select>

                <Button type="submit" className="bg-brand-dark p-2 rounded-lg hover:brightness-110">Cadastrar</Button>

                <p className="mt-auto pt-6 text-center text-base text-slate-800">
                    Deseja voltar?{" "}
                    <Link
                        href="/"
                        className="font-bold text-[#524ABF] underline underline-offset-2 transition-colors duration-200 hover:brightness-125"
                    >
                        Voltar
                    </Link>
                </p>
            </form>
        </main>
    );
}