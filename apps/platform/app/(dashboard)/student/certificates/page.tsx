import { requireRole } from "@simplilms/auth/server";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@simplilms/ui";
import { Award, Download, ShieldCheck } from "lucide-react";
import {
  getStudentCertificates,
  type CertificateRow,
} from "@simplilms/core/actions/progress";
import { getCourseById, type CourseRow } from "@simplilms/core/actions/courses";

export const metadata = {
  title: "My Certificates",
};

export default async function StudentCertificatesPage() {
  const user = await requireRole(["super_admin", "student"]);

  const certificates = await getStudentCertificates(user.user.id);

  const certificatesWithCourses: Array<{
    certificate: CertificateRow;
    course: CourseRow | null;
  }> = await Promise.all(
    certificates.map(async (certificate) => {
      const course = await getCourseById(certificate.course_id);
      return { certificate, course };
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">My Certificates</h1>
        <p className="text-sm text-muted-foreground">
          View and download your earned certificates.
        </p>
      </div>

      {certificatesWithCourses.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium">No certificates yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Complete a course to earn your first certificate.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {certificatesWithCourses.map(({ certificate, course }) => (
            <Card key={certificate.id} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/60" />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary shrink-0" />
                    <CardTitle className="text-base line-clamp-2">
                      {course?.title || "Course Certificate"}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Certificate No.
                    </span>
                    <span className="font-mono font-medium">
                      {certificate.certificate_number}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Issued</span>
                    <span>
                      {new Date(certificate.issued_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Verification</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 text-[10px] gap-1"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {certificate.verification_code}
                    </Badge>
                  </div>
                </div>

                {certificate.pdf_url && (
                  <a
                    href={certificate.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline mt-2"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
