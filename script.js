
const display = document.getElementById("display");
const expressionDisplay = document.getElementById("expression");
const historyDisplay = document.getElementById("history");

const scientificPad = document.getElementById("scientificPad");
const scientificToggle = document.getElementById("scientificToggle");
const themeToggle = document.getElementById("themeToggle");
const modeLabel = document.getElementById("modeLabel");
const angleToggle = document.getElementById("angleToggle");

let expression = "";
let justEvaluated = false;
let scientificMode = false;
let angleMode = "DEG";


/* ==============================
   DISPLAY
================================ */

function prettyExpression(value) {
  return value
    .replaceAll("*", " × ")
    .replaceAll("/", " ÷ ")
    .replaceAll("-", " − ")
    .replaceAll("+", " + ")
    .replaceAll("sqrt", "√")
    .replaceAll("cbrt", "∛")
    .replaceAll("pi", "π");
}

function formatNumber(number) {
  if (!Number.isFinite(number)) {
    throw new Error("Math error");
  }

  if (Object.is(number, -0)) {
    number = 0;
  }

  return Number(number.toPrecision(12)).toString();
}

function updateDisplay() {
  expressionDisplay.textContent =
    expression ? prettyExpression(expression) : " ";

  if (!expression) {
    display.textContent = "0";
    return;
  }

  const current = expression.match(
    /(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i
  );

  display.textContent = current
    ? current[0]
    : expression.endsWith("(")
      ? "0"
      : expression.slice(-12);
}


/* ==============================
   INPUT
================================ */

function appendValue(value) {

  const startsNewValue =
    /^(?:\d|\.|pi|e|[a-z]|\()/.test(value);

  if (justEvaluated) {
    if (startsNewValue) {
      expression = "";
    }

    justEvaluated = false;
  }

  // Decimal validation
  if (value === ".") {
    const lastNumber = expression
      .split(/[+\-*/^()%!()]/)
      .pop();

    if (lastNumber.includes(".")) return;

    if (!lastNumber) {
      expression += "0";
    }
  }

  // Implicit multiplication:
  // 2π, 3sin(30), 2(4+5)
  const endsWithValue = /(?:\d|\)|pi|e|!)$/.test(expression);

  const startsNamedValue =
    /^(?:pi|e|[a-z])/.test(value);

  const startsGroup = value === "(";

  if (
    endsWithValue &&
    (startsNamedValue || startsGroup)
  ) {
    expression += "*";
  }

  // Prevent consecutive arithmetic operators
  if (/^[+\-*/^]$/.test(value)) {

    if (!expression && value !== "-") return;

    if (/[+\-*/^]$/.test(expression)) {
      expression = expression.slice(0, -1);
    }
  }

  expression += value;

  updateDisplay();
}


function clearCalculator() {
  expression = "";
  justEvaluated = false;

  updateDisplay();
}


function backspace() {

  if (justEvaluated) {
    clearCalculator();
    return;
  }

  const functionMatch = expression.match(
    /(asin|acos|atan|sqrt|cbrt|sin|cos|tan|log|ln)\($/
  );

  if (functionMatch) {
    expression = expression.slice(
      0,
      -functionMatch[0].length
    );
  } else {
    expression = expression.slice(0, -1);
  }

  updateDisplay();
}


/* ==============================
   TOKENIZER
================================ */

function tokenize(input) {

  const tokens = [];
  let i = 0;

  while (i < input.length) {

    const rest = input.slice(i);

    if (/\s/.test(input[i])) {
      i++;
      continue;
    }

    const number = rest.match(
      /^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i
    );

    if (number) {
      tokens.push({
        type: "number",
        value: Number(number[0])
      });

      i += number[0].length;
      continue;
    }

    const identifier = rest.match(/^[a-z]+/i);

    if (identifier) {
      tokens.push({
        type: "identifier",
        value: identifier[0].toLowerCase()
      });

      i += identifier[0].length;
      continue;
    }

    if ("+-*/^!%()".includes(input[i])) {
      tokens.push({
        type: input[i],
        value: input[i]
      });

      i++;
      continue;
    }

    throw new Error("Invalid expression");
  }

  return tokens;
}


/* ==============================
   EXPRESSION PARSER
================================ */

function evaluate(input) {

  const tokens = tokenize(input);
  let position = 0;

  const peek = () => tokens[position];
  const take = () => tokens[position++];


  // Addition and subtraction
  function parseExpression() {

    let value = parseTerm();

    while (
      peek() &&
      (peek().type === "+" || peek().type === "-")
    ) {

      const operator = take().type;
      const right = parseTerm();

      value = operator === "+"
        ? value + right
        : value - right;
    }

    return value;
  }


  // Multiplication and division
  function parseTerm() {

    let value = parseUnary();

    while (
      peek() &&
      (peek().type === "*" || peek().type === "/")
    ) {

      const operator = take().type;
      const right = parseUnary();

      if (operator === "/" && right === 0) {
        throw new Error("Cannot divide by 0");
      }

      value = operator === "*"
        ? value * right
        : value / right;
    }

    return value;
  }


  // Unary positive and negative
  function parseUnary() {

    if (peek() && peek().type === "+") {
      take();
      return parseUnary();
    }

    if (peek() && peek().type === "-") {
      take();
      return -parseUnary();
    }

    return parsePower();
  }


  // Powers
  function parsePower() {

    let value = parsePostfix();

    if (peek() && peek().type === "^") {
      take();
      value = Math.pow(value, parseUnary());
    }

    return value;
  }


  // Factorial and percentage
  function parsePostfix() {

    let value = parsePrimary();

    while (
      peek() &&
      (peek().type === "!" || peek().type === "%")
    ) {

      const operator = take().type;

      if (operator === "%") {
        value /= 100;
      }

      if (operator === "!") {

        if (
          value < 0 ||
          !Number.isInteger(value) ||
          value > 170
        ) {
          throw new Error(
            "Factorial needs an integer from 0 to 170"
          );
        }

        let result = 1;

        for (let n = 2; n <= value; n++) {
          result *= n;
        }

        value = result;
      }
    }

    return value;
  }


  // Numbers, constants, brackets and functions
  function parsePrimary() {

    const token = take();

    if (!token) {
      throw new Error("Incomplete expression");
    }

    if (token.type === "number") {
      return token.value;
    }

    if (token.type === "(") {

      const value = parseExpression();

      if (!peek() || take().type !== ")") {
        throw new Error("Missing closing bracket");
      }

      return value;
    }

    if (token.type === "identifier") {

      if (token.value === "pi") return Math.PI;
      if (token.value === "e") return Math.E;

      if (!peek() || take().type !== "(") {
        throw new Error("Function needs parentheses");
      }

      const argument = parseExpression();

      if (!peek() || take().type !== ")") {
        throw new Error("Missing closing bracket");
      }

      const angle = angleMode === "DEG"
        ? Math.PI / 180
        : 1;

      const inverseAngle = angleMode === "DEG"
        ? 180 / Math.PI
        : 1;

      const functions = {

        sin: x => Math.sin(x * angle),
        cos: x => Math.cos(x * angle),
        tan: x => Math.tan(x * angle),

        asin: x => Math.asin(x) * inverseAngle,
        acos: x => Math.acos(x) * inverseAngle,
        atan: x => Math.atan(x) * inverseAngle,

        log: x => Math.log10(x),
        ln: x => Math.log(x),

        sqrt: x => Math.sqrt(x),
        cbrt: x => Math.cbrt(x)

      };

      if (!functions[token.value]) {
        throw new Error("Unknown function");
      }

      const result = functions[token.value](argument);

      if (!Number.isFinite(result)) {
        throw new Error("Math error");
      }

      return result;
    }

    throw new Error("Unexpected input");
  }


  const result = parseExpression();

  if (position !== tokens.length) {
    throw new Error("Check your expression");
  }

  return result;
}


/* ==============================
   CALCULATE
================================ */

function calculate() {

  if (!expression || /[+\-*/^(]$/.test(expression)) {
    return;
  }

  try {

    const original = expression;

    const result = evaluate(expression);
    const formatted = formatNumber(result);

    historyDisplay.textContent =
      `${prettyExpression(original)} = ${formatted}`;

    expressionDisplay.textContent =
      prettyExpression(original) + " =";

    display.textContent = formatted;

    expression = formatted;
    justEvaluated = true;

  } catch (error) {

    display.textContent = error.message || "Math error";

    expressionDisplay.textContent =
      "Please check your expression";

    expression = "";
    justEvaluated = true;
  }
}


/* ==============================
   SCIENTIFIC MODE
================================ */

function toggleScientific() {

  scientificMode = !scientificMode;

  scientificPad.hidden = !scientificMode;

  scientificToggle.setAttribute(
    "aria-pressed",
    String(scientificMode)
  );

  scientificToggle.setAttribute(
    "aria-label",
    scientificMode
      ? "Switch to standard mode"
      : "Switch to scientific mode"
  );

  modeLabel.textContent = scientificMode
    ? "SCIENTIFIC"
    : "STANDARD";
}


/* ==============================
   DEGREE / RADIAN
================================ */

function toggleAngle() {

  angleMode = angleMode === "DEG"
    ? "RAD"
    : "DEG";

  angleToggle.textContent = angleMode;

  angleToggle.setAttribute(
    "aria-label",
    `Angle unit: ${angleMode}`
  );
}


/* ==============================
   LIGHT / DARK THEME
================================ */

function setTheme(theme) {

  document.documentElement.dataset.theme = theme;

  themeToggle.setAttribute(
    "aria-label",
    theme === "dark"
      ? "Switch to light theme"
      : "Switch to dark theme"
  );

  try {
    localStorage.setItem("rose-calculator-theme", theme);
  } catch (error) {
    // Calculator still works if storage is unavailable.
  }
}


function toggleTheme() {

  const current =
    document.documentElement.dataset.theme || "light";

  setTheme(current === "light" ? "dark" : "light");
}


/* ==============================
   BUTTON HANDLING
================================ */

function handleButton(button) {

  const action = button.dataset.action;
  const value = button.dataset.value;

  if (action === "clear") {
    clearCalculator();
  }

  else if (action === "backspace") {
    backspace();
  }

  else if (action === "equals") {
    calculate();
  }

  else if (action === "angle") {
    toggleAngle();
  }

  else if (value) {
    appendValue(value);
  }
}


document.querySelectorAll(".key").forEach(button => {

  button.addEventListener("click", () => {
    handleButton(button);
  });

});


scientificToggle.addEventListener(
  "click",
  toggleScientific
);

themeToggle.addEventListener(
  "click",
  toggleTheme
);


/* ==============================
   KEYBOARD SUPPORT
================================ */

document.addEventListener("keydown", event => {

  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  if (/^[0-9.]$/.test(event.key)) {
    appendValue(event.key);
  }

  else if (
    ["+", "-", "*", "/", "^", "(", ")", "%", "!"].includes(event.key)
  ) {
    appendValue(event.key);
  }

  else if (
    event.key === "Enter" ||
    event.key === "="
  ) {
    event.preventDefault();
    calculate();
  }

  else if (event.key === "Backspace") {
    event.preventDefault();
    backspace();
  }

  else if (event.key === "Escape") {
    clearCalculator();
  }

});


/* ==============================
   RESTORE SAVED THEME
================================ */

try {

  const savedTheme =
    localStorage.getItem("rose-calculator-theme");

  if (savedTheme === "dark" || savedTheme === "light") {
    setTheme(savedTheme);
  }

} catch (error) {
  // Use the default light theme.
}


updateDisplay();
