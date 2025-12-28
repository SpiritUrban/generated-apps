import type { Challenge } from "../types";

const oncePerArg = () => {
  const seen = new Set<number>();
  return (value: number) => {
    if (seen.has(value)) {
      throw new Error("duplicate");
    }
    seen.add(value);
    return value * 2;
  };
};

export const challenges: Challenge[] = [
  {
    id: "normalizeName",
    title: "normalizeName: чистое имя",
    description:
      "Приведи строку к виду 'Имя Фамилия': убери лишние пробелы, каждое слово с заглавной буквы, остальные строчные.",
    contract: {
      name: "solve",
      signature: "solve(name: string): string",
      examples: ["'  aLEX   bRoWN  ' -> 'Alex Brown'", "'maria' -> 'Maria'"]
    },
    starterCode: "function solve(name) {\n  // ...\n}\n",
    tests: [
      { input: ["  aLEX   bRoWN  "], expected: "Alex Brown" },
      { input: ["maria"], expected: "Maria" },
      { input: ["  jean  luc  "], expected: "Jean Luc" },
      { input: [""], expected: "" },
      { input: ["   "], expected: "" }
    ],
    hint: "Сначала нормализуй пробелы, затем приведи регистр.",
    solution:
      "function solve(name) {\n  const clean = name.trim().replace(/\\s+/g, ' ');\n  if (!clean) return '';\n  return clean\n    .split(' ')\n    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())\n    .join(' ');\n}\n",
    difficulty: "easy"
  },
  {
    id: "clamp",
    title: "clamp: держи в пределах",
    description: "Ограничь число между min и max.",
    contract: {
      name: "solve",
      signature: "solve(value: number, min: number, max: number): number",
      examples: ["solve(5, 1, 10) -> 5", "solve(-1, 0, 3) -> 0"]
    },
    starterCode: "function solve(value, min, max) {\n  // ...\n}\n",
    tests: [
      { input: [5, 1, 10], expected: 5 },
      { input: [-1, 0, 3], expected: 0 },
      { input: [20, 0, 10], expected: 10 },
      { input: [3, 3, 3], expected: 3 },
      { input: [7, 8, 9], expected: 8 }
    ],
    hint: "Подумай про Math.min/Math.max.",
    solution: "function solve(value, min, max) {\n  return Math.min(Math.max(value, min), max);\n}\n",
    difficulty: "easy"
  },
  {
    id: "groupBy",
    title: "groupBy: собрать по ключу",
    description: "Сгруппируй элементы по значению ключа объекта.",
    contract: {
      name: "solve",
      signature: "solve(items: Array<Record<string, any>>, key: string): Record<string, any[]>",
      examples: ["solve([{type:'a'},{type:'b'}], 'type') -> { a: [...], b: [...] }"]
    },
    starterCode: "function solve(items, key) {\n  // ...\n}\n",
    tests: [
      {
        input: [[{ type: "a", v: 1 }, { type: "b", v: 2 }, { type: "a", v: 3 }], "type"],
        expected: { a: [{ type: "a", v: 1 }, { type: "a", v: 3 }], b: [{ type: "b", v: 2 }] }
      },
      { input: [[], "type"], expected: {} },
      {
        input: [[{ v: 1 }, { type: "x" }], "type"],
        expected: { undefined: [{ v: 1 }], x: [{ type: "x" }] }
      }
    ],
    hint: "Начни с пустого объекта и добавляй массивы.",
    solution:
      "function solve(items, key) {\n  return items.reduce((acc, item) => {\n    const group = String(item[key]);\n    if (!acc[group]) acc[group] = [];\n    acc[group].push(item);\n    return acc;\n  }, {});\n}\n",
    difficulty: "medium"
  },
  {
    id: "memoize",
    title: "memoize-lite: не вызывай дважды",
    description:
      "Получаешь функцию, которая бросает ошибку при повторном вызове с тем же аргументом. Сделай memoize и верни результаты для массива вызовов.",
    contract: {
      name: "solve",
      signature: "solve(fn: (x: number) => number, calls: number[]): number[]",
      examples: ["solve(fn, [1, 2, 1]) -> [2, 4, 2]"]
    },
    starterCode: "function solve(fn, calls) {\n  // ...\n}\n",
    tests: [
      { input: [oncePerArg(), [1, 2, 1, 2]], expected: [2, 4, 2, 4] },
      { input: [oncePerArg(), [3, 3, 3]], expected: [6, 6, 6] },
      { input: [oncePerArg(), [5, 6, 5, 7]], expected: [10, 12, 10, 14] }
    ],
    hint: "Используй кэш по аргументу и не дергай fn повторно.",
    solution:
      "function solve(fn, calls) {\n  const cache = new Map();\n  return calls.map((value) => {\n    if (!cache.has(value)) {\n      cache.set(value, fn(value));\n    }\n    return cache.get(value);\n  });\n}\n",
    difficulty: "medium"
  },
  {
    id: "safeGet",
    title: "safeGet: путь без ошибки",
    description: "Безопасно получи значение по пути 'a.b.c'.",
    contract: {
      name: "solve",
      signature: "solve(obj: any, path: string, fallback: any): any",
      examples: ["solve({a:{b:2}}, 'a.b', 0) -> 2", "solve({}, 'a.b', 0) -> 0"]
    },
    starterCode: "function solve(obj, path, fallback) {\n  // ...\n}\n",
    tests: [
      { input: [{ a: { b: 2 } }, "a.b", 0], expected: 2 },
      { input: [{ a: {} }, "a.b", "n/a"], expected: "n/a" },
      { input: [{ a: { b: null } }, "a.b", 5], expected: null },
      { input: [null, "a.b", "x"], expected: "x" },
      { input: [{ a: { b: 1 } }, "a.b.c", "missing"], expected: "missing" }
    ],
    hint: "Разбивай путь на части и проверяй на каждом шаге.",
    solution:
      "function solve(obj, path, fallback) {\n  if (!obj || !path) return fallback;\n  const parts = path.split('.');\n  let current = obj;\n  for (const part of parts) {\n    if (current && Object.prototype.hasOwnProperty.call(current, part)) {\n      current = current[part];\n    } else {\n      return fallback;\n    }\n  }\n  return current;\n}\n",
    difficulty: "easy"
  },
  {
    id: "unique",
    title: "unique: только первое",
    description: "Верни массив уникальных значений, сохрани порядок.",
    contract: {
      name: "solve",
      signature: "solve(items: any[]): any[]",
      examples: ["solve([1,1,2]) -> [1,2]"]
    },
    starterCode: "function solve(items) {\n  // ...\n}\n",
    tests: [
      { input: [[1, 2, 1, 3]], expected: [1, 2, 3] },
      { input: [["a", "b", "a"]], expected: ["a", "b"] },
      { input: [[true, true, false]], expected: [true, false] },
      { input: [[]], expected: [] }
    ],
    hint: "Следи за тем, что уже встречалось.",
    solution:
      "function solve(items) {\n  const seen = new Set();\n  const result = [];\n  for (const item of items) {\n    if (!seen.has(item)) {\n      seen.add(item);\n      result.push(item);\n    }\n  }\n  return result;\n}\n",
    difficulty: "easy"
  },
  {
    id: "parseKV",
    title: "parseKV: строка в объект",
    description: "Разбери строку формата a=1&b=two в объект.",
    contract: {
      name: "solve",
      signature: "solve(query: string): Record<string, string>",
      examples: ["solve('a=1&b=two') -> {a:'1', b:'two'}"]
    },
    starterCode: "function solve(query) {\n  // ...\n}\n",
    tests: [
      { input: ["a=1&b=two"], expected: { a: "1", b: "two" } },
      { input: ["flag"], expected: { flag: "" } },
      { input: ["a=1&empty="], expected: { a: "1", empty: "" } },
      { input: [""], expected: {} }
    ],
    hint: "Сначала раздели по '&', потом по '='.",
    solution:
      "function solve(query) {\n  if (!query) return {};\n  return query.split('&').reduce((acc, part) => {\n    const [key, value = ''] = part.split('=');\n    if (!key) return acc;\n    acc[decodeURIComponent(key)] = decodeURIComponent(value);\n    return acc;\n  }, {});\n}\n",
    difficulty: "easy"
  },
  {
    id: "compareVersions",
    title: "compareVersions: проще чем кажется",
    description: "Сравни версии формата 1.2.3. Верни -1, 0 или 1.",
    contract: {
      name: "solve",
      signature: "solve(a: string, b: string): number",
      examples: ["solve('1.2.0', '1.2') -> 0", "solve('2.0', '1.9') -> 1"]
    },
    starterCode: "function solve(a, b) {\n  // ...\n}\n",
    tests: [
      { input: ["1.2.0", "1.2"], expected: 0 },
      { input: ["1.2.1", "1.2"], expected: 1 },
      { input: ["1.0", "1.0.5"], expected: -1 },
      { input: ["2", "10"], expected: -1 },
      { input: ["3.4.5", "3.4.5"], expected: 0 }
    ],
    hint: "Сравнивай части по очереди, пустые считаются нулем.",
    solution:
      "function solve(a, b) {\n  const left = a.split('.').map(Number);\n  const right = b.split('.').map(Number);\n  const max = Math.max(left.length, right.length);\n  for (let i = 0; i < max; i += 1) {\n    const l = left[i] ?? 0;\n    const r = right[i] ?? 0;\n    if (l > r) return 1;\n    if (l < r) return -1;\n  }\n  return 0;\n}\n",
    difficulty: "medium"
  },
  {
    id: "debounce",
    title: "debounce-sim: когда сработает",
    description:
      "Смоделируй debounce: если следующий вызов приходит раньше wait, предыдущий не выполняется.",
    contract: {
      name: "solve",
      signature: "solve(calls: {t: number, value: any}[], wait: number): any[]",
      examples: ["solve([{t:0,v:'a'},{t:30,v:'b'}], 50) -> ['b']"]
    },
    starterCode: "function solve(calls, wait) {\n  // ...\n}\n",
    tests: [
      {
        input: [[{ t: 0, value: "a" }, { t: 30, value: "b" }, { t: 90, value: "c" }], 50],
        expected: ["b", "c"]
      },
      {
        input: [[{ t: 0, value: 1 }, { t: 60, value: 2 }], 50],
        expected: [1, 2]
      },
      {
        input: [[{ t: 0, value: "x" }, { t: 10, value: "y" }, { t: 20, value: "z" }], 50],
        expected: ["z"]
      },
      { input: [[{ t: 0, value: "solo" }], 100], expected: ["solo"] }
    ],
    hint: "Сравни время текущего и следующего вызова.",
    solution:
      "function solve(calls, wait) {\n  if (!calls.length) return [];\n  const result = [];\n  for (let i = 0; i < calls.length; i += 1) {\n    const current = calls[i];\n    const next = calls[i + 1];\n    if (!next || next.t - current.t >= wait) {\n      result.push(current.value);\n    }\n  }\n  return result;\n}\n",
    difficulty: "medium"
  },
  {
    id: "isPalindrome",
    title: "isPalindrome: учитывай крайние",
    description: "Проверь, что строка — палиндром, игнорируя пробелы и регистр.",
    contract: {
      name: "solve",
      signature: "solve(text: string): boolean",
      examples: ["solve('А роза упала на лапу Азора') -> true"]
    },
    starterCode: "function solve(text) {\n  // ...\n}\n",
    tests: [
      { input: ["А роза упала на лапу Азора"], expected: true },
      { input: ["racecar"], expected: true },
      { input: ["hello"], expected: false },
      { input: [""], expected: true },
      { input: ["Was it a rat I saw"], expected: true }
    ],
    hint: "Оставь только буквы и цифры.",
    solution:
      "function solve(text) {\n  const cleaned = text.toLowerCase().replace(/[^a-z0-9а-яё]/gi, '');\n  const reversed = cleaned.split('').reverse().join('');\n  return cleaned === reversed;\n}\n",
    difficulty: "easy"
  },
  {
    id: "chunk",
    title: "chunk: упакуй порциями",
    description: "Разбей массив на куски заданного размера.",
    contract: {
      name: "solve",
      signature: "solve(items: any[], size: number): any[][]",
      examples: ["solve([1,2,3,4], 2) -> [[1,2],[3,4]]"]
    },
    starterCode: "function solve(items, size) {\n  // ...\n}\n",
    tests: [
      { input: [[1, 2, 3, 4], 2], expected: [[1, 2], [3, 4]] },
      { input: [[1, 2, 3], 2], expected: [[1, 2], [3]] },
      { input: [[1, 2], 3], expected: [[1, 2]] },
      { input: [[], 2], expected: [] }
    ],
    hint: "Иди по массиву шагом size.",
    solution:
      "function solve(items, size) {\n  const result = [];\n  for (let i = 0; i < items.length; i += size) {\n    result.push(items.slice(i, i + size));\n  }\n  return result;\n}\n",
    difficulty: "easy"
  },
  {
    id: "deepEqual",
    title: "deepEqual-lite: проверка структуры",
    description: "Сравни массивы и объекты по значениям без рекурсии для функций.",
    contract: {
      name: "solve",
      signature: "solve(a: any, b: any): boolean",
      examples: ["solve({a:1}, {a:1}) -> true", "solve([1,2],[1,2]) -> true"]
    },
    starterCode: "function solve(a, b) {\n  // ...\n}\n",
    tests: [
      { input: [[1, 2], [1, 2]], expected: true },
      { input: [[1, 2], [2, 1]], expected: false },
      { input: [{ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } }], expected: true },
      { input: [{ a: 1 }, { a: 1, b: 2 }], expected: false },
      { input: [null, null], expected: true }
    ],
    hint: "Сравни типы, длины и ключи перед углублением.",
    solution:
      "function solve(a, b) {\n  if (Object.is(a, b)) return true;\n  if (typeof a !== typeof b) return false;\n  if (Array.isArray(a) && Array.isArray(b)) {\n    if (a.length !== b.length) return false;\n    return a.every((item, index) => solve(item, b[index]));\n  }\n  if (a && b && typeof a === 'object' && typeof b === 'object') {\n    const aKeys = Object.keys(a);\n    const bKeys = Object.keys(b);\n    if (aKeys.length !== bKeys.length) return false;\n    return aKeys.every((key) => solve(a[key], b[key]));\n  }\n  return false;\n}\n",
    difficulty: "hard"
  }
];
