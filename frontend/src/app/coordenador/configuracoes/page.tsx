import { SettingsPageContent } from "@/components/coordenador/SettingsPageContent";
import { getCoordinatorSettings } from "@/services/coordinatorService";

export default async function CoordinatorSettingsPage() {
  const settings = await getCoordinatorSettings();

  return <SettingsPageContent settings={settings} />;
}
