import { SettingsPageContent } from "@/components/coordenador/SettingsPageContent";
import { BackButton } from "@/components/shared/BackButton";
import { getCoordinatorSettings } from "@/services/coordinatorService";

export default async function CoordinatorSettingsPage() {
  const settings = await getCoordinatorSettings();

  return (
    <>
      <BackButton className="mb-4" />
      <SettingsPageContent settings={settings} />
    </>
  );
}
