import { ProcessesPageContent } from "@/components/coordenador/ProcessesPageContent";
import { BackButton } from "@/components/shared/BackButton";
import { getProcesses, getUsers } from "@/services/coordinatorService";

export default async function CoordinatorProcessesPage() {
  const [processes, users] = await Promise.all([getProcesses(), getUsers()]);

  return (
    <>
      <BackButton className="mb-4" />
      <ProcessesPageContent processes={processes} users={users} />
    </>
  );
}
