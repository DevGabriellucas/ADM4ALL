import { CertificatesPageContent } from "@/components/coordenador/CertificatesPageContent";
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
    <CertificatesPageContent
      certificates={certificates}
      courses={courses}
      classes={classes}
    />
  );
}
