# 🧮 Scientific Calculator

A web-based **scientific calculator** built as a single HTML file with no dependencies and no build step.

It only requires `python3` for the local server and `node` for testing. The application is designed to run locally on macOS and be accessed through a web browser.

The interface features a **black body with orange accents, circular buttons, a dark brown LCD-style display separated from the body, and an expression history above the result**.

---

## 🚀 Running the Application

### 1. Using the Control Script

```bash
cd ~/calculator
./calc.sh start
./calc.sh status
./calc.sh stop
./calc.sh test
```

Open the calculator at:

`http://127.0.0.1:8765/`

### 2. Without the Control Script

```bash
cd ~/calculator
python3 -m http.server 8765 --bind 127.0.0.1
```

The port is configured through the `PORT` variable in `calc.sh`, with `8765` as the default.

The server only binds to `127.0.0.1`.

---

## ✨ Features

### Arithmetic

- `+ − × ÷` with parentheses and exponentiation `^`
- Correct operator precedence:
  `2 + 3 × 4²` = `50`
- Implicit multiplication:
  `2π`, `3(2+1)`, `2sin(30)`
- Automatically closes unfinished parentheses when `=` is pressed
- Chained calculation:
  `2+3=` then `×4=` → `20`
- `ANS` inserts the previous result

### Scientific Functions

| Button | Description |
|---|---|
| `sin` `cos` `tan` | Trigonometric functions following DEG/RAD mode |
| `sinh` `cosh` `tanh` | Hyperbolic functions, independent of angle mode |
| `ln` | Natural logarithm |
| `log` | Base-10 logarithm |
| `√` | Square root |
| `x²` | Square |
| `x⁻¹` | Reciprocal |
| `x!` | Factorial for integers from 0–170 |
| `%` | Percentage |
| `^` | Exponentiation |

### Constants & Modes

- `π` = `3.14159265359`
- `e` = `2.71828182846`
- `DEG` / `RAD` mode
- Default angle mode: **DEG**
- `ANS` — previous result
- `±` — change sign
- `⌫` — backspace
- `AC` — clear

### Display

- Up to 2 previous expressions in history
- Current expression
- Result displayed with `=`

---

## 🎨 Button Layout

The calculator contains **38 buttons** arranged in a 30-column grid.

- Function block: 6 columns
- Numeric keypad: 5 columns

```text
DEG   (    )    %    x!    π
sin   cos  tan  sinh cosh  tanh
ln    log  √    x²   x⁻¹   e
7     8    9    ⌫    AC
4     5    6    ×    ÷
1     2    3    +    −
0     .    ANS  ^    =
```

---

## ⌨️ Keyboard Support

| Key | Function |
|---|---|
| `0`–`9` `.` | Numbers and decimal point |
| `+` `-` `*` `/` `^` | Operators |
| `(` `)` | Parentheses |
| `!` `%` | Factorial and percentage |
| `Enter` or `=` | Evaluate |
| `Backspace` | Delete one character |
| `Esc` | Clear |

Scientific functions, `π`, and `e` are available through the on-screen buttons.

---

## ⚙️ Behavior & Calculation Rules

- **Default angle mode is DEG**
  - `sin(30)` = `0.5`
  - In RAD mode, `sin(π÷2)` = `1`
- Hyperbolic functions are independent of angle mode.
- Unary minus follows standard mathematical precedence:
  - `2^-1` = `0.5`
  - `-2²` = `-4`
- Results are rounded to **12 significant digits**.
- Scientific notation is used for numbers ≥ `10¹²` or < `10⁻⁹`.
- Invalid operations return `Error`.
- One number can contain a maximum of **16 characters**.

### Not Supported

- Inverse trigonometric functions (`asin`, `acos`, `atan`)
- Memory functions (`M+`, `MR`)
- Degree-Minute-Second mode

---

## 🧪 Verification

Run the test suite with:

```bash
node test.mjs
```

The test suite extracts the `<script>` from `index.html`, runs it against a minimal DOM stub, and triggers calculator buttons through:

```js
window.__calc.press()
```

The process exits with a non-zero code if any test fails.

### Test Coverage

**79 tests — all passing**

The test suite covers:

- Basic arithmetic
- Decimal calculations
- Operator precedence
- Chained calculations
- Result reuse
- AC and Backspace
- Exponentiation
- Square root
- Square
- Reciprocal
- Factorial
- Percentage
- `±`
- Nested parentheses
- Implicit multiplication
- Trigonometric functions in DEG/RAD
- Hyperbolic functions
- Error cases
- Button layout and ordering
- Grid spans and button counts
- Visual styling
- 30-column grid
- Circular buttons
- Color palette
- Display/body color separation

A manual visual check was also performed using headless Chromium.

---

## 📁 Project Structure

```text
~/calculator/
├── index.html    # Entire application: HTML + CSS + JS
├── test.mjs      # Test suite (Node.js, no dependencies)
├── calc.sh       # start | stop | status | test
├── server.log    # Created when the server starts
└── README.md     # Project documentation
```

---

## 🏗️ Architecture

The evaluation flow follows these steps:

1. **Token**
   - Stores input as display tokens such as `'2'`, `'+'`, `'sin'`, `'('`, and `'π'`.

2. **`normalize()`**
   - Converts tokens into `{k, v}` objects.
   - Replaces constants.
   - Detects unary minus.
   - Inserts implicit multiplication.

3. **`toRPN()`**
   - Uses the shunting-yard algorithm to convert expressions into Reverse Polish Notation.

4. **`evalRPN()`**
   - Evaluates the stack.
   - Performs domain checks.

5. **`fmt()`**
   - Rounds results to 12 significant digits.
   - Selects decimal or scientific notation.

### Automation Entry Points

```js
window.__calc.press('sin');
window.__calc.state();
// { tokens, ans, angle, justEvaluated }
```