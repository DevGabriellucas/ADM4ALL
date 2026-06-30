"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";

import {
  type CadastroFormData,
  cadastroFormDataSchema,
} from "@/schemas/cadastroSchema";

export default function Cadastro() {
  const [checkbox, setCheckbox] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroFormDataSchema),
  });

  const cadastroSubmit = async (data: CadastroFormData) => {
    try {
      const response = await fetch("http://localhost:8000/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.erro || "Erro ao realizar o cadastro.");
      }

      alert(`🎉 Sucesso: ${result.mensagem}`);
      reset();
    } catch (error: any) {
      alert(`❌ Falha no Cadastro: ${error.message}`);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-y-16 bg-linear-to-bl from-brand-dark/90 via-brand-medium/90 to-brand-light/90 p-4 font-poppins">
      <h1 className="font-medium text-3xl tracking-[10%] xl:text-4xl">
        Cadastro
      </h1>

      <form
        onSubmit={handleSubmit(cadastroSubmit)}
        className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-[#9FA3C7E5]/60 px-6 py-9"
      >
        <Input
          type="text"
          className="rounded-lg p-2"
          placeholder="Nome"
          {...register("nome")}
          error={errors.nome?.message}
        />
        <Input
          type="text"
          className="rounded-lg p-2"
          placeholder="CPF"
          {...register("cpf")}
          error={errors.cpf?.message}
        />
        <Input
          type="tel"
          className="rounded-lg p-2"
          placeholder="Telefone"
          {...register("telefone")}
          error={errors.telefone?.message}
        />
        <Input
          type="date"
          className="rounded-lg p-2"
          max={new Date().toISOString().slice(0, 10)}
          {...register("dataNascimento")}
          error={errors.dataNascimento?.message}
        />
        <Input
          type="email"
          className="rounded-lg p-2 autofill:shadow-[inset_0_0_01000px#B6AEAE]"
          placeholder="email"
          {...register("email")}
          error={errors.email?.message}
        />
        <Input
          type="password"
          className="rounded-lg p-2"
          placeholder="Senha"
          {...register("senha")}
          error={errors.senha?.message}
        />
        <Input
          type="password"
          className="rounded-lg p-2"
          placeholder="Confirmar Senha"
          {...register("confirmarSenha")}
          error={errors.confirmarSenha?.message}
        />

        <div className="flex items-center gap-3">
          <Input
            type="checkbox"
            checked={checkbox}
            {...register("isAlunoUnipe")}
            onChange={() => setCheckbox(!checkbox)}
          />
          <label>Aluno da UNIPÊ</label>
        </div>

        {checkbox && (
          <div className="flex flex-col gap-4">
            <Input
              type="number"
              className="rounded-lg p-2"
              placeholder="RGM"
              {...register("rgm")}
              error={errors.rgm?.message}
            />

            <Select
              className="w-full max-w-full rounded-lg p-2"
              {...register("cursoUnipe")}
            >
              <option value="ADM">ADM</option>
              <option value="ADS">ADS</option>
              <option value="CC">Ciência da Computação</option>
            </Select>
          </div>
        )}

        <label htmlFor="treinamento">Selecione o treinamento:</label>
        <Select
          id="treinamento"
          className="w-full max-w-full rounded-lg p-2"
          {...register("treinamento")}
        >
          <option value="RH">Gestão de RH</option>
          <option value="Emp">Empreendedorismo</option>
        </Select>

        <Button
          type="submit"
          className="bg-brand-dark p-2 rounded-lg hover:brightness-110"
        >
          Cadastrar
        </Button>

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
