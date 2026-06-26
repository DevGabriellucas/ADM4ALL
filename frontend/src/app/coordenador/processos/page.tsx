import { ProcessesPageContent } from "@/components/coordenador/ProcessesPageContent";
import { getProcesses, getUsers } from "@/services/coordinatorService";

export default async function CoordinatorProcessesPage() {
  const [processes, users] = await Promise.all([getProcesses(), getUsers()]);

  return <ProcessesPageContent processes={processes} users={users} />;
}
