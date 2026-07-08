import "dotenv/config";
import { AlunoUseCase } from "./application/use-cases/AlunoUseCase";
import { AuthUseCase } from "./application/use-cases/AuthUseCase";
import { ActivationUseCase } from "./application/use-cases/ActivationUseCase";
import { CoordenadorUseCase } from "./application/use-cases/CoordenadorUseCase";
import { InstrutorUseCase } from "./application/use-cases/InstrutorUseCase";
import { JwtService } from "./application/security/JwtService";
import { pool } from "./infrastructure/database/database";
import {
  getFirstAvailableEnv,
  getRequiredEnv,
} from "./infrastructure/config/env";
import { EmailService } from "./infrastructure/email/EmailService";
import { PostgresAlunoRepository } from "./infrastructure/repositories/PostgresAlunoRepository";
import { PostgresActivationRepository } from "./infrastructure/repositories/PostgresActivationRepository";
import { PostgresAuthRepository } from "./infrastructure/repositories/PostgresAuthRepository";
import { PostgresCoordenadorRepository } from "./infrastructure/repositories/PostgresCoordenadorRepository";
import { PostgresInstrutorRepository } from "./infrastructure/repositories/PostgresInstrutorRepository";
import { ExpressAdapter } from "./infrastructure/server/ExpressAdapter";

const authRepository = new PostgresAuthRepository(pool);
const activationRepository = new PostgresActivationRepository(pool);
const alunoRepository = new PostgresAlunoRepository(pool);
const instrutorRepository = new PostgresInstrutorRepository(pool);
const coordenadorRepository = new PostgresCoordenadorRepository(pool);
const emailHost = process.env.EMAIL_HOST?.trim() || undefined;
const emailPort = process.env.EMAIL_PORT?.trim()
  ? Number(process.env.EMAIL_PORT)
  : undefined;

const jwtService = new JwtService(getRequiredEnv("JWT_SECRET"));
const emailService = new EmailService(
  getFirstAvailableEnv("GMAIL_USER", "EMAIL_USER"),
  getFirstAvailableEnv("GMAIL_APP_PASSWORD", "EMAIL_PASS"),
  emailHost,
  emailPort,
  process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== "false",
);

const authUseCase = new AuthUseCase(authRepository, jwtService);
const activationUseCase = new ActivationUseCase(activationRepository);
const alunoUseCase = new AlunoUseCase(
  alunoRepository,
  emailService,
  activationUseCase,
);
const instrutorUseCase = new InstrutorUseCase(instrutorRepository, emailService);
const coordenadorUseCase = new CoordenadorUseCase(
  coordenadorRepository,
  emailService,
  activationUseCase,
);

const servidor = new ExpressAdapter(
  authUseCase,
  activationUseCase,
  alunoUseCase,
  instrutorUseCase,
  coordenadorUseCase,
  jwtService,
);

const porta = Number(process.env.PORT) || 8000;

servidor.iniciar(porta);
