import { CertificatesPageContent } from "@/components/coordenador/CertificatesPageContent";
import { BackButton } from "@/components/shared/BackButton";
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
    <>
      <BackButton className="mb-4" />
      <CertificatesPageContent
        certificates={certificates}
        courses={courses}
        classes={classes}
      />
    </>
  );
}
