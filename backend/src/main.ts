import "dotenv/config";
import { AlunoUseCase } from "./application/use-cases/AlunoUseCase";
import { AuthUseCase } from "./application/use-cases/AuthUseCase";
import { ActivationUseCase } from "./application/use-cases/ActivationUseCase";
import { ConfiguracoesUseCase } from "./application/use-cases/ConfiguracoesUseCase";
import { CoordenadorUseCase } from "./application/use-cases/CoordenadorUseCase";
import { InstrutorUseCase } from "./application/use-cases/InstrutorUseCase";
import { JwtService } from "./application/security/JwtService";
import { pool } from "./infrastructure/database/database";
import { getRequiredEnv } from "./infrastructure/config/env";
import { EmailService } from "./infrastructure/email/EmailService";
import { PostgresAlunoRepository } from "./infrastructure/repositories/PostgresAlunoRepository";
import { PostgresActivationRepository } from "./infrastructure/repositories/PostgresActivationRepository";
import { PostgresAuthRepository } from "./infrastructure/repositories/PostgresAuthRepository";
import { PostgresConfiguracoeRepository } from "./infrastructure/repositories/PostgresConfiguracoeRepository";
import { PostgresCoordenadorRepository } from "./infrastructure/repositories/PostgresCoordenadorRepository";
import { PostgresInstrutorRepository } from "./infrastructure/repositories/PostgresInstrutorRepository";
import { ExpressAdapter } from "./infrastructure/server/ExpressAdapter";

const authRepository = new PostgresAuthRepository(pool);
const activationRepository = new PostgresActivationRepository(pool);
const alunoRepository = new PostgresAlunoRepository(pool);
const instrutorRepository = new PostgresInstrutorRepository(pool);
const coordenadorRepository = new PostgresCoordenadorRepository(pool);
const configuracoeRepository = new PostgresConfiguracoeRepository(pool);
const emailHost = process.env.EMAIL_HOST?.trim() || undefined;
const emailPort = process.env.EMAIL_PORT?.trim()
  ? Number(process.env.EMAIL_PORT)
  : undefined;
const emailUser =
  process.env.GMAIL_USER?.trim() || process.env.EMAIL_USER?.trim() || "";
const emailPassword =
  process.env.GMAIL_APP_PASSWORD?.trim() || process.env.EMAIL_PASS?.trim() || "";

const jwtService = new JwtService(getRequiredEnv("JWT_SECRET"));
const emailService = new EmailService(
  emailUser,
  emailPassword,
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
const configuracoeUseCase = new ConfiguracoesUseCase(configuracoeRepository);

const servidor = new ExpressAdapter(
  authUseCase,
  activationUseCase,
  alunoUseCase,
  instrutorUseCase,
  coordenadorUseCase,
  configuracoeUseCase,
  jwtService,
);

const porta = Number(process.env.PORT) || 8000;

servidor.iniciar(porta);
