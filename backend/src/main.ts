import "dotenv/config";
import { AlunoUseCase } from "./application/use-cases/AlunoUseCase";
import { AuthUseCase } from "./application/use-cases/AuthUseCase";
import { InstrutorUseCase } from "./application/use-cases/InstrutorUseCase";
import { JwtService } from "./application/security/JwtService";
//import { InMemoryAlunoRepository } from "./infrastructure/database/InMemoryAlunoRepository";
import { pool } from "./infrastructure/database/database";
import { PostgresAlunoRepository } from "./infrastructure/repositories/PostgresAlunoRepository";
import { PostgresAuthRepository } from "./infrastructure/repositories/PostgresAuthRepository";
import { PostgresInstrutorRepository } from "./infrastructure/repositories/PostgresInstrutorRepository";
import { ExpressAdapter } from "./infrastructure/server/ExpressAdapter";

//const alunoRepository = new InMemoryAlunoRepository();
const authRepository = new PostgresAuthRepository(pool);
const alunoRepository = new PostgresAlunoRepository(pool);
const instrutorRepository = new PostgresInstrutorRepository(pool);

const jwtService = new JwtService(
  process.env.JWT_SECRET ?? "adm4all_dev_secret_change_me",
);
const authUseCase = new AuthUseCase(authRepository, jwtService);
const alunoUseCase = new AlunoUseCase(alunoRepository);
const instrutorUseCase = new InstrutorUseCase(instrutorRepository);

const servidor = new ExpressAdapter(authUseCase, alunoUseCase, instrutorUseCase, jwtService);

const porta = Number(process.env.PORT) || 8000;

servidor.iniciar(porta);
