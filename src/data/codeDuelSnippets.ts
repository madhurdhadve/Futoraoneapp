export type Language = 'HTML' | 'CSS' | 'JavaScript' | 'Python' | 'C' | 'C++';

export interface CodeSnippet {
    id: string;
    language: Language;
    level: number; // 1-10
    code: string;
    description?: string;
}

export const CODE_DUEL_SNIPPETS: CodeSnippet[] = [
    // --- HTML ---
    { id: 'html-1', language: 'HTML', level: 1, code: '<h1>Hello World</h1>\n<p>This is a paragraph.</p>' },
    { id: 'html-2', language: 'HTML', level: 2, code: '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>' },
    { id: 'html-3', language: 'HTML', level: 3, code: '<a href="https://example.com">\n  Visit our website\n</a>' },
    { id: 'html-4', language: 'HTML', level: 4, code: '<img src="image.jpg" alt="Description" width="300" />' },
    { id: 'html-5', language: 'HTML', level: 5, code: '<input type="text" placeholder="Enter name" required />\n<button>Submit</button>' },
    { id: 'html-6', language: 'HTML', level: 6, code: '<div class="card">\n  <h2>Title</h2>\n  <p>Content goes here.</p>\n</div>' },
    { id: 'html-7', language: 'HTML', level: 7, code: '<table>\n  <tr>\n    <th>Name</th>\n    <th>Age</th>\n  </tr>\n</table>' },
    { id: 'html-8', language: 'HTML', level: 8, code: '<form action="/submit" method="POST">\n  <label for="email">Email:</label>\n  <input type="email" id="email" />\n</form>' },
    { id: 'html-9', language: 'HTML', level: 9, code: '<meta name="viewport" content="width=device-width, initial-scale=1.0">' },
    { id: 'html-10', language: 'HTML', level: 10, code: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>App</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>' },

    // --- CSS ---
    { id: 'css-1', language: 'CSS', level: 1, code: 'p {\n  color: red;\n  font-size: 16px;\n}' },
    { id: 'css-2', language: 'CSS', level: 2, code: '.container {\n  width: 100%;\n  max-width: 1200px;\n  margin: 0 auto;\n}' },
    { id: 'css-3', language: 'CSS', level: 3, code: 'button:hover {\n  background-color: blue;\n  cursor: pointer;\n}' },
    { id: 'css-4', language: 'CSS', level: 4, code: '.card {\n  border: 1px solid #ccc;\n  border-radius: 8px;\n  padding: 1rem;\n}' },
    { id: 'css-5', language: 'CSS', level: 5, code: '.flex-box {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}' },
    { id: 'css-6', language: 'CSS', level: 6, code: '.grid-layout {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 20px;\n}' },
    { id: 'css-7', language: 'CSS', level: 7, code: '@media (max-width: 768px) {\n  .sidebar {\n    display: none;\n  }\n}' },
    { id: 'css-8', language: 'CSS', level: 8, code: '.animate {\n  transition: all 0.3s ease-in-out;\n  transform: scale(1.05);\n}' },
    { id: 'css-9', language: 'CSS', level: 9, code: '@keyframes spin {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}' },
    { id: 'css-10', language: 'CSS', level: 10, code: ':root {\n  --primary: #ff0000;\n  --secondary: #00ff00;\n}\nbody {\n  background: var(--primary);\n}' },

    // --- JavaScript ---
    { id: 'js-1', language: 'JavaScript', level: 1, code: 'const name = "Futora";\nconsole.log(`Hello, ${name}!`);' },
    { id: 'js-2', language: 'JavaScript', level: 2, code: 'function add(a, b) {\n  return a + b;\n}' },
    { id: 'js-3', language: 'JavaScript', level: 3, code: 'const numbers = [1, 2, 3];\nnumbers.map(n => n * 2);' },
    { id: 'js-4', language: 'JavaScript', level: 4, code: 'document.getElementById("btn").addEventListener("click", () => {\n  alert("Clicked!");\n});' },
    { id: 'js-5', language: 'JavaScript', level: 5, code: 'const user = {\n  name: "John",\n  age: 30,\n  isAdmin: true\n};' },
    { id: 'js-6', language: 'JavaScript', level: 6, code: 'const fetchData = async () => {\n  const res = await fetch("/api/data");\n  const data = await res.json();\n};' },
    { id: 'js-7', language: 'JavaScript', level: 7, code: 'try {\n  doSomething();\n} catch (error) {\n  console.error(error);\n}' },
    { id: 'js-8', language: 'JavaScript', level: 8, code: 'class Car {\n  constructor(brand) {\n    this.brand = brand;\n  }\n}' },
    { id: 'js-9', language: 'JavaScript', level: 9, code: 'const [count, setCount] = useState(0);\nuseEffect(() => {\n  document.title = count;\n}, [count]);' },
    { id: 'js-10', language: 'JavaScript', level: 10, code: 'export const sum = (...args) => args.reduce((a, b) => a + b, 0);' },

    // --- Python ---
    { id: 'py-1', language: 'Python', level: 1, code: 'print("Hello World")\nx = 10\ny = 20\nprint(x + y)' },
    { id: 'py-2', language: 'Python', level: 2, code: 'def greet(name):\n    return f"Hello, {name}!"' },
    { id: 'py-3', language: 'Python', level: 3, code: 'fruits = ["apple", "banana", "cherry"]\nfor x in fruits:\n    print(x)' },
    { id: 'py-4', language: 'Python', level: 4, code: 'person = {\n  "name": "John",\n  "age": 30,\n  "city": "New York"\n}' },
    { id: 'py-5', language: 'Python', level: 5, code: 'if x > 10:\n    print("Above ten,")\n    if x > 20:\n        print("and also above 20!")' },
    { id: 'py-6', language: 'Python', level: 6, code: 'try:\n  print(x)\nexcept NameError:\n  print("Variable x is not defined")' },
    { id: 'py-7', language: 'Python', level: 7, code: 'import json\nx =  { "name":"John", "age":30, "city":"New York"}\ny = json.dumps(x)' },
    { id: 'py-8', language: 'Python', level: 8, code: 'class Person:\n  def __init__(self, name, age):\n    self.name = name\n    self.age = age' },
    { id: 'py-9', language: 'Python', level: 9, code: 'lambda_cube = lambda y: y*y*y\nprint(lambda_cube(5))' },
    { id: 'py-10', language: 'Python', level: 10, code: 'def my_decorator(func):\n    def wrapper():\n        print("Before")\n        func()\n        print("After")\n    return wrapper' },

    // --- C ---
    { id: 'c-1', language: 'C', level: 1, code: '#include <stdio.h>\n\nint main() {\n  printf("Hello World!");\n  return 0;\n}' },
    { id: 'c-2', language: 'C', level: 2, code: 'int myNum = 15;\nfloat myFloatNum = 5.99;\nchar myLetter = \'D\';' },
    { id: 'c-3', language: 'C', level: 3, code: 'int i = 0;\nwhile (i < 5) {\n  printf("%d\\n", i);\n  i++;\n}' },
    { id: 'c-4', language: 'C', level: 4, code: 'void myFunction(char name[]) {\n  printf("Hello %s\\n", name);\n}' },
    { id: 'c-5', language: 'C', level: 5, code: 'int myNumbers[4] = {25, 50, 75, 100};\nprintf("%d", myNumbers[0]);' },
    { id: 'c-6', language: 'C', level: 6, code: 'int myAge = 43;\nprintf("%p", &myAge);' },
    { id: 'c-7', language: 'C', level: 7, code: 'int *ptr = &myAge;\nprintf("%d\\n", *ptr);' },
    { id: 'c-8', language: 'C', level: 8, code: 'struct MyStructure {\n  int myNum;\n  char myLetter;\n};' },
    { id: 'c-9', language: 'C', level: 9, code: 'FILE *fptr;\nfptr = fopen("filename.txt", "w");\nfprintf(fptr, "Some text");' },
    { id: 'c-10', language: 'C', level: 10, code: 'enum Level {\n  LOW = 25,\n  MEDIUM = 50,\n  HIGH = 75\n};' },

    // --- C++ ---
    { id: 'cpp-1', language: 'C++', level: 1, code: '#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello World!";\n  return 0;\n}' },
    { id: 'cpp-2', language: 'C++', level: 2, code: 'int x, y;\nint sum;\ncout << "Type a number: ";\ncin >> x;' },
    { id: 'cpp-3', language: 'C++', level: 3, code: 'string firstName = "John ";\nstring lastName = "Doe";\nstring fullName = firstName + lastName;' },
    { id: 'cpp-4', language: 'C++', level: 4, code: 'bool isCodingFun = true;\nbool isFishTasty = false;\ncout << isCodingFun;' },
    { id: 'cpp-5', language: 'C++', level: 5, code: 'string food = "Pizza";\nstring &meal = food;\ncout << meal;' },
    { id: 'cpp-6', language: 'C++', level: 6, code: 'class MyClass {\n  public:\n    void myMethod() {\n      cout << "Hello World!";\n    }\n};' },
    { id: 'cpp-7', language: 'C++', level: 7, code: 'class Employee {\n  private:\n    int salary;\n  public:\n    void setSalary(int s) { salary = s; }\n};' },
    { id: 'cpp-8', language: 'C++', level: 8, code: 'class Vehicle {\n  public:\n    string brand = "Ford";\n    void honk() { cout << "Tuut, tuut!"; }\n};' },
    { id: 'cpp-9', language: 'C++', level: 9, code: 'template <typename T>\nT myMax(T x, T y) {\n  return (x > y)? x: y;\n}' },
    { id: 'cpp-10', language: 'C++', level: 10, code: '#include <vector>\nvector<string> cars = {"Volvo", "BMW", "Ford"};\nfor (string car : cars) {\n  cout << car << "\\n";\n}' }
];
