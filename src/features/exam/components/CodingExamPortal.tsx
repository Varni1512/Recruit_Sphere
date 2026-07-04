"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Send, CheckCircle2, XCircle, TerminalSquare, ChevronUp, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import MarkdownViewer from "@/components/MarkdownViewer";

interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

interface Boilerplate {
    language: string;
    code: string;
}

export interface CodingQuestion {
    title: string;
    problemStatement: string;
    constraints?: string;
    marks: number;
    testCases: TestCase[];
    boilerplates: Boilerplate[];
}

export function CodingExamPortal({ 
    questions, 
    onExamSubmit, 
    onPasteAttempt,
    onExamStateChange,
    onShowWarning
}: { 
    questions: CodingQuestion[], 
    onExamSubmit?: (stats: any, codes: string[], results: any[]) => void, 
    onPasteAttempt?: () => void,
    onExamStateChange?: (stats: any, codes: string[], results: any[]) => void,
    onShowWarning?: (msg: string) => void
}) {
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const question = questions[activeQuestionIndex];

    const [languages, setLanguages] = useState<Record<number, string>>(() => {
        const init: Record<number, string> = {};
        questions.forEach((_, i) => init[i] = "python");
        return init;
    });
    const language = languages[activeQuestionIndex] || "python";
    
    // State to persist code for each question
    const [codes, setCodes] = useState<Record<number, string>>(() => {
        const initialCodes: Record<number, string> = {};
        questions.forEach((q, i) => {
            initialCodes[i] = q.boilerplates.find(b => b.language === "python")?.code || "";
        });
        return initialCodes;
    });

    const [isRunning, setIsRunning] = useState(false);
    
    // State to persist results for each question
    const [allResults, setAllResults] = useState<Record<number, any[]>>({});
    // Track which questions were formally submitted and passed all tests
    const [passedQuestions, setPassedQuestions] = useState<Set<number>>(new Set());
    
    // Track visited and generally submitted questions for stats
    const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]));
    const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());
    
    // Console UI State
    const [consoleOpen, setConsoleOpen] = useState(false);
    const [activeConsoleTab, setActiveConsoleTab] = useState<"Testcase" | "TestResult">("Testcase");
    const [activeCaseIndex, setActiveCaseIndex] = useState(0);
    const [isSubmitMode, setIsSubmitMode] = useState<Record<number, boolean>>({});

    const currentCode = codes[activeQuestionIndex] || "";
    const currentResults = allResults[activeQuestionIndex] || [];
    const visibleTestCases = (question?.testCases || []).filter(tc => !tc.isHidden);
    const isCurrentlySubmitted = isSubmitMode[activeQuestionIndex] || false;

    const handleLanguageChange = (lang: string) => {
        setLanguages(prev => ({ ...prev, [activeQuestionIndex]: lang }));
        const bp = question.boilerplates.find(b => b.language === lang)?.code;
        if (bp) {
            setCodes(prev => ({ ...prev, [activeQuestionIndex]: bp }));
        }
    };

    const handleCodeChange = (value: string | undefined) => {
        setCodes(prev => ({ ...prev, [activeQuestionIndex]: value || "" }));
    };

    const handleEditorDidMount = (editor: any, monaco: any) => {
        // Block Paste via Keyboard
        editor.onKeyDown((e: any) => {
            if ((e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyV) {
                e.preventDefault();
                e.stopPropagation();
                if (onPasteAttempt) onPasteAttempt();
            }
        });
    };

    const runCode = async (submit: boolean = false) => {
        setIsRunning(true);
        setIsSubmitMode(prev => ({ ...prev, [activeQuestionIndex]: submit }));
        setConsoleOpen(true);
        setActiveConsoleTab("TestResult");
        
        // Clear previous results for this question
        setAllResults(prev => ({ ...prev, [activeQuestionIndex]: [] }));
        
        try {
            const testCasesToRun = submit 
                ? question.testCases 
                : visibleTestCases;

            const res = await fetch("/api/code/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language,
                    code: currentCode,
                    testCases: testCasesToRun
                })
            });
            const data = await res.json();
            if (data.success) {
                setAllResults(prev => ({ ...prev, [activeQuestionIndex]: data.results }));
                setActiveCaseIndex(0); // reset to first case
                
                if (submit) {
                    setSubmittedQuestions(prev => new Set(prev).add(activeQuestionIndex));
                    const passedAll = data.results.every((r: any) => r.passed);
                    if (passedAll) {
                        setPassedQuestions(prev => new Set(prev).add(activeQuestionIndex));
                    } else {
                        setPassedQuestions(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(activeQuestionIndex);
                            return newSet;
                        });
                    }
                }
            } else {
                alert("Execution Error: " + data.error);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to execute code.");
        } finally {
            setIsRunning(false);
        }
    };

    const allPassed = currentResults.length > 0 && currentResults.every((r: any) => r.passed);
    const passedCount = currentResults.filter((r: any) => r.passed).length;

    // Emit stats to parent
    useEffect(() => {
        if (onExamStateChange) {
            const total = questions.length;
            const submitted = submittedQuestions.size;
            const notSubmitted = visitedQuestions.size - submitted;
            const notVisited = total - visitedQuestions.size;
            onExamStateChange({ total, submitted, notSubmitted, notVisited }, Object.values(codes), Object.values(allResults));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questions.length, submittedQuestions, visitedQuestions]);

    const handleQuestionSwitch = (index: number) => {
        if (index !== activeQuestionIndex) {
            if (!submittedQuestions.has(activeQuestionIndex) && onShowWarning) {
                onShowWarning(`Warning: You haven't submitted your code for Question ${activeQuestionIndex + 1} yet!`);
            }
            setActiveQuestionIndex(index);
            setVisitedQuestions(prev => new Set(prev).add(index));
        }
    };

    if (!question) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-background text-muted-foreground">
                Loading Question...
            </div>
        );
    }

    return (
        <div className="flex h-full w-full overflow-hidden bg-background">
            {/* Left Pane: Problem Description */}
            <div className="w-1/2 border-r flex flex-col h-full bg-[#1e1e1e] text-white">
                {/* Multi-Question Navigator */}
                {questions.length > 1 && (
                    <div className="flex items-center gap-2 p-3 bg-[#252526] border-b border-[#333] overflow-x-auto shrink-0">
                        <span className="text-sm text-[#888] mr-2">Questions:</span>
                        {questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuestionSwitch(i)}
                                className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold transition-colors ${
                                    activeQuestionIndex === i 
                                        ? "bg-primary text-primary-foreground" 
                                        : passedQuestions.has(i)
                                            ? "bg-green-600/20 text-green-500 border border-green-600/50"
                                            : "bg-[#3c3c3c] text-[#ccc] hover:bg-[#4d4d4d]"
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-bold">{question?.title}</h1>
                            <Badge variant="secondary" className="bg-[#333] text-white border-0">Marks: {question?.marks}</Badge>
                        </div>
                        <div className="prose dark:prose-invert max-w-none mb-6">
                            <MarkdownViewer source={question.problemStatement} colorMode="dark" />
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Example Test Cases:</h3>
                        <div className="grid gap-4">
                            {(question.testCases || []).filter(tc => !tc.isHidden).map((tc, i) => (
                                <div key={i} className="bg-[#252526] p-4 rounded-lg font-mono text-sm border border-[#333]">
                                    <div className="mb-2">
                                        <span className="text-[#888] block mb-1">Input:</span>
                                        <div className="text-[#d4d4d4] whitespace-pre-wrap pl-2 border-l-2 border-[#4d4d4d]">{tc.input}</div>
                                    </div>
                                    <div>
                                        <span className="text-[#888] block mb-1">Output:</span>
                                        <div className="text-[#d4d4d4] whitespace-pre-wrap pl-2 border-l-2 border-[#4d4d4d]">{tc.expectedOutput}</div>
                                    </div>
                                </div>
                            ))}
                            {(question.testCases || []).filter(tc => !tc.isHidden).length === 0 && (
                                <p className="text-muted-foreground text-sm italic">No visible test cases available.</p>
                            )}
                        </div>
                    </div>

                    {question.constraints && (
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-4">Constraints:</h3>
                            <MarkdownViewer source={question.constraints} colorMode="dark" />
                        </div>
                    )}
                </div>
            </div>

            {/* Right Pane: Code Editor + Console */}
            <div className="w-1/2 flex flex-col h-full bg-[#1e1e1e]">
                {/* Editor Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333] shrink-0">
                    <Select value={language} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-[180px] bg-[#3c3c3c] border-0 text-white h-8">
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="python">Python 3</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="c">C</SelectItem>
                            <SelectItem value="go">Go</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            className="bg-[#3c3c3c] text-white hover:bg-[#4d4d4d] border-0 h-8"
                            onClick={() => runCode(false)}
                            disabled={isRunning}
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Run Code
                        </Button>
                        <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white h-8"
                            onClick={() => runCode(true)}
                            disabled={isRunning}
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Submit
                        </Button>
                    </div>
                </div>
                
                {/* Editor Body */}
                <div className="flex-1 min-h-0 flex flex-col">
                    <div className="flex-1 min-h-0 relative">
                        <Editor
                            height="100%"
                            language={language === "cpp" ? "cpp" : language === "c" ? "c" : language}
                            theme="vs-dark"
                            value={currentCode}
                            onChange={handleCodeChange}
                            onMount={handleEditorDidMount}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                padding: { top: 16 },
                                contextmenu: false, // Disables right click menu to prevent pasting
                            }}
                        />
                    </div>

                    {/* Console Section */}
                    <div className={`flex flex-col bg-[#252526] border-t border-[#333] transition-all duration-300 ${consoleOpen ? 'h-[40vh]' : 'h-10'}`}>
                        {/* Console Header */}
                        <div className="flex items-center justify-between px-4 h-10 border-b border-[#333] shrink-0">
                            <div className="flex items-center gap-4 h-full">
                                <button 
                                    className="flex items-center gap-2 text-sm text-[#ccc] hover:text-white transition-colors h-full"
                                    onClick={() => setConsoleOpen(!consoleOpen)}
                                >
                                    <TerminalSquare className="w-4 h-4" />
                                    Console
                                    {consoleOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                </button>
                                {consoleOpen && (
                                    <>
                                        <div className="w-[1px] h-4 bg-[#444]"></div>
                                        <button 
                                            className={`text-sm font-medium h-full border-b-2 px-1 transition-colors ${activeConsoleTab === "Testcase" ? "text-white border-white" : "text-[#888] border-transparent hover:text-[#ccc]"}`}
                                            onClick={() => setActiveConsoleTab("Testcase")}
                                        >
                                            Testcase
                                        </button>
                                        <button 
                                            className={`text-sm font-medium h-full border-b-2 px-1 transition-colors ${activeConsoleTab === "TestResult" ? "text-white border-white" : "text-[#888] border-transparent hover:text-[#ccc]"}`}
                                            onClick={() => setActiveConsoleTab("TestResult")}
                                        >
                                            Test Result
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        {/* Console Body */}
                        {consoleOpen && (
                            <div className="flex-1 overflow-y-auto p-4 text-white">
                                {activeConsoleTab === "Testcase" ? (
                                    <div className="space-y-4">
                                        <div className="flex gap-2 overflow-x-auto pb-1">
                                            {visibleTestCases.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setActiveCaseIndex(i)}
                                                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors shrink-0 ${
                                                        activeCaseIndex === i 
                                                            ? "bg-[#3c3c3c] text-white" 
                                                            : "bg-transparent text-[#aaa] hover:bg-[#2d2d2d]"
                                                    }`}
                                                >
                                                    Case {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        {visibleTestCases[activeCaseIndex] && (
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="text-sm text-[#888] mb-1">Input</div>
                                                    <pre className="bg-[#1e1e1e] p-3 rounded-md text-sm font-mono whitespace-pre-wrap border border-[#333]">
                                                        {visibleTestCases[activeCaseIndex].input}
                                                    </pre>
                                                </div>
                                                <div>
                                                    <div className="text-sm text-[#888] mb-1">Expected Output</div>
                                                    <pre className="bg-[#1e1e1e] p-3 rounded-md text-sm font-mono whitespace-pre-wrap border border-[#333]">
                                                        {visibleTestCases[activeCaseIndex].expectedOutput}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Test Result Tab
                                    <div>
                                        {isRunning ? (
                                            <div className="flex items-center justify-center h-full text-[#888] py-8">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                                Running Test Cases...
                                            </div>
                                        ) : currentResults.length === 0 ? (
                                            <div className="text-[#888] flex items-center justify-center h-full py-8">
                                                Run or Submit code to see results here.
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Summary Status */}
                                                <div>
                                                    <h2 className={`text-xl font-semibold mb-2 ${allPassed ? "text-green-500" : "text-red-500"}`}>
                                                        {allPassed ? "Accepted" : "Wrong Answer"}
                                                    </h2>
                                                    {isCurrentlySubmitted && (
                                                        <p className="text-sm text-[#aaa]">
                                                            {passedCount} / {currentResults.length} test cases passed.
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Case Tabs for Results */}
                                                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                                    {currentResults.map((res: any, i: number) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => setActiveCaseIndex(i)}
                                                            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shrink-0 ${
                                                                activeCaseIndex === i 
                                                                    ? "bg-[#3c3c3c] text-white" 
                                                                    : "bg-transparent text-[#aaa] hover:bg-[#2d2d2d]"
                                                            }`}
                                                        >
                                                            {res.passed ? (
                                                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                                            ) : (
                                                                <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                                                            )}
                                                            {res.isHidden ? `Hidden Case ${i + 1}` : `Case ${i + 1}`}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Result Content for Selected Case */}
                                                {currentResults[activeCaseIndex] && (
                                                    <div className="space-y-4 pb-4">
                                                        {currentResults[activeCaseIndex].isHidden ? (
                                                            <div className="bg-[#1e1e1e] p-4 rounded-md border border-[#333] text-center text-[#888]">
                                                                <p>Input is hidden for this test case.</p>
                                                                {!currentResults[activeCaseIndex].passed && (
                                                                    <p className="mt-2 text-red-400">Your code failed on this hidden test case.</p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div>
                                                                    <div className="text-sm text-[#888] mb-1">Input</div>
                                                                    <pre className="bg-[#1e1e1e] p-3 rounded-md text-sm font-mono whitespace-pre-wrap border border-[#333]">
                                                                        {currentResults[activeCaseIndex].input}
                                                                    </pre>
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm text-[#888] mb-1">Expected Output</div>
                                                                    <pre className="bg-[#1e1e1e] p-3 rounded-md text-sm font-mono whitespace-pre-wrap border border-[#333]">
                                                                        {currentResults[activeCaseIndex].expectedOutput}
                                                                    </pre>
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm text-[#888] mb-1">Actual Output</div>
                                                                    <pre className={`bg-[#1e1e1e] p-3 rounded-md text-sm font-mono whitespace-pre-wrap border ${currentResults[activeCaseIndex].passed ? 'border-[#333]' : 'border-red-500/50 text-red-400'}`}>
                                                                        {currentResults[activeCaseIndex].actualOutput || "No output"}
                                                                    </pre>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
