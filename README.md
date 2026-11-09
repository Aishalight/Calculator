
# Rose Calculator

A modern, responsive calculator built with **HTML, CSS, and vanilla JavaScript**. Rose Calculator combines everyday arithmetic and scientific calculations in a minimal interface with a soft rose-pink visual identity.

## Features

### Standard Mode
- Addition, subtraction, multiplication, and division.
- Decimal calculations.
- Percentage calculations.
- Clear and backspace controls.
- Compact display of the last completed calculation.
- Keyboard support.

### Scientific Mode
- Switch between Standard and Scientific modes using the scientific icon.
- Trigonometric functions: `sin`, `cos`, `tan`.
- Inverse trigonometric functions: `sin⁻¹`, `cos⁻¹`, `tan⁻¹`.
- Logarithms: `log` and `ln`.
- Square root and cube root.
- Exponents and factorials.
- Parentheses for grouped expressions.
- Mathematical constants: π and e.
- Degree (DEG) and radian (RAD) angle modes.

### Themes and Interface
- Light and dark themes.
- Saves the selected theme between visits.
- Responsive layout for desktop and mobile.
- Rounded bubble-style buttons.
- Subtle hover and click animations.
- Expression preview and calculation history.
- Error handling for invalid expressions and division by zero.

## Built With

- HTML5
- CSS3
- JavaScript (Vanilla JS)

## Project Structure

```text
rose-calculator/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/rose-calculator.git
   ```

2. Open the project folder.
3. Open `index.html` in your browser.

No installation or additional dependencies are required.

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `0–9` | Enter numbers |
| `+ - * /` | Arithmetic operations |
| `Enter` or `=` | Calculate |
| `Backspace` | Delete the last character |
| `Escape` | Clear the current expression |
| `(` `)` | Group expressions |
| `^` | Exponent |
| `%` | Percentage |
| `!` | Factorial |

## Notes

- Trigonometric functions use degrees by default.
- Switch between DEG and RAD in Scientific Mode.
- Expressions follow standard mathematical order of operations.
- Factorials support non-negative integers up to 170.
- The calculator uses a custom expression parser rather than JavaScript `eval()`.

---

**Created by Shaqobadan**
