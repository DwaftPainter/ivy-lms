// /**
//  * Question Type Renderers
//  * Dynamic renderers for all IELTS question types in preview/student mode
//  */

// "use client";

// import { cn } from "@/lib/utils";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { Question, QuestionType } from "@/types/assignment-builder";
// // getQuestionConfig removed - not needed

// interface QuestionRendererProps {
//     question: Question;
//     value: string | string[];
//     onChange: (value: string | string[]) => void;
//     showAnswers?: boolean;
// }

// export function QuestionRenderer({
//     question,
//     value,
//     onChange,
//     showAnswers = false,
// }: QuestionRendererProps) {
//     switch (question.type) {
//         case QuestionType.MULTIPLE_CHOICE_SINGLE:
//             return (
//                 <MultipleChoiceSingle
//                     question={question}
//                     value={value as string}
//                     onChange={onChange}
//                     showAnswers={showAnswers}
//                 />
//             );
//         case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
//             return (
//                 <MultipleChoiceMultiple
//                     question={question}
//                     value={(value as string[]) || []}
//                     onChange={onChange}
//                     showAnswers={showAnswers}
//                 />
//             );
//         case QuestionType.TRUE_FALSE_NOT_GIVEN:
//         case QuestionType.YES_NO_NOT_GIVEN:
//             return (
//                 <TrueFalseNotGiven
//                     question={question}
//                     value={(value as unknown) as Record<string, string>}
//                     onChange={(v) => onChange((v as unknown) as string | string[])}
//                     showAnswers={showAnswers}
//                 />
//             );
//         case QuestionType.SENTENCE_COMPLETION:
//         case QuestionType.SUMMARY_COMPLETION:
//         case QuestionType.SUMMARY_COMPLETION_WORD_BANK:
//             return (
//                 <CompletionRenderer
//                     question={question}
//                     value={(value as unknown) as Record<string, string>}
//                     onChange={(v) => onChange((v as unknown) as string | string[])}
//                     showAnswers={showAnswers}
//                 />
//             );
//         case QuestionType.SHORT_ANSWER:
//             return (
//                 <ShortAnswerRenderer
//                     question={question}
//                     value={(value as unknown) as Record<string, string>}
//                     onChange={(v) => onChange((v as unknown) as string | string[])}
//                     showAnswers={showAnswers}
//                 />
//             );
//         case QuestionType.MATCHING_HEADINGS:
//         case QuestionType.MATCHING_INFORMATION:
//         case QuestionType.MATCHING_FEATURES:
//             return (
//                 <MatchingRenderer
//                     question={question}
//                     value={(value as unknown) as Record<string, string>}
//                     onChange={(v) => onChange((v as unknown) as string | string[])}
//                     showAnswers={showAnswers}
//                 />
//             );
//         // case QuestionType.FORM_COMPLETION:
//         //     return (
//         //         <FormCompletionRenderer
//         //             question={question}
//         //             value={value as Record<string, string>}
//         //             onChange={onChange}
//         //             showAnswers={showAnswers}
//         //         />
//         //     );
//         // case QuestionType.TABLE_COMPLETION:
//         //     return (
//         //         <TableCompletionRenderer
//         //             question={question}
//         //             value={value as Record<string, string>}
//         //             onChange={onChange}
//         //             showAnswers={showAnswers}
//         //         />
//         //     );
//         default:
//             return <div>Question type not implemented: {question.type}</div>;
//     }
// }

// // Multiple Choice Single Answer
// interface MultipleChoiceSingleProps {
//     question: Question;
//     value: string;
//     onChange: (value: string) => void;
//     showAnswers?: boolean;
// }

// function MultipleChoiceSingle({
//     question,
//     value,
//     onChange,
//     showAnswers,
// }: MultipleChoiceSingleProps) {
//     const config = question.config as { options: string[]; correctAnswer: string };

//     return (
//         <Card className="mb-4">
//             <CardHeader className="pb-3">
//                 <CardTitle className="text-base font-medium">
//                     Question {question.questionNumber}
//                 </CardTitle>
//                 {question.instructions && (
//                     <p className="text-sm text-muted-foreground">{question.instructions}</p>
//                 )}
//             </CardHeader>
//             <CardContent className="space-y-4">
//                 <p className="text-sm">{question.questionText}</p>

//                 <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
//                     {config.options.map((option, idx) => (
//                         <div key={idx} className="flex items-center space-x-2">
//                             <RadioGroupItem value={option} id={`q-${question.id}-opt-${idx}`} />
//                             <Label
//                                 htmlFor={`q-${question.id}-opt-${idx}`}
//                                 className={cn(
//                                     "text-sm cursor-pointer",
//                                     showAnswers &&
//                                     option === config.correctAnswer &&
//                                     "text-green-600 font-medium"
//                                 )}
//                             >
//                                 {option}
//                             </Label>
//                         </div>
//                     ))}
//                 </RadioGroup>

//                 {showAnswers && (
//                     <div className="mt-4 p-3 bg-green-50 rounded-lg">
//                         <p className="text-sm text-green-700">
//                             Correct Answer: {config.correctAnswer}
//                         </p>
//                     </div>
//                 )}
//             </CardContent>
//         </Card>
//     );
// }

// // Multiple Choice Multiple Answers
// interface MultipleChoiceMultipleProps {
//     question: Question;
//     value: string[];
//     onChange: (value: string[]) => void;
//     showAnswers?: boolean;
// }

// function MultipleChoiceMultiple({
//     question,
//     value,
//     onChange,
//     showAnswers,
// }: MultipleChoiceMultipleProps) {
//     const config = question.config as { options: string[]; correctAnswer: string[] };

//     const toggleOption = (option: string) => {
//         if (value.includes(option)) {
//             onChange(value.filter((v) => v !== option));
//         } else {
//             onChange([...value, option]);
//         }
//     };

//     return (
//         <Card className="mb-4">
//             <CardHeader className="pb-3">
//                 <CardTitle className="text-base font-medium">
//                     Question {question.questionNumber}
//                 </CardTitle>
//                 {question.instructions && (
//                     <p className="text-sm text-muted-foreground">{question.instructions}</p>
//                 )}
//                 <Badge variant="secondary" className="w-fit text-xs">
//                     Select multiple
//                 </Badge>
//             </CardHeader>
//             <CardContent className="space-y-4">
//                 <p className="text-sm">{question.questionText}</p>

//                 <div className="space-y-2">
//                     {config.options.map((option, idx) => (
//                         <div key={idx} className="flex items-center space-x-2">
//                             <Checkbox
//                                 id={`q-${question.id}-opt-${idx}`}
//                                 checked={value.includes(option)}
//                                 onCheckedChange={() => toggleOption(option)}
//                             />
//                             <Label
//                                 htmlFor={`q-${question.id}-opt-${idx}`}
//                                 className={cn(
//                                     "text-sm cursor-pointer",
//                                     showAnswers &&
//                                     config.correctAnswer?.includes(option) &&
//                                     "text-green-600 font-medium"
//                                 )}
//                             >
//                                 {option}
//                             </Label>
//                         </div>
//                     ))}
//                 </div>

//                 {showAnswers && (
//                     <div className="mt-4 p-3 bg-green-50 rounded-lg">
//                         <p className="text-sm text-green-700">
//                             Correct Answers: {config.correctAnswer?.join(", ")}
//                         </p>
//                     </div>
//                 )}
//             </CardContent>
//         </Card>
//     );
// }

// // True / False / Not Given
// interface TrueFalseNotGivenProps {
//     question: Question;
//     value: Record<string, string>;
//     onChange: (value: Record<string, string>) => void;
//     showAnswers?: boolean;
// }

// function TrueFalseNotGiven({
//     question,
//     value,
//     onChange,
//     showAnswers,
// }: TrueFalseNotGivenProps) {
//     const config = question.config as {
//         statements: { id: string; text: string; correctAnswer: string }[];
//     };

//     const options =
//         question.type === QuestionType.YES_NO_NOT_GIVEN
//             ? [
//                 { value: "yes", label: "YES" },
//                 { value: "no", label: "NO" },
//                 { value: "not_given", label: "NOT GIVEN" },
//             ]
//             : [
//                 { value: "true", label: "TRUE" },
//                 { value: "false", label: "FALSE" },
//                 { value: "not_given", label: "NOT GIVEN" },
//             ];

//     const handleChange = (statementId: string, answer: string) => {
//         onChange({ ...value, [statementId]: answer });
//     };

//     return (
//         <Card className="mb-4">
//             <CardHeader className="pb-3">
//                 <CardTitle className="text-base font-medium">
//                     Question {question.questionNumber}
//                 </CardTitle>
//                 {question.instructions && (
//                     <p className="text-sm text-muted-foreground">{question.instructions}</p>
//                 )}
//             </CardHeader>
//             <CardContent className="space-y-6">
//                 {config.statements.map((statement) => (
//                     <div key={statement.id} className="space-y-3">
//                         <p className="text-sm font-medium">{statement.text}</p>

//                         <RadioGroup
//                             value={value[statement.id] || ""}
//                             onValueChange={(val) => handleChange(statement.id, val)}
//                             className="flex flex-wrap gap-4"
//                         >
//                             {options.map((opt) => (
//                                 <div key={opt.value} className="flex items-center space-x-2">
//                                     <RadioGroupItem
//                                         value={opt.value}
//                                         id={`${statement.id}-${opt.value}`}
//                                     />
//                                     <Label
//                                         htmlFor={`${statement.id}-${opt.value}`}
//                                         className={cn(
//                                             "text-sm cursor-pointer",
//                                             showAnswers &&
//                                             opt.value === statement.correctAnswer &&
//                                             "text-green-600 font-medium"
//                                         )}
//                                     >
//                                         {opt.label}
//                                     </Label>
//                                 </div>
//                             ))}
//                         </RadioGroup>

//                         {showAnswers && (
//                             <p className="text-xs text-green-600">
//                                 Correct: {statement.correctAnswer.toUpperCase()}
//                             </p>
//                         )}
//                     </div>
//                 ))}
//             </CardContent>
//         </Card>
//     );
// }

// // Completion (Sentence, Summary, etc.)
// interface CompletionRendererProps {
//     question: Question;
//     value: Record<string, string>;
//     onChange: (value: Record<string, string>) => void;
//     showAnswers?: boolean;
// }

// function CompletionRenderer({
//     question,
//     value,
//     onChange,
//     showAnswers,
// }: CompletionRendererProps) {
//     const config = question.config as {
//         text: string;
//         blanks: { id: string; answer: string; alternatives?: string[] }[];
//         wordBank?: string[];
//     };

//     const handleChange = (blankId: string, answer: string) => {
//         onChange({ ...value, [blankId]: answer });
//     };

//     return (
//         <Card className="mb-4">
//             <CardHeader className="pb-3">
//                 <CardTitle className="text-base font-medium">
//                     Question {question.questionNumber}
//                 </CardTitle>
//                 {question.instructions && (
//                     <p className="text-sm text-muted-foreground">{question.instructions}</p>
//                 )}
//             </CardHeader>
//             <CardContent className="space-y-4">
//                 <div className="text-sm leading-relaxed">
//                     {config.text.split("_____________").map((part, idx) => (
//                         <span key={idx}>
//                             {part}
//                             {idx < config.blanks.length && (
//                                 <>
//                                     <Input
//                                         className="inline-block w-40 mx-1 h-8"
//                                         value={value[config.blanks[idx].id] || ""}
//                                         onChange={(e) =>
//                                             handleChange(config.blanks[idx].id, e.target.value)
//                                         }
//                                         placeholder="..."
//                                     />
//                                     {showAnswers && (
//                                         <span className="text-green-600 text-xs ml-1">
//                                             ({config.blanks[idx].answer})
//                                         </span>
//                                     )}
//                                 </>
//                             )}
//                         </span>
//                     ))}
//                 </div>

//                 {config.wordBank && config.wordBank.length > 0 && (
//                     <>
//                         <Separator />
//                         <div>
//                             <p className="text-sm font-medium mb-2">Word Bank:</p>
//                             <div className="flex flex-wrap gap-2">
//                                 {config.wordBank.map((word) => (
//                                     <Badge key={word} variant="secondary">
//                                         {word}
//                                     </Badge>
//                                 ))}
//                             </div>
//                         </div>
//                     </>
//                 )}
//             </CardContent>
//         </Card>
//     );
// }

// // Short Answer
// interface ShortAnswerRendererProps {
//     question: Question;
//     value: Record<string, string>;
//     onChange: (value: Record<string, string>) => void;
//     showAnswers?: boolean;
// }

// function ShortAnswerRenderer({
//     question,
//     value,
//     onChange,
//     showAnswers,
// }: ShortAnswerRendererProps) {
//     const config = question.config as {
//         questions: { id: string; text: string; answer: string; alternatives?: string[] }[];
//         wordLimit: number;
//     };

//     const handleChange = (qId: string, answer: string) => {
//         onChange({ ...value, [qId]: answer });
//     };

//     return (
//         <Card className="mb-4">
//             <CardHeader className="pb-3">
//                 <CardTitle className="text-base font-medium">
//                     Question {question.questionNumber}
//                 </CardTitle>
//                 {question.instructions && (
//                     <p className="text-sm text-muted-foreground">{question.instructions}</p>
//                 )}
//                 <Badge variant="secondary" className="w-fit text-xs">
//                     Max {config.wordLimit} words
//                 </Badge>
//             </CardHeader>
//             <CardContent className="space-y-4">
//                 {config.questions.map((q, idx) => (
//                     <div key={q.id} className="space-y-2">
//                         <p className="text-sm">
//                             {idx + 1}. {q.text}
//                         </p>
//                         <Input
//                             value={value[q.id] || ""}
//                             onChange={(e) => handleChange(q.id, e.target.value)}
//                             placeholder="Enter your answer"
//                         />
//                         {showAnswers && (
//                             <p className="text-xs text-green-600">
//                                 Correct: {q.answer}
//                                 {q.alternatives && q.alternatives.length > 0 && (
//                                     <span> (or: {q.alternatives.join(", ")})</span>
//                                 )}
//                             </p>
//                         )}
//                     </div>
//                 ))}
//             </CardContent>
//         </Card>
//     );
// }

// // Matching (Headings, Information, Features)
// interface MatchingRendererProps {
//     question: Question;
//     value: Record<string, string>;
//     onChange: (value: Record<string, string>) => void;
//     showAnswers?: boolean;
// }

// function MatchingRenderer({
//     question,
//     value,
//     onChange,
//     showAnswers,
// }: MatchingRendererProps) {
//     const config = question.config as {
//         headings?: string[];
//         statements: { id: string; text: string }[];
//         options: string[];
//         correctMatches?: Record<string, string>;
//     };

//     const handleChange = (statementId: string, option: string) => {
//         onChange({ ...value, [statementId]: option });
//     };

//     return (
//         <Card className="mb-4">
//             <CardHeader className="pb-3">
//                 <CardTitle className="text-base font-medium">
//                     Question {question.questionNumber}
//                 </CardTitle>
//                 {question.instructions && (
//                     <p className="text-sm text-muted-foreground">{question.instructions}</p>
//                 )}
//             </CardHeader>
//             <CardContent className="space-y-4">
//                 {/* Options list */}
//                 <div className="bg-muted p-3 rounded-lg">
//                     <p className="text-sm font-medium mb-2">Options:</p>
//                     <div className="flex flex-wrap gap-2">
//                         {config.options.map((opt, idx) => (
//                             <Badge key={idx} variant="outline">
//                                 {String.fromCharCode(65 + idx)}. {opt}
//                             </Badge>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Statements to match */}
//                 <div className="space-y-3">
//                     {config.statements.map((statement) => (
//                         <div key={statement.id} className="flex items-center gap-3">
//                             <p className="text-sm flex-1">{statement.text}</p>
//                             <Select
//                                 value={value[statement.id] || ""}
//                                 onValueChange={(val) => handleChange(statement.id, val)}
//                             >
//                                 <SelectTrigger className="w-32">
//                                     <SelectValue placeholder="Select" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {config.options.map((opt, idx) => (
//                                         <SelectItem key={opt} value={opt}>
//                                             {String.fromCharCode(65 + idx)}. {opt}
//                                         </SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             </Select>
//                             {showAnswers && config.correctMatches && (
//                                 <span className="text-xs text-green-600">
//                                     ✓ {config.correctMatches[statement.id]}
//                                 </span>
//                             )}
//                         </div>
//                     ))}
//                 </div>
//             </CardContent>
//         </Card>
//     );
// }

// // Form Completion
// interface FormCompletionRendererProps {
//     question: Question;
//     value: Record<string, string>;
//     onChange: (value: Record<string, string>) => void;
//     showAnswers?: boolean;
// }

// function FormCompletionRenderer({
//     question,
//     value,
//     onChange,
//     showAnswers,
// }: FormCompletionRendererProps) {
//     const config = question.config as {
//         fields: {
//             id: string;
//             label: string;
//             answer: string;
//             wordLimit?: number;
//             alternatives?: string[];
//         }[];
//     };

//     const handleChange = (fieldId: string, answer: string) => {
//         onChange({ ...value, [fieldId]: answer });
//     };

//     return (
//         <Card className="mb-4">
//             <CardHeader className="pb-3">
//                 <CardTitle className="text-base font-medium">
//                     Question {question.questionNumber}
//                 </CardTitle>
//                 {question.instructions && (
//                     <p className="text-sm text-muted-foreground">{question.instructions}</p>
//                 )}
//             </CardHeader>
//             <CardContent>
//                 <div className="border rounded-lg overflow-hidden">
//                     <table className="w-full">
//                         <tbody>
//                             {config.fields.map((field, idx) => (
//                                 <tr key={field.id} className={idx % 2 === 0 ? "bg-muted/50" : ""}>
//                                     <td className="p-3 w-1/3">
//                                         <Label className="text-sm font-medium">
//                                             {field.label}
//                                         </Label>
//                                     </td>
//                                     <td className="p-3">
//                                         <div className="flex items-center gap-2">
//                                             <Input
//                                                 value={value[field.id] || ""}
//                                                 onChange={(e) =>
//                                                     handleChange(field.id, e.target.value)
//                                                 }
//                                                 placeholder="..."
//                                             />
//                                             {showAnswers && (
//                                                 <span className="text-xs text-green-600 whitespace-nowrap">
//                                                     ✓ {field.answer}
//                                                 </span>
//                                             )}
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </CardContent>
//         </Card>
//     );
// }

// // Table Completion
// interface TableCompletionRendererProps {
//     question: Question;
//     value: Record<string, string>;
//     onChange: (value: Record<string, string>) => void;
//     showAnswers?: boolean;
// }

// function TableCompletionRenderer({
//     question,
//     value,
//     onChange,
//     showAnswers,
// }: TableCompletionRendererProps) {
//     const config = question.config as {
//         headers: string[];
//         rows: {
//             id: string;
//             cells: (string | null)[];
//             blankColumnIndex: number;
//             answer: string;
//         }[];
//     };

//     const handleChange = (rowId: string, answer: string) => {
//         onChange({ ...value, [rowId]: answer });
//     };

//     return (
//         <Card className="mb-4">
//             <CardHeader className="pb-3">
//                 <CardTitle className="text-base font-medium">
//                     Question {question.questionNumber}
//                 </CardTitle>
//                 {question.instructions && (
//                     <p className="text-sm text-muted-foreground">{question.instructions}</p>
//                 )}
//             </CardHeader>
//             <CardContent>
//                 <div className="border rounded-lg overflow-hidden">
//                     <table className="w-full">
//                         <thead className="bg-muted">
//                             <tr>
//                                 {config.headers.map((header, idx) => (
//                                     <th key={idx} className="p-3 text-left text-sm font-medium">
//                                         {header}
//                                     </th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {config.rows.map((row) => (
//                                 <tr key={row.id} className="border-t">
//                                     {row.cells.map((cell, idx) => (
//                                         <td key={idx} className="p-3">
//                                             {cell ? (
//                                                 <span className="text-sm">{cell}</span>
//                                             ) : (
//                                                 <div className="flex items-center gap-2">
//                                                     <Input
//                                                         value={value[row.id] || ""}
//                                                         onChange={(e) =>
//                                                             handleChange(row.id, e.target.value)
//                                                         }
//                                                         placeholder="..."
//                                                         className="h-8"
//                                                     />
//                                                     {showAnswers && (
//                                                         <span className="text-xs text-green-600 whitespace-nowrap">
//                                                             ✓ {row.answer}
//                                                         </span>
//                                                     )}
//                                                 </div>
//                                             )}
//                                         </td>
//                                     ))}
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </CardContent>
//         </Card>
//     );
// }
