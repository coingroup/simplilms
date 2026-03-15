"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@simplilms/ui";
import { Sparkles, Upload, Loader2, Brain, FileText } from "lucide-react";
import { startInterview } from "../../actions/ai-course";

const DESIRED_LENGTH_OPTIONS = [
  { value: "1-2 hours", label: "1-2 hours" },
  { value: "3-5 hours", label: "3-5 hours" },
  { value: "6-10 hours", label: "6-10 hours" },
  { value: "10-20 hours", label: "10-20 hours" },
  { value: "20+ hours", label: "20+ hours" },
];

/** Fallback sector options (used when no dynamic sectors are provided) */
const DEFAULT_SECTOR_OPTIONS = [
  { value: "", label: "Generic (No specific sector)" },
  { value: "real_estate", label: "Real Estate" },
  { value: "insurance", label: "Insurance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "cdl_trucking", label: "CDL / Trucking" },
  { value: "cosmetology", label: "Cosmetology / Beauty" },
  { value: "it_tech", label: "IT / Technology" },
  { value: "corporate_compliance", label: "Corporate Compliance" },
  { value: "government", label: "Government" },
];

interface InterviewStartFormProps {
  /** Dynamic sector options from tenant subscriptions. Falls back to defaults if not provided. */
  sectorOptions?: { value: string; label: string }[];
}

export function InterviewStartForm({ sectorOptions }: InterviewStartFormProps) {
  const activeSectorOptions = sectorOptions || DEFAULT_SECTOR_OPTIONS;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<"interview" | "document">("interview");
  const [desiredLength, setDesiredLength] = useState("");
  const [sectorKey, setSectorKey] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("generationMode", generationMode);
    formData.set("desiredLength", desiredLength);
    formData.set("sectorKey", sectorKey);

    startTransition(async () => {
      const result = await startInterview(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.interviewId) {
        router.push(`/admin/courses/ai/${result.interviewId}`);
      }
    });
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-5 w-5" />
          AI Course Creator
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Describe your course topic and let AI help you build a comprehensive
          curriculum through an expert interview or document analysis.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic">
              Course Topic <span className="text-red-500">*</span>
            </Label>
            <Input
              id="topic"
              name="topic"
              placeholder="e.g., Introduction to Real Estate Investing"
              required
              disabled={isPending}
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Input
              id="targetAudience"
              name="targetAudience"
              placeholder="e.g., Beginner investors with no prior experience"
              disabled={isPending}
            />
          </div>

          {/* Desired Length */}
          <div className="space-y-2">
            <Label>Desired Course Length</Label>
            <Select
              value={desiredLength}
              onValueChange={setDesiredLength}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select estimated length" />
              </SelectTrigger>
              <SelectContent>
                {DESIRED_LENGTH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sector */}
          <div className="space-y-2">
            <Label>Industry Sector (Optional)</Label>
            <Select
              value={sectorKey}
              onValueChange={setSectorKey}
              disabled={isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a sector for specialized prompts" />
              </SelectTrigger>
              <SelectContent>
                {activeSectorOptions.map((option) => (
                  <SelectItem
                    key={option.value || "generic"}
                    value={option.value || "generic"}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Selecting a sector tailors the AI to include industry-specific
              regulations, standards, and terminology.
            </p>
          </div>

          {/* Additional Context */}
          <div className="space-y-2">
            <Label htmlFor="additionalContext">Additional Context</Label>
            <Textarea
              id="additionalContext"
              name="additionalContext"
              placeholder="Any specific requirements, compliance standards, or topics to emphasize..."
              rows={3}
              disabled={isPending}
            />
          </div>

          {/* Generation Mode */}
          <div className="space-y-3">
            <Label>Generation Mode</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGenerationMode("interview")}
                disabled={isPending}
                className={`flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                  generationMode === "interview"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                } disabled:opacity-50`}
              >
                <Brain className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                <div>
                  <div className="font-medium text-sm">SME Interview</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    AI interviews you as the subject matter expert to extract
                    knowledge and build the course.
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setGenerationMode("document")}
                disabled={isPending}
                className={`flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                  generationMode === "document"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                } disabled:opacity-50`}
              >
                <FileText className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                <div>
                  <div className="font-medium text-sm">Document Upload</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Upload reference documents and AI will generate the course
                    from them.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
            size="lg"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : generationMode === "interview" ? (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Start AI Interview
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
