import { CertificatesPageContent } from "@/components/coordenador/CertificatesPageContent";
import { CoordinatorLayout } from "@/components/coordenador/CoordinatorLayout";
import {
  getCertificates,
  getClasses,
  getCourses,
} from "@/services/coordinatorService";

export default async function CoordinatorCertificatesPage() {
  const [certificates, courses, classes] = await Promise.all([
    getCertificates(),
    getCourses(),
    getClasses(),
  ]);

  return (
    <CoordinatorLayout>
      <CertificatesPageContent
        certificates={certificates}
        courses={courses}
        classes={classes}
      />
    </CoordinatorLayout>
  );
}
