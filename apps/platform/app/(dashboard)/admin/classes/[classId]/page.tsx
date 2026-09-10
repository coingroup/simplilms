import { requireRole } from "@simplilms/auth/server";
import { notFound } from "next/navigation";
import { getClassByIdFull, getSessionsByClass, createLiveSession } from "@simplilms/core/actions/classes";
import { getClassStudents, getClassAttendance } from "@simplilms/core";
import { isZoomConfigured, createZoomMeeting, deleteZoomMeeting } from "@simplilms/core/actions/zoom";
import { UpcomingSessions } from "@simplilms/core/components/classes/upcoming-sessions";
import { ZoomActions } from "./zoom-actions";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@simplilms/ui";
import { ArrowLeft, Calendar, Clock, MapPin, Plus, Users, Video } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ classId: string }>;
}

export const metadata = { title: "Class Details — Admin" };

export default async function AdminClassDetailPage({ params }: PageProps) {
  await requireRole(["super_admin"]);
  const { classId } = await params;

  const cls = await getClassByIdFull(classId);
  if (!cls) notFound();

  const [sessions, students, attendance, zoomConfigured] = await Promise.all([
    getSessionsByClass(classId),
    getClassStudents(classId),
    getClassAttendance(classId),
    isZoomConfigured(),
  ]);

  const boundCreateZoom = async () => {
    "use server";
    return createZoomMeeting(classId, {
      topic: cls.name,
      schedule: cls.schedule as any,
    });
  };

  const boundDeleteZoom = async () => {
    "use server";
    return deleteZoomMeeting(classId);
  };

  const schedule = cls.schedule as {
    days?: string[];
    startTime?: string;
    endTime?: string;
    timezone?: string;
  } | null;

  const upcomingSessions = sessions.filter(
    (s) => s.status === "scheduled" || s.status === "live"
  );
  const completedSessions = sessions.filter((s) => s.status === "completed");
  const recordingSessions = completedSessions.filter((s) => s.zoom_recording_url);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/classes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Classes
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{cls.name}</h1>
          <Badge variant={cls.is_active ? "default" : "secondary"}>
            {cls.is_active ? "Active" : "Inactive"}
          </Badge>
          {cls.zoom_meeting_id && (
            <Badge variant="outline" className="gap-1">
              <Video className="h-3 w-3" />
              Zoom
            </Badge>
          )}
        </div>
        {cls.description && (
          <p className="text-sm text-muted-foreground mt-1">{cls.description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              {cls.max_students ? `of ${cls.max_students} max` : "Enrolled"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{cls.instructor_name}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schedule</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {schedule?.days?.map((d) => d.slice(0, 3)).join(", ") || "Not set"}
            </div>
            <p className="text-xs text-muted-foreground">
              {schedule?.startTime && schedule?.endTime
                ? `${schedule.startTime} - ${schedule.endTime}`
                : "No time set"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedSessions.length} completed, {recordingSessions.length} recordings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Zoom Integration */}
      <ZoomActions
        classId={classId}
        hasZoom={!!cls.zoom_meeting_id}
        zoomMeetingId={cls.zoom_meeting_id}
        zoomJoinUrl={cls.zoom_join_url}
        zoomConfigured={zoomConfigured}
        onCreateZoom={boundCreateZoom}
        onDeleteZoom={boundDeleteZoom}
      />

      {/* Upcoming Sessions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Upcoming Sessions</h2>
        {upcomingSessions.length > 0 ? (
          <UpcomingSessions
            sessions={upcomingSessions.map((s) => ({
              ...s,
              class_name: cls.name,
              zoom_join_url: s.zoom_join_url || cls.zoom_join_url,
              zoom_start_url: s.zoom_start_url || cls.zoom_start_url,
            }))}
            role="admin"
          />
        ) : (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No upcoming sessions. Use the class schedule to generate sessions.
            </p>
          </Card>
        )}
      </div>

      {/* Recordings */}
      {recordingSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Recordings</h2>
          <div className="space-y-2">
            {recordingSessions.map((s) => (
              <Card key={s.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(s.session_date).toLocaleDateString()}</span>
                  <span className="text-muted-foreground">
                    {s.start_time}
                  </span>
                </div>
                <a href={s.zoom_recording_url!} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">Watch</Button>
                </a>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Student Roster */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Enrolled Students ({students.length})
        </h2>
        {students.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Email</th>
                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Enrolled</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((student: any) => (
                    <tr key={student.id}>
                      <td className="px-4 py-2.5 font-medium">
                        {student.first_name} {student.last_name?.charAt(0)}.
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{student.email}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {new Date(student.enrolled_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No students enrolled yet.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
