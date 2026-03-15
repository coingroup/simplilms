"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@simplilms/ui";
import { ChevronDown, ChevronRight, Clock, BookOpen, Brain } from "lucide-react";
import type { GeneratedModule } from "../../lib/ai-service";

interface OutlineModuleCardProps {
  module: GeneratedModule;
  moduleIndex: number;
}

export function OutlineModuleCard({
  module,
  moduleIndex,
}: OutlineModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalDuration = module.lessons.reduce(
    (sum, lesson) => sum + (lesson.duration_minutes || 0),
    0
  );

  const totalQuizQuestions = module.lessons.reduce(
    (sum, lesson) => sum + (lesson.quiz_questions?.length || 0),
    0
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer py-3 px-4 hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <CardTitle className="text-sm font-semibold truncate">
              Module {moduleIndex + 1}: {module.title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <Badge variant="secondary" className="text-xs">
              {module.lessons.length} lesson{module.lessons.length !== 1 ? "s" : ""}
            </Badge>
            {totalDuration > 0 && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {totalDuration} min
              </Badge>
            )}
          </div>
        </div>
        {module.description && (
          <p className="text-xs text-muted-foreground mt-1 ml-6 line-clamp-1">
            {module.description}
          </p>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 pb-3 px-4">
          <div className="ml-6 space-y-2">
            {module.lessons.map((lesson, lessonIndex) => (
              <div
                key={lessonIndex}
                className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/30 text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">
                    {lessonIndex + 1}. {lesson.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {lesson.content_type}
                  </Badge>
                  {lesson.duration_minutes > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.duration_minutes}m
                    </span>
                  )}
                  {lesson.quiz_questions && lesson.quiz_questions.length > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      {lesson.quiz_questions.length} Q
                    </span>
                  )}
                </div>
              </div>
            ))}

            {totalQuizQuestions > 0 && (
              <p className="text-xs text-muted-foreground mt-2 ml-1">
                {totalQuizQuestions} quiz question{totalQuizQuestions !== 1 ? "s" : ""} across
                this module
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
