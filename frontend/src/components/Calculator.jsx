import React, { useState, useRef, useEffect } from "react";
import { Calculator, X, Delete } from "lucide-react";

export default function FloatingCalculator() {
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (open && panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Keyboard support while panel is open
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      const { key } = e;
      if (/[0-9]/.test(key)) {
        e.preventDefault();
        inputDigit(key);
      } else if (["+", "-", "*", "/"].includes(key)) {
        e.preventDefault();
        inputOperator(key);
      } else if (key === ".") {
        e.preventDefault();
        inputDecimal();
      } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        evaluate();
      } else if (key === "Backspace") {
        e.preventDefault();
        backspace();
      } else if (key === "Escape") {
        setOpen(false);
      } else if (key.toLowerCase() === "c") {
        clearAll();
      } else if (key === "%") {
        e.preventDefault();
        percent();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  function formatNumber(numStr) {
    if (numStr === "Error" || numStr === undefined || numStr === null) return "0";
    const str = String(numStr);
    if (str === "Error") return str;
    const [intPart, decPart] = str.split(".");
    const negative = intPart.startsWith("-");
    const intDigits = negative ? intPart.slice(1) : intPart;
    const withCommas = Number(intDigits || 0).toLocaleString("en-US");
    const sign = negative ? "-" : "";
    return decPart !== undefined ? `${sign}${withCommas}.${decPart}` : `${sign}${withCommas}`;
  }

  function calculate(a, b, op) {
    let result;
    switch (op) {
      case "+":
        result = a + b;
        break;
      case "-":
        result = a - b;
        break;
      case "*":
        result = a * b;
        break;
      case "/":
        result = b === 0 ? NaN : a / b;
        break;
      default:
        return b;
    }
    if (!isFinite(result) || isNaN(result)) return "Error";
    // round to avoid floating point artifacts, e.g. 0.1 + 0.2
    return Math.round(result * 1e10) / 1e10;
  }

  function inputDigit(d) {
    if (display === "Error") {
      setDisplay(d);
      setWaitingForOperand(false);
      return;
    }
    if (waitingForOperand) {
      setDisplay(d);
      setWaitingForOperand(false);
      return;
    }
    setDisplay((prev) => {
      if (prev === "0") return d;
      // limit length to avoid overflow
      if (prev.replace(/-/g, "").length >= 12) return prev;
      return prev + d;
    });
  }

  function inputDecimal() {
    if (display === "Error") {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    setDisplay((prev) => (prev.includes(".") ? prev : prev + "."));
  }

  function inputOperator(nextOperator) {
    const inputValue = parseFloat(display);

    if (display === "Error" || isNaN(inputValue)) {
      // nothing sensible to chain from; just reset
      clearAll();
      return;
    }

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator && !waitingForOperand) {
      const result = calculate(previousValue, inputValue, operator);
      setDisplay(formatNumber(result));
      setPreviousValue(result === "Error" ? null : result);
      if (result === "Error") {
        setOperator(null);
        setWaitingForOperand(false);
        return;
      }
    }

    setOperator(nextOperator);
    setWaitingForOperand(true);
  }

  function evaluate() {
    if (operator === null || previousValue === null) return;
    const inputValue = parseFloat(display);
    if (isNaN(inputValue)) return;

    const result = calculate(previousValue, inputValue, operator);
    setDisplay(formatNumber(result));
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  }

  function clearAll() {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }

  function backspace() {
    if (waitingForOperand || display === "Error") return;
    setDisplay((prev) => {
      if (prev.length <= 1 || (prev.length === 2 && prev.startsWith("-"))) return "0";
      return prev.slice(0, -1);
    });
  }

  function percent() {
    if (display === "Error") return;
    setDisplay((prev) => {
      const val = parseFloat(prev) / 100;
      return String(val);
    });
  }

  const exprLabel =
    previousValue !== null
      ? `${formatNumber(previousValue)} ${operator ?? ""}`.trim()
      : "";

  const btnBase =
    "h-14 rounded-xl text-lg font-medium transition-colors active:scale-95 select-none flex items-center justify-center";

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {open && (
        <div
          ref={panelRef}
          className="mb-3 w-[300px] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden animate-[fadeIn_0.15s_ease-out]"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3">
            <span className="text-sm font-semibold text-white tracking-wide">
              Calculator
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close calculator"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Display */}
          <div className="bg-slate-900 px-4 pb-4 pt-1">
            <div className="text-slate-500 text-xs h-4 text-right truncate">
              {exprLabel}
            </div>
            <div className="text-white text-3xl font-semibold text-right truncate">
              {display === "Error" ? "Error" : formatNumber(display)}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50">
            <button
              onClick={clearAll}
              className={`${btnBase} bg-slate-200 text-slate-700 hover:bg-slate-300`}
            >
              AC
            </button>
            <button
              onClick={backspace}
              aria-label="Backspace"
              className={`${btnBase} bg-slate-200 text-slate-700 hover:bg-slate-300`}
            >
              <Delete size={20} />
            </button>
            <button
              onClick={percent}
              className={`${btnBase} bg-slate-200 text-slate-700 hover:bg-slate-300`}
            >
              %
            </button>
            <button
              onClick={() => inputOperator("/")}
              className={`${btnBase} ${
                operator === "/" && waitingForOperand
                  ? "bg-amber-600 ring-2 ring-amber-300"
                  : "bg-amber-500 hover:bg-amber-600"
              } text-white`}
            >
              ÷
            </button>

            {["7", "8", "9"].map((d) => (
              <button
                key={d}
                onClick={() => inputDigit(d)}
                className={`${btnBase} bg-white text-slate-800 hover:bg-slate-100 ring-1 ring-slate-200`}
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => inputOperator("*")}
              className={`${btnBase} ${
                operator === "*" && waitingForOperand
                  ? "bg-amber-600 ring-2 ring-amber-300"
                  : "bg-amber-500 hover:bg-amber-600"
              } text-white`}
            >
              ×
            </button>

            {["4", "5", "6"].map((d) => (
              <button
                key={d}
                onClick={() => inputDigit(d)}
                className={`${btnBase} bg-white text-slate-800 hover:bg-slate-100 ring-1 ring-slate-200`}
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => inputOperator("-")}
              className={`${btnBase} ${
                operator === "-" && waitingForOperand
                  ? "bg-amber-600 ring-2 ring-amber-300"
                  : "bg-amber-500 hover:bg-amber-600"
              } text-white`}
            >
              −
            </button>

            {["1", "2", "3"].map((d) => (
              <button
                key={d}
                onClick={() => inputDigit(d)}
                className={`${btnBase} bg-white text-slate-800 hover:bg-slate-100 ring-1 ring-slate-200`}
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => inputOperator("+")}
              className={`${btnBase} ${
                operator === "+" && waitingForOperand
                  ? "bg-amber-600 ring-2 ring-amber-300"
                  : "bg-amber-500 hover:bg-amber-600"
              } text-white`}
            >
              +
            </button>

            <button
              onClick={() => inputDigit("0")}
              className={`${btnBase} col-span-2 bg-white text-slate-800 hover:bg-slate-100 ring-1 ring-slate-200`}
            >
              0
            </button>
            <button
              onClick={inputDecimal}
              className={`${btnBase} bg-white text-slate-800 hover:bg-slate-100 ring-1 ring-slate-200`}
            >
              .
            </button>
            <button
              onClick={evaluate}
              className={`${btnBase} bg-emerald-600 text-white hover:bg-emerald-700`}
            >
              =
            </button>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close calculator" : "Open calculator"}
        className="h-14 w-14 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center ml-auto"
      >
        {open ? <X size={24} /> : <Calculator size={24} />}
      </button>
    </div>
  );
}