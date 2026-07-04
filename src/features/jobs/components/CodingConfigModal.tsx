import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { UseFormReturn, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Code2, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CodingConfigModalProps {
    form: UseFormReturn<any>
    open: boolean
    onOpenChange: (open: boolean) => void
}

const SAMPLE_QUESTIONS = [
    {
        title: "Two Sum",
        problemStatement: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly* one solution**, and you may not use the *same* element twice.

You can return the answer in any order.

**Example 1:**
\`\`\`text
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

**Example 2:**
\`\`\`text
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

**Example 3:**
\`\`\`text
Input: nums = [3,3], target = 6
Output: [0,1]
\`\`\``,
        constraints: `* \`2 <= nums.length <= 10^4\`
* \`-10^9 <= nums[i] <= 10^9\`
* \`-10^9 <= target <= 10^9\`
* **Only one valid answer exists.**

**Follow-up:** Can you come up with an algorithm that is less than \`O(n^2)\` time complexity?`,
        marks: 20,
        testCases: [
            { input: "4\n2 7 11 15\n9", expectedOutput: "0 1", isHidden: false },
            { input: "3\n3 2 4\n6", expectedOutput: "1 2", isHidden: false },
            { input: "2\n3 3\n6", expectedOutput: "0 1", isHidden: false },
            { input: "4\n-1 -2 -3 -4\n-7", expectedOutput: "2 3", isHidden: true },
            { input: "5\n10 20 30 40 50\n90", expectedOutput: "3 4", isHidden: true }
        ],
        boilerplates: [
            { language: "python", code: "import sys\n\ndef twoSum(nums, target):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    lines = sys.stdin.read().split()\n    if len(lines) >= 3:\n        n = int(lines[0])\n        nums = [int(x) for x in lines[1:n+1]]\n        target = int(lines[n+1])\n        res = twoSum(nums, target)\n        if res:\n            print(f'{res[0]} {res[1]}')" },
            { language: "cpp", code: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n    return {};\n}\n\nint main() {\n    int n; if(cin >> n) {\n        vector<int> nums(n);\n        for(int i=0; i<n; i++) cin >> nums[i];\n        int target; cin >> target;\n        vector<int> res = twoSum(nums, target);\n        if(res.size() >= 2) cout << res[0] << \" \" << res[1] << endl;\n    }\n    return 0;\n}" },
            { language: "java", code: "import java.util.*;\n\npublic class Main {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] nums = new int[n];\n            for(int i=0; i<n; i++) nums[i] = sc.nextInt();\n            int target = sc.nextInt();\n            int[] res = twoSum(nums, target);\n            if(res != null && res.length >= 2) System.out.println(res[0] + \" \" + res[1]);\n        }\n    }\n}" }
        ]
    },
    {
        title: "Palindrome Number",
        problemStatement: "Given an integer x, return true if x is a palindrome, and false otherwise.",
        constraints: "-2^31 <= x <= 2^31 - 1",
        marks: 10,
        testCases: [
            { input: "121", expectedOutput: "true", isHidden: false },
            { input: "-121", expectedOutput: "false", isHidden: false },
            { input: "10", expectedOutput: "false", isHidden: true }
        ],
        boilerplates: [
            { language: "python", code: "import sys\n\ndef isPalindrome(x):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    val = sys.stdin.read().strip()\n    if val:\n        res = isPalindrome(int(val))\n        print(str(res).lower())" },
            { language: "cpp", code: "#include <iostream>\nusing namespace std;\n\nbool isPalindrome(int x) {\n    // Write your code here\n    return false;\n}\n\nint main() {\n    int x; if(cin >> x) {\n        cout << (isPalindrome(x) ? \"true\" : \"false\") << endl;\n    }\n    return 0;\n}" },
            { language: "java", code: "import java.util.*;\n\npublic class Main {\n    public static boolean isPalindrome(int x) {\n        // Write your code here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(sc.hasNextInt()) {\n            System.out.println(isPalindrome(sc.nextInt()));\n        }\n    }\n}" }
        ]
    },
    {
        title: "Valid Parentheses",
        problemStatement: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\nAn input string is valid if open brackets are closed by the same type of brackets in the correct order.",
        constraints: "1 <= s.length <= 10^4",
        marks: 20,
        testCases: [
            { input: "()", expectedOutput: "true", isHidden: false },
            { input: "()[]{}", expectedOutput: "true", isHidden: false },
            { input: "(]", expectedOutput: "false", isHidden: true }
        ],
        boilerplates: [
            { language: "python", code: "import sys\n\ndef isValid(s):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    val = sys.stdin.read().strip()\n    if val:\n        res = isValid(val)\n        print(str(res).lower())" },
            { language: "cpp", code: "#include <iostream>\n#include <string>\nusing namespace std;\n\nbool isValid(string s) {\n    // Write your code here\n    return false;\n}\n\nint main() {\n    string s; if(cin >> s) {\n        cout << (isValid(s) ? \"true\" : \"false\") << endl;\n    }\n    return 0;\n}" },
            { language: "java", code: "import java.util.*;\n\npublic class Main {\n    public static boolean isValid(String s) {\n        // Write your code here\n        return false;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(sc.hasNext()) {\n            System.out.println(isValid(sc.next()));\n        }\n    }\n}" }
        ]
    },
    {
        title: "Fibonacci Number",
        problemStatement: "The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.\nGiven n, calculate F(n).",
        constraints: "0 <= n <= 30",
        marks: 10,
        testCases: [
            { input: "2", expectedOutput: "1", isHidden: false },
            { input: "3", expectedOutput: "2", isHidden: false },
            { input: "4", expectedOutput: "3", isHidden: true }
        ],
        boilerplates: [
            { language: "python", code: "import sys\n\ndef fib(n):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    val = sys.stdin.read().strip()\n    if val:\n        print(fib(int(val)))" },
            { language: "cpp", code: "#include <iostream>\nusing namespace std;\n\nint fib(int n) {\n    // Write your code here\n    return 0;\n}\n\nint main() {\n    int n; if(cin >> n) {\n        cout << fib(n) << endl;\n    }\n    return 0;\n}" },
            { language: "java", code: "import java.util.*;\n\npublic class Main {\n    public static int fib(int n) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(sc.hasNextInt()) {\n            System.out.println(fib(sc.nextInt()));\n        }\n    }\n}" }
        ]
    },
    {
        title: "Maximum Subarray",
        problemStatement: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
        constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4",
        marks: 30,
        testCases: [
            { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6", isHidden: false },
            { input: "1\n1", expectedOutput: "1", isHidden: false },
            { input: "5\n5 4 -1 7 8", expectedOutput: "23", isHidden: true }
        ],
        boilerplates: [
            { language: "python", code: "import sys\n\ndef maxSubArray(nums):\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    input_data = sys.stdin.read().split()\n    if len(input_data) > 0:\n        n = int(input_data[0])\n        nums = [int(x) for x in input_data[1:n+1]]\n        print(maxSubArray(nums))" },
            { language: "cpp", code: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    // Write your code here\n    return 0;\n}\n\nint main() {\n    int n; if(cin >> n) {\n        vector<int> nums(n);\n        for(int i=0; i<n; i++) cin >> nums[i];\n        cout << maxSubArray(nums) << endl;\n    }\n    return 0;\n}" },
            { language: "java", code: "import java.util.*;\n\npublic class Main {\n    public static int maxSubArray(int[] nums) {\n        // Write your code here\n        return 0;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if(sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] nums = new int[n];\n            for(int i=0; i<n; i++) nums[i] = sc.nextInt();\n            System.out.println(maxSubArray(nums));\n        }\n    }\n}" }
        ]
    }
]

export function CodingConfigModal({ form, open, onOpenChange }: CodingConfigModalProps) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "codingQuestions",
    })

    const loadSampleQuestions = () => {
        // Clear existing and add samples
        form.setValue("codingQuestions", SAMPLE_QUESTIONS)
        form.setValue("codingExamDuration", 90)
    }

    const addEmptyQuestion = () => {
        append({
            title: "",
            problemStatement: "",
            constraints: "",
            marks: 10,
            testCases: [{ input: "", expectedOutput: "", isHidden: false }],
            boilerplates: [
                { language: "python", code: "import sys\n\ndef main():\n    input_data = sys.stdin.read().split()\n    if not input_data:\n        return\n    # Write your parsing and logic here\n    print(\"output\")\n\nif __name__ == '__main__':\n    main()" },
                { language: "java", code: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            // Write your parsing and logic here\n            System.out.println(\"output\");\n        }\n    }\n}" },
                { language: "cpp", code: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your parsing and logic here\n    cout << \"output\" << endl;\n    return 0;\n}" },
                { language: "javascript", code: "const fs = require('fs');\n\nfunction main() {\n    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');\n    if (input.length === 0 || input[0] === '') return;\n    // Write your parsing and logic here\n    console.log(\"output\");\n}\nmain();" },
                { language: "c", code: "#include <stdio.h>\n\nint main() {\n    // Write your parsing and logic here\n    printf(\"output\\n\");\n    return 0;\n}" },
                { language: "go", code: "package main\n\nimport (\n\t\"fmt\"\n)\n\nfunc main() {\n\t// Write your parsing and logic here\n\tfmt.Println(\"output\")\n}" }
            ]
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-5xl !w-[90vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-primary" />
                        Configure Coding Round
                    </DialogTitle>
                    <DialogDescription>
                        Set up programming challenges for the candidate. Candidates will write code in an embedded IDE.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border">
                        <div className="flex flex-col gap-1">
                            <Label>Exam Duration (Minutes)</Label>
                            <p className="text-xs text-muted-foreground">Total time allowed for the coding section.</p>
                        </div>
                        <Input 
                            type="number" 
                            className="w-24 text-center font-medium"
                            {...form.register("codingExamDuration", { valueAsNumber: true })} 
                        />
                    </div>

                    <div className="flex flex-col gap-3 bg-muted/30 p-3 rounded-lg border">
                        <div className="flex flex-col gap-1">
                            <Label>Exam Availability Window</Label>
                            <p className="text-xs text-muted-foreground">Candidates can only access the exam within this timeframe.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1 w-1/2">
                                <Label className="text-xs">Start Time</Label>
                                <Input 
                                    type="datetime-local" 
                                    {...form.register("codingExamWindow.start")} 
                                />
                            </div>
                            <div className="flex flex-col gap-1 w-1/2">
                                <Label className="text-xs">End Time</Label>
                                <Input 
                                    type="datetime-local" 
                                    {...form.register("codingExamWindow.end")} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border">
                        <div className="flex flex-col gap-1">
                            <Label>Questions per Candidate</Label>
                            <p className="text-xs text-muted-foreground">Randomly assign N questions to each candidate to prevent cheating.</p>
                        </div>
                        <Input 
                            type="number" 
                            className="w-24 text-center font-medium"
                            {...form.register("codingQuestionsPerCandidate", { valueAsNumber: true })} 
                        />
                    </div>

                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-lg">Coding Challenges ({fields.length})</h3>
                            <p className="text-sm text-muted-foreground">Add questions, constraints, and test cases.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={loadSampleQuestions}>
                                Load 5 Sample Questions
                            </Button>
                            <Button type="button" size="sm" onClick={addEmptyQuestion}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Question
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {fields.map((field, index) => (
                            <div key={field.id} className="border rounded-xl p-5 bg-card shadow-sm space-y-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 grid gap-3">
                                        <div className="grid gap-1.5">
                                            <Label>Challenge Title</Label>
                                            <Input 
                                                placeholder="e.g. Two Sum" 
                                                {...form.register(`codingQuestions.${index}.title`)} 
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label>Problem Statement</Label>
                                            <Textarea 
                                                placeholder="Describe the problem clearly..." 
                                                className="min-h-[100px]"
                                                {...form.register(`codingQuestions.${index}.problemStatement`)} 
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-1.5">
                                                <Label>Constraints</Label>
                                                <Textarea 
                                                    placeholder="e.g. 1 <= nums.length <= 10^4" 
                                                    className="min-h-[60px]"
                                                    {...form.register(`codingQuestions.${index}.constraints`)} 
                                                />
                                            </div>
                                            <div className="grid gap-1.5">
                                                <Label>Marks</Label>
                                                <Input 
                                                    type="number" 
                                                    {...form.register(`codingQuestions.${index}.marks`, { valueAsNumber: true })} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                
                                <div className="border bg-muted/20 p-3 rounded-lg">
                                    <Label className="mb-2 block">Test Cases</Label>
                                    <p className="text-xs text-muted-foreground mb-3">Add at least one visible test case and one hidden test case for validation.</p>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                        {form.watch(`codingQuestions.${index}.testCases`)?.map((tc: any, i: number) => (
                                            <div key={i} className="flex gap-2 items-start border-b pb-2 last:border-0 last:pb-0">
                                                <div className="flex-1 grid gap-1.5">
                                                    <Textarea 
                                                        placeholder="Input (e.g. 2\n3 3\n6)" 
                                                        className="min-h-[40px] text-xs font-mono"
                                                        {...form.register(`codingQuestions.${index}.testCases.${i}.input`)} 
                                                    />
                                                </div>
                                                <div className="flex-1 grid gap-1.5">
                                                    <Textarea 
                                                        placeholder="Output (e.g. 0 1)" 
                                                        className="min-h-[40px] text-xs font-mono"
                                                        {...form.register(`codingQuestions.${index}.testCases.${i}.expectedOutput`)} 
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2 pt-1 items-center">
                                                    <div className="flex items-center gap-1">
                                                        <input 
                                                            type="checkbox" 
                                                            id={`hidden-${index}-${i}`} 
                                                            {...form.register(`codingQuestions.${index}.testCases.${i}.isHidden`)} 
                                                        />
                                                        <label htmlFor={`hidden-${index}-${i}`} className="text-xs">Hidden</label>
                                                    </div>
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                                        onClick={() => {
                                                            const tcs = form.getValues(`codingQuestions.${index}.testCases`);
                                                            form.setValue(`codingQuestions.${index}.testCases`, tcs.filter((_: any, idx: number) => idx !== i));
                                                        }}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button 
                                        type="button" 
                                        size="sm" 
                                        variant="outline" 
                                        className="mt-2 text-xs h-7"
                                        onClick={() => {
                                            const tcs = form.getValues(`codingQuestions.${index}.testCases`) || [];
                                            form.setValue(`codingQuestions.${index}.testCases`, [...tcs, { input: "", expectedOutput: "", isHidden: false }]);
                                        }}
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Test Case
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {fields.length === 0 && (
                            <div className="text-center py-10 border rounded-xl border-dashed bg-muted/20">
                                <Code2 className="w-8 h-8 mx-auto text-muted-foreground mb-3 opacity-50" />
                                <p className="text-muted-foreground">No coding challenges added yet.</p>
                                <div className="flex justify-center gap-3 mt-4">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={loadSampleQuestions}
                                    >
                                        Load Sample Set
                                    </Button>
                                    <Button 
                                        type="button" 
                                        size="sm" 
                                        onClick={addEmptyQuestion}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Question
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t mt-4">
                    <Button onClick={() => onOpenChange(false)}>Save Changes</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
