
// ROSE STUDIO / CALCULATOR 01

// DOM ELEMENTS
const display = document.getElementById("display");
const expression = document.getElementById("expression");
const history = document.getElementById("history");
const buttons = document.querySelector(".buttons");

// CALCULATOR STATE
let currentInput = "0";
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;
let lastResult = false;
let hasError = false;


// UPDATE DISPLAY
function updateDisplay() {
  display.textContent = currentInput;
}


// FORMAT NUMBERS
function formatNumber(number) {
  if (!Number.isFinite(number)) {
    return "Error";
  }

  return Number(number.toPrecision(12)).toString();
}


// RESET AFTER ERROR
function recoverFromError() {
  if (!hasError) return;

  currentInput = "0";
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = false;
  lastResult = false;
  hasError = false;

  expression.textContent = "";

  updateDisplay();
}


// NUMBER AND DECIMAL INPUT
function inputNumber(number) {
  recoverFromError();

  if (lastResult) {
    currentInput = "0";
    lastResult = false;
    expression.textContent = "";
  }

  if (waitingForSecondOperand) {
    currentInput = number === "." ? "0." : number;
    waitingForSecondOperand = false;

    updateDisplay();
    return;
  }

  // Prevent duplicate decimal points
  if (number === "." && currentInput.includes(".")) {
    return;
  }

  // Limit input length
  if (
    currentInput.replace("-", "").length >= 15 &&
    number !== "."
  ) {
    return;
  }

  if (currentInput === "0" && number !== ".") {
    currentInput = number;
  } else {
    currentInput += number;
  }

  updateDisplay();
}


// MATHEMATICAL OPERATIONS
function performCalculation(first, second, operation) {
  switch (operation) {
    case "+":
      return first + second;

    case "-":
      return first - second;

    case "×":
      return first * second;

    case "÷":
      if (second === 0) {
        return null;
      }

      return first / second;

    default:
      return null;
  }
}


// SELECT OPERATOR
function chooseOperator(nextOperator) {
  recoverFromError();

  if (operator && !waitingForSecondOperand) {
    calculate();
  }

  firstOperand = Number(currentInput);
  operator = nextOperator;

  waitingForSecondOperand = true;
  lastResult = false;

  expression.textContent =
    `${formatNumber(firstOperand)} ${operator}`;
}


// CALCULATE RESULT
function calculate() {
  if (
    operator === null ||
    waitingForSecondOperand ||
    hasError
  ) {
    return;
  }

  const secondOperand = Number(currentInput);
  const previousOperand = firstOperand;
  const previousOperator = operator;

  const result = performCalculation(
    previousOperand,
    secondOperand,
    previousOperator
  );

  const operationText =
    `${formatNumber(previousOperand)} ${previousOperator} ${formatNumber(secondOperand)}`;

  // HANDLE DIVISION BY ZERO
  if (result === null || !Number.isFinite(result)) {
    expression.textContent = operationText + " =";

    currentInput = "Cannot divide by 0";
    hasError = true;

    resetCalculation();
    updateDisplay();

    return;
  }

  const formattedResult = formatNumber(result);

  // SAVE THE MOST RECENT CALCULATION
  history.textContent =
    `${operationText} = ${formattedResult}`;

  // SHOW THE OPERATION ABOVE THE RESULT
  expression.textContent = operationText + " =";

  currentInput = formattedResult;

  resetCalculation();

  lastResult = true;

  updateDisplay();
}


// RESET CALCULATION STATE
function resetCalculation() {
  firstOperand = null;
  operator = null;
  waitingForSecondOperand = false;
}


// CLEAR CURRENT CALCULATION
function clearCalculator() {
  currentInput = "0";

  expression.textContent = "";

  lastResult = false;
  hasError = false;

  resetCalculation();
  updateDisplay();
}


// BACKSPACE
function backspace() {
  if (hasError || lastResult) {
    clearCalculator();
    return;
  }

  if (waitingForSecondOperand) return;

  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = "0";
  }

  if (currentInput === "-") {
    currentInput = "0";
  }

  updateDisplay();
}


// BUTTON CLICK EVENTS
buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) return;

  // Numbers and decimal
  if (button.dataset.number !== undefined) {
    inputNumber(button.dataset.number);
  }

  // Operators
  if (button.dataset.operator) {
    chooseOperator(button.dataset.operator);
  }

  // Calculate
  if (button.dataset.action === "calculate") {
    calculate();
  }

  // Clear
  if (button.dataset.action === "clear") {
    clearCalculator();
  }

  // Backspace
  if (button.dataset.action === "backspace") {
    backspace();
  }
});


// KEYBOARD SUPPORT
document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9.]$/.test(key)) {
    inputNumber(key);
  }

  else if (key === "+" || key === "-") {
    chooseOperator(key);
  }

  else if (key === "*") {
    chooseOperator("×");
  }

  else if (key === "/") {
    event.preventDefault();
    chooseOperator("÷");
  }

  else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
  }

  else if (key === "Backspace") {
    backspace();
  }

  else if (key === "Escape") {
    clearCalculator();
  }
});


// INITIALIZE
updateDisplay();
