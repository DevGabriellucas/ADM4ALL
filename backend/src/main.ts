import "dotenv/config";
import { AlunoUseCase } from "./application/use-cases/AlunoUseCase";
import { AuthUseCase } from "./application/use-cases/AuthUseCase";
import { CoordenadorUseCase } from "./application/use-cases/CoordenadorUseCase";
import { InstrutorUseCase } from "./application/use-cases/InstrutorUseCase";
import { JwtService } from "./application/security/JwtService";
import { pool } from "./infrastructure/database/database";
import { EmailService } from "./infrastructure/email/EmailService";
import { PostgresAlunoRepository } from "./infrastructure/repositories/PostgresAlunoRepository";
import { PostgresAuthRepository } from "./infrastructure/repositories/PostgresAuthRepository";
import { PostgresCoordenadorRepository } from "./infrastructure/repositories/PostgresCoordenadorRepository";
import { PostgresInstrutorRepository } from "./infrastructure/repositories/PostgresInstrutorRepository";
import { ExpressAdapter } from "./infrastructure/server/ExpressAdapter";

const authRepository = new PostgresAuthRepository(pool);
const alunoRepository = new PostgresAlunoRepository(pool);
const instrutorRepository = new PostgresInstrutorRepository(pool);
const coordenadorRepository = new PostgresCoordenadorRepository(pool);

const jwtService = new JwtService(
  process.env.JWT_SECRET ?? "adm4all_dev_secret_change_me",
);
const emailService = new EmailService(
  process.env.GMAIL_USER ?? process.env.EMAIL_USER ?? "",
  process.env.GMAIL_APP_PASSWORD ?? process.env.EMAIL_PASS ?? "",
  process.env.EMAIL_HOST,
  process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined,
);

const authUseCase = new AuthUseCase(authRepository, jwtService);
const alunoUseCase = new AlunoUseCase(alunoRepository, emailService);
const instrutorUseCase = new InstrutorUseCase(instrutorRepository);
const coordenadorUseCase = new CoordenadorUseCase(coordenadorRepository, emailService);

const servidor = new ExpressAdapter(
  authUseCase,
  alunoUseCase,
  instrutorUseCase,
  coordenadorUseCase,
  jwtService,
);

const porta = Number(process.env.PORT) || 8000;

servidor.iniciar(porta);
