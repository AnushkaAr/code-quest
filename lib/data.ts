export type QuestionType = "theory" | "coding";
export type Difficulty = "easy" | "medium" | "hard";
export type ClassLevel = "python";

export interface Question {
  id: number;
  type: QuestionType;
  difficulty: Difficulty;
  classLevel: ClassLevel;
  topic: string;
  title: string;
  description: string;
  hint?: string;
  xpReward: number;
  options?: string[];
  correctOption?: number;
  explanation?: string;
  starterCode?: string;
  solution?: string;
  testCases?: { input: string; expected: string; description: string }[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  avatar: string;
  level: number;
  xp: number;
  completedQuestions: number[];
  createdAt: string;
  lastActive?: string;
}

export const QUESTIONS: Question[] = [
  // ═══════════════════════════════════════
  // PYTHON MCQ — 10 Questions
  // ═══════════════════════════════════════
  {
    id: 1, type: "theory", difficulty: "easy", classLevel: "python",
    topic: "Python Basics",
    title: "print() Function",
    description: "Which function is used to display output in Python?",
    xpReward: 30,
    options: ["printf()", "console.log()", "print()", "echo()"],
    correctOption: 2,
    explanation: "In Python, print() is the built-in function to display output to the screen.",
  },
  {
    id: 2, type: "theory", difficulty: "easy", classLevel: "python",
    topic: "Python Basics",
    title: "Python Comments",
    description: "How do you write a single-line comment in Python?",
    xpReward: 30,
    options: ["// comment", "/* comment */", "# comment", "<!-- comment -->"],
    correctOption: 2,
    explanation: "In Python, single-line comments start with the # symbol.",
  },
  {
    id: 3, type: "theory", difficulty: "easy", classLevel: "python",
    topic: "Data Types",
    title: "Float Data Type",
    description: "What is the data type of 3.14 in Python?",
    xpReward: 40,
    options: ["int", "str", "float", "bool"],
    correctOption: 2,
    explanation: "3.14 is a decimal number, so its type is float.",
  },
  {
    id: 4, type: "theory", difficulty: "easy", classLevel: "python",
    topic: "Data Types",
    title: "Boolean type() check",
    description: "What will type(True) return in Python?",
    xpReward: 40,
    options: ["<class 'int'>", "<class 'str'>", "<class 'bool'>", "<class 'float'>"],
    correctOption: 2,
    explanation: "True and False are boolean values. type(True) returns <class 'bool'>.",
  },
  {
    id: 5, type: "theory", difficulty: "medium", classLevel: "python",
    topic: "Conditionals",
    title: "if-elif-else Output",
    description: "What will this code print?\n\n```python\nx = 15\nif x > 20:\n    print('Big')\nelif x > 10:\n    print('Medium')\nelse:\n    print('Small')\n```",
    xpReward: 50,
    options: ["Big", "Medium", "Small", "Nothing"],
    correctOption: 1,
    explanation: "x=15 is not >20, but IS >10, so 'Medium' is printed.",
  },
  {
    id: 6, type: "theory", difficulty: "easy", classLevel: "python",
    topic: "Loops",
    title: "range() Function",
    description: "What does range(1, 6) produce in Python?",
    xpReward: 40,
    options: ["1, 2, 3, 4, 5, 6", "1, 2, 3, 4, 5", "0, 1, 2, 3, 4, 5", "1 to infinity"],
    correctOption: 1,
    explanation: "range(1, 6) generates 1, 2, 3, 4, 5 — up to but NOT including 6.",
  },
  {
    id: 7, type: "theory", difficulty: "easy", classLevel: "python",
    topic: "Functions",
    title: "def Keyword",
    description: "Which keyword is used to define a function in Python?",
    xpReward: 40,
    options: ["function", "fun", "def", "func"],
    correctOption: 2,
    explanation: "In Python, the def keyword defines a function. Example: def greet(): print('Hello')",
  },
  {
    id: 8, type: "theory", difficulty: "medium", classLevel: "python",
    topic: "Functions",
    title: "return with no value",
    description: "What does a function return if it has no return statement?",
    xpReward: 50,
    options: ["0", "False", "None", "Error"],
    correctOption: 2,
    explanation: "A Python function with no return statement automatically returns None.",
  },
  {
    id: 9, type: "theory", difficulty: "medium", classLevel: "python",
    topic: "Lists",
    title: "List Indexing",
    description: "Given: arr = [10, 20, 30, 40]\nWhat is arr[2]?",
    xpReward: 40,
    options: ["20", "30", "40", "Error"],
    correctOption: 1,
    explanation: "Lists are zero-indexed. arr[0]=10, arr[1]=20, arr[2]=30, arr[3]=40.",
  },
  {
    id: 10, type: "theory", difficulty: "medium", classLevel: "python",
    topic: "OOP",
    title: "Inheritance Syntax",
    description: "Which correctly defines a Dog class that inherits from Animal in Python?",
    xpReward: 60,
    options: ["class Dog extends Animal:", "class Dog inherits Animal:", "class Dog(Animal):", "class Dog < Animal:"],
    correctOption: 2,
    explanation: "In Python, inheritance uses parentheses: class Dog(Animal): — Dog inherits all attributes and methods of Animal.",
  },

  // ═══════════════════════════════════════
  // PYTHON CODING — 10 Questions
  // ═══════════════════════════════════════
  {
    id: 11, type: "coding", difficulty: "easy", classLevel: "python",
    topic: "Python Basics",
    title: "Hello World",
    description: "Write a Python program that prints:\n`Hello, World!`\n\nThis is the classic first program every programmer writes!",
    hint: "Use the print() function.",
    xpReward: 50,
    starterCode: `# Write your first Python program\n`,
    solution: `print("Hello, World!")`,
    testCases: [{ input: "", expected: "Hello, World!", description: "Prints Hello, World!" }],
  },
  {
    id: 12, type: "coding", difficulty: "easy", classLevel: "python",
    topic: "Python Basics",
    title: "Sum of Two Numbers",
    description: "Write a Python program that takes two numbers as input and prints their sum.\n\nInput:\n5\n3\nOutput: 8",
    hint: "Use int(input()) to read numbers. Then add them.",
    xpReward: 70,
    starterCode: `a = int(input())\nb = int(input())\n# Calculate and print sum\n`,
    solution: `a = int(input())\nb = int(input())\nprint(a + b)`,
    testCases: [
      { input: "5\n3", expected: "8", description: "5 + 3 = 8" },
      { input: "10\n20", expected: "30", description: "10 + 20 = 30" },
    ],
  },
  {
    id: 13, type: "coding", difficulty: "easy", classLevel: "python",
    topic: "Conditionals",
    title: "Even or Odd",
    description: "Write a Python program that reads an integer and prints whether it is Even or Odd.\n\nInput: 4\nOutput: Even\n\nInput: 7\nOutput: Odd",
    hint: "Use the modulo operator %. If n % 2 == 0, it is Even.",
    xpReward: 70,
    starterCode: `n = int(input())\n# Check even or odd\n`,
    solution: `n = int(input())\nif n % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")`,
    testCases: [
      { input: "4", expected: "Even", description: "4 is even" },
      { input: "7", expected: "Odd", description: "7 is odd" },
      { input: "0", expected: "Even", description: "0 is even" },
    ],
  },
  {
    id: 14, type: "coding", difficulty: "medium", classLevel: "python",
    topic: "Conditionals",
    title: "Grade Calculator",
    description: "Write a Python program that reads marks (0–100) and prints the grade:\n- 90–100 → A\n- 80–89 → B\n- 70–79 → C\n- 60–69 → D\n- Below 60 → F",
    xpReward: 100,
    starterCode: `marks = int(input())\n# Determine and print grade\n`,
    solution: `marks = int(input())\nif marks >= 90:\n    print("A")\nelif marks >= 80:\n    print("B")\nelif marks >= 70:\n    print("C")\nelif marks >= 60:\n    print("D")\nelse:\n    print("F")`,
    testCases: [
      { input: "95", expected: "A", description: "95 → A" },
      { input: "82", expected: "B", description: "82 → B" },
      { input: "55", expected: "F", description: "55 → F" },
    ],
  },
  {
    id: 15, type: "coding", difficulty: "easy", classLevel: "python",
    topic: "Loops",
    title: "Print 1 to N",
    description: "Write a Python program that reads N and prints numbers from 1 to N (each on a new line).\n\nInput: 5\nOutput:\n1\n2\n3\n4\n5",
    hint: "Use for i in range(1, n+1).",
    xpReward: 70,
    starterCode: `n = int(input())\n# Print 1 to n\n`,
    solution: `n = int(input())\nfor i in range(1, n + 1):\n    print(i)`,
    testCases: [
      { input: "3", expected: "1\n2\n3", description: "Prints 1, 2, 3" },
      { input: "5", expected: "1\n2\n3\n4\n5", description: "Prints 1 to 5" },
    ],
  },
  {
    id: 16, type: "coding", difficulty: "medium", classLevel: "python",
    topic: "Loops",
    title: "Factorial",
    description: "Write a Python program that reads N and prints N! (factorial).\n\nInput: 5\nOutput: 120\n\n(5! = 5×4×3×2×1 = 120)",
    hint: "Start with fact = 1 and multiply in a loop.",
    xpReward: 100,
    starterCode: `n = int(input())\nfact = 1\n# Calculate factorial using a loop\nprint(fact)`,
    solution: `n = int(input())\nfact = 1\nfor i in range(1, n + 1):\n    fact *= i\nprint(fact)`,
    testCases: [
      { input: "5", expected: "120", description: "5! = 120" },
      { input: "0", expected: "1", description: "0! = 1" },
      { input: "6", expected: "720", description: "6! = 720" },
    ],
  },
  {
    id: 17, type: "coding", difficulty: "medium", classLevel: "python",
    topic: "Lists",
    title: "Find Maximum in List",
    description: "Write a Python program that reads N numbers into a list and prints the maximum value (without using max()).\n\nInput:\n5\n3 9 1 7 4\nOutput: 9",
    hint: "Loop through the list and track the largest value seen so far.",
    xpReward: 120,
    starterCode: `n = int(input())\nnums = list(map(int, input().split()))\n# Find maximum without using max()\n`,
    solution: `n = int(input())\nnums = list(map(int, input().split()))\nmaximum = nums[0]\nfor x in nums:\n    if x > maximum:\n        maximum = x\nprint(maximum)`,
    testCases: [
      { input: "5\n3 9 1 7 4", expected: "9", description: "Max of [3,9,1,7,4] = 9" },
      { input: "4\n-5 -1 -8 -2", expected: "-1", description: "Max of negatives = -1" },
    ],
  },
  {
    id: 18, type: "coding", difficulty: "medium", classLevel: "python",
    topic: "Functions",
    title: "Fibonacci Sequence",
    description: "Write a Python function fibonacci(n) that returns a list of the first N Fibonacci numbers.\n\nInput: 6\nOutput: [0, 1, 1, 2, 3, 5]",
    hint: "Start with [0, 1]. Each next number = sum of previous two.",
    xpReward: 130,
    starterCode: `def fibonacci(n):\n    # Return list of first n Fibonacci numbers\n    pass\n\nn = int(input())\nprint(fibonacci(n))`,
    solution: `def fibonacci(n):\n    if n == 0:\n        return []\n    if n == 1:\n        return [0]\n    fibs = [0, 1]\n    for i in range(2, n):\n        fibs.append(fibs[-1] + fibs[-2])\n    return fibs\n\nn = int(input())\nprint(fibonacci(n))`,
    testCases: [
      { input: "6", expected: "[0, 1, 1, 2, 3, 5]", description: "First 6 Fibonacci numbers" },
      { input: "1", expected: "[0]", description: "First Fibonacci number" },
    ],
  },
  {
    id: 19, type: "coding", difficulty: "hard", classLevel: "python",
    topic: "Recursion",
    title: "Recursive Factorial",
    description: "Write a recursive Python function factorial(n) that returns n!\n\nInput: 5\nOutput: 120",
    hint: "Base case: factorial(0) = 1. Recursive case: n * factorial(n-1).",
    xpReward: 160,
    starterCode: `def factorial(n):\n    # Write recursive function here\n    pass\n\nn = int(input())\nprint(factorial(n))`,
    solution: `def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)\n\nn = int(input())\nprint(factorial(n))`,
    testCases: [
      { input: "5", expected: "120", description: "5! = 120" },
      { input: "0", expected: "1", description: "0! = 1" },
      { input: "3", expected: "6", description: "3! = 6" },
    ],
  },
  {
    id: 20, type: "coding", difficulty: "hard", classLevel: "python",
    topic: "OOP",
    title: "Class: Student",
    description: "Create a Python class Student with:\n- __init__(self, name, marks) constructor\n- A method display() that prints: Name: [name], Marks: [marks]\n\nThen create a Student object and call display().\n\nOutput: Name: Rahul, Marks: 95",
    hint: "Use self.name = name inside __init__. Define display() as a method.",
    xpReward: 180,
    starterCode: `class Student:\n    def __init__(self, name, marks):\n        pass\n    \n    def display(self):\n        pass\n\ns = Student("Rahul", 95)\ns.display()`,
    solution: `class Student:\n    def __init__(self, name, marks):\n        self.name = name\n        self.marks = marks\n    \n    def display(self):\n        print(f"Name: {self.name}, Marks: {self.marks}")\n\ns = Student("Rahul", 95)\ns.display()`,
    testCases: [
      { input: "", expected: "Name: Rahul, Marks: 95", description: "Displays student info" },
    ],
  },
];

export const DEFAULT_USERS: User[] = [
  {
    id: "admin-001", username: "admin", email: "admin@codequest.com",
    password: "admin123", role: "admin", avatar: "🧙",
    level: 99, xp: 99999, completedQuestions: [],
    createdAt: new Date().toISOString(),
  },
];

export function xpToLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}
export function xpForNextLevel(level: number): number {
  return level * level * 100;
}

export const AVATARS = ["⚔️", "🔮", "🛡️", "🏹", "🧙", "🐉", "🦸", "🤖", "🦊", "🐺"];
export const CLASS_LEVELS = ["python"] as const;
export const CLASS_TOPICS: Record<string, string[]> = {
  "python": ["Python Basics", "Data Types", "Conditionals", "Loops", "Functions", "Lists", "Recursion", "OOP"],
};
