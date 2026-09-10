"use client";

import { useState, useTransition } from "react";
import { Badge, Button, Card, Input } from "@simplilms/ui";
import { Award, Search, Trash2 } from "lucide-react";
import type { CertificateRow } from "@simplilms/core/actions/certificates";

interface CertificateListClientProps {
  certificates: CertificateRow[];
  onRevoke: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function CertificateListClient({
  certificates,
  onRevoke,
}: CertificateListClientProps) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [revoking, setRevoking] = useState<string | null>(null);

  const filtered = certificates.filter(
    (c) =>
      (c.student_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.course_title || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.certificate_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.verification_code || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleRevoke = (id: string) => {
    if (!confirm("Are you sure you want to revoke this certificate? This cannot be undone.")) return;
    setRevoking(id);
    startTransition(async () => {
      await onRevoke(id);
      setRevoking(null);
    });
  };

  return (
    <>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by student, course, or certificate number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <Award className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {search ? "No certificates match your search." : "No certificates issued yet."}
          </p>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                    Certificate #
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                    Student
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                    Course
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                    Verification Code
                  </th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                    Issued
                  </th>
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((cert) => (
                  <tr key={cert.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <Badge variant="outline" className="font-mono text-xs">
                        {cert.certificate_number || "—"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{cert.student_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {cert.student_email}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">{cert.course_title}</td>
                    <td className="px-4 py-2.5">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {cert.verification_code || "—"}
                      </code>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {new Date(cert.issued_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevoke(cert.id)}
                        disabled={isPending && revoking === cert.id}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
