"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@simplilms/ui";
import { Brain, ChevronDown, ChevronRight, Loader2, Check, Filter } from "lucide-react";
import {
  getSectorQuestions,
  getSectorQuestionTopics,
  type SectorQuestionBankRow,
} from "../../actions/sector-modules";

interface QuestionBankBrowserProps {
  sectorModuleId: string;
  sectorName: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 border-green-200",
  intermediate: "bg-amber-100 text-amber-800 border-amber-200",
  advanced: "bg-red-100 text-red-800 border-red-200",
};

const BLOOMS_COLORS: Record<string, string> = {
  remember: "bg-blue-50 text-blue-700",
  understand: "bg-cyan-50 text-cyan-700",
  apply: "bg-green-50 text-green-700",
  analyze: "bg-yellow-50 text-yellow-700",
  evaluate: "bg-orange-50 text-orange-700",
  create: "bg-red-50 text-red-700",
};

const QUESTION_TYPE_LABELS: Record<string, string> = {
  multiple_choice: "Multiple Choice",
  true_false: "True/False",
  short_answer: "Short Answer",
};

export function QuestionBankBrowser({
  sectorModuleId,
  sectorName,
}: QuestionBankBrowserProps) {
  const [questions, setQuestions] = useState<SectorQuestionBankRow[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, startLoading] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Load topics on mount
  useEffect(() => {
    startLoading(async () => {
      const t = await getSectorQuestionTopics(sectorModuleId);
      setTopics(t);
    });
  }, [sectorModuleId]);

  // Load questions when filters change
  useEffect(() => {
    startLoading(async () => {
      const result = await getSectorQuestions({
        sectorModuleId,
        topic: selectedTopic !== "all" ? selectedTopic : undefined,
        difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
        questionType: selectedType !== "all" ? selectedType : undefined,
        limit: pageSize,
        offset: page * pageSize,
      });
      setQuestions(result.questions);
      setTotal(result.total);
    });
  }, [sectorModuleId, selectedTopic, selectedDifficulty, selectedType, page]);

  function handleFilterChange() {
    setPage(0);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold">
            Question Bank — {sectorName}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {total} question{total !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              Filters:
            </div>

            <Select
              value={selectedTopic}
              onValueChange={(v) => {
                setSelectedTopic(v);
                handleFilterChange();
              }}
            >
              <SelectTrigger className="h-7 text-xs w-[180px]">
                <SelectValue placeholder="All Topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedDifficulty}
              onValueChange={(v) => {
                setSelectedDifficulty(v);
                handleFilterChange();
              }}
            >
              <SelectTrigger className="h-7 text-xs w-[140px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedType}
              onValueChange={(v) => {
                setSelectedType(v);
                handleFilterChange();
              }}
            >
              <SelectTrigger className="h-7 text-xs w-[160px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="true_false">True/False</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions list */}
      {isLoading && questions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Loading questions...
            </p>
          </CardContent>
        </Card>
      ) : questions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No questions found{" "}
              {selectedTopic !== "all" || selectedDifficulty !== "all" || selectedType !== "all"
                ? "matching your filters"
                : "in this sector's question bank yet"}
              .
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {questions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={page * pageSize + idx + 1}
              isExpanded={expandedId === q.id}
              onToggle={() =>
                setExpandedId(expandedId === q.id ? null : q.id)
              }
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {page * pageSize + 1}-
            {Math.min((page + 1) * pageSize, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * pageSize >= total || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Individual question card ----

function QuestionCard({
  question,
  index,
  isExpanded,
  onToggle,
}: {
  question: SectorQuestionBankRow;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const difficultyClass =
    DIFFICULTY_COLORS[question.difficulty] ||
    "bg-gray-100 text-gray-800 border-gray-200";

  const bloomsClass =
    BLOOMS_COLORS[question.blooms_level] || "bg-gray-50 text-gray-700";

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium line-clamp-2">
                <span className="text-muted-foreground mr-1.5">
                  {index}.
                </span>
                {question.question_text}
              </p>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge className={difficultyClass} variant="outline">
                  {question.difficulty}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                >
                  {QUESTION_TYPE_LABELS[question.question_type] ||
                    question.question_type}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {question.topic}
              </Badge>
              {question.subtopic && (
                <span className="text-[10px] text-muted-foreground">
                  {question.subtopic}
                </span>
              )}
              <Badge
                className={`text-[10px] px-1.5 py-0 ${bloomsClass}`}
                variant="outline"
              >
                {question.blooms_level}
              </Badge>
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <CardContent className="pt-0 pb-3 px-4 ml-7">
          {/* Options for multiple choice */}
          {question.options && question.options.length > 0 && (
            <div className="space-y-1 mb-3">
              {question.options.map((opt: any, i: number) => (
                <div
                  key={opt.id || i}
                  className={`flex items-center gap-2 text-sm px-2 py-1 rounded ${
                    opt.is_correct
                      ? "bg-green-50 text-green-800"
                      : "bg-muted/30"
                  }`}
                >
                  {opt.is_correct && (
                    <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  )}
                  <span className={opt.is_correct ? "" : "ml-5"}>
                    {opt.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Explanation */}
          {question.explanation && (
            <div className="text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1.5 mb-2">
              <span className="font-medium">Explanation: </span>
              {question.explanation}
            </div>
          )}

          {/* Regulatory reference */}
          {question.regulatory_reference && (
            <div className="text-[10px] text-muted-foreground">
              Ref: {question.regulatory_reference}
            </div>
          )}

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {question.tags.map((tag: string, i: number) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-[10px] px-1 py-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
