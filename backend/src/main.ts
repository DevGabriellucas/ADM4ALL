import "dotenv/config";
import { AlunoUseCase } from "./application/use-cases/AlunoUseCase";
//import { InMemoryAlunoRepository } from "./infrastructure/database/InMemoryAlunoRepository";
import { pool } from "./infrastructure/database/database";
import { PostgresAlunoRepository } from "./infrastructure/repositories/PostgresAlunoRepository";
import { ExpressAdapter } from "./infrastructure/server/ExpressAdapter";

//const alunoRepository = new InMemoryAlunoRepository();
const alunoRepository = new PostgresAlunoRepository(pool);

const alunoUseCase = new AlunoUseCase(alunoRepository);

const servidor = new ExpressAdapter(alunoUseCase);

const porta = Number(process.env.PORT) || 8000;

servidor.iniciar(porta);