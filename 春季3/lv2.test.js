import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "error",
    },
  },
];

// 测试代码
import { test, expect } from 'vitest'
function add(a, b) {
  return a + b
}

test('add(2,3) 等于 5', () => {
  expect(add(2, 3)).toBe(5)
})

function ad(a, b) {
  return a * b
}
test('add(3,4) 等于 7', () => {
  expect(ad(3, 4)).toBe(7)
})

