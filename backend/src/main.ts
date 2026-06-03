import { AlunoUseCase } from "./application/use-cases/AlunoUseCase";
import { InMemoryAlunoRepository } from "./infrastructure/database/InMemoryAlunoRepository";
import { ExpressAdapter } from "./infrastructure/server/ExpressAdapter";

const alunoRepository = new InMemoryAlunoRepository();

const alunoUseCase = new AlunoUseCase(alunoRepository);

const servidor = new ExpressAdapter(alunoUseCase);

servidor.iniciar(8000);