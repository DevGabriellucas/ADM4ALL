import { CoordinatorLayout } from "@/components/coordenador/CoordinatorLayout";
import { SettingsPageContent } from "@/components/coordenador/SettingsPageContent";
import { getCoordinatorSettings } from "@/services/coordinatorService";

export default async function CoordinatorSettingsPage() {
  const settings = await getCoordinatorSettings();

  return (
    <CoordinatorLayout>
      <SettingsPageContent settings={settings} />
    </CoordinatorLayout>
  );
}
