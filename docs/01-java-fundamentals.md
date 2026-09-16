---
layout: default
title: Java Fundamentals
subtitle: From source code to running applications
type: docs
quiz:
  - question: "What does the JVM actually execute?"
    options: ["Java source code directly", "Bytecode", "Machine code compiled by javac", "XML configuration"]
    answer: 1
  - question: "Which tool compiles Java source files into bytecode?"
    options: ["java", "javac", "jar", "jshell"]
    answer: 1
  - question: "Which of these is true about the JRE?"
    options: ["It includes the javac compiler", "It is only needed for development", "It contains the JVM plus standard libraries, but no compiler", "It cannot run compiled Java programs"]
    answer: 2
  - question: "A method `print(int... values)` and a method `print(int a, int b)` both exist. What happens when you call `print(1, 2)`?"
    options: ["Compiler error: ambiguous call", "The varargs version runs, because it's more general", "The fixed-arity version runs, because Java prefers the most specific match", "It runs both methods"]
    answer: 2
  - question: "You pass a Customer object into a method. The method calls `customer.setName(\"Changed\")` but never reassigns the parameter. What does the caller see?"
    options: ["Nothing changes — Java is pass-by-value", "The caller's object is mutated, because the reference value was copied but still points to the same object", "A NullPointerException", "It depends on whether Customer is final"]
    answer: 1
  - question: "What happens if a `switch` statement's `case 1:` block has no `break;` and the matching case is 1?"
    options: ["Compiler error", "Only case 1's code runs", "Execution falls through into case 2's code as well", "The switch silently does nothing"]
    answer: 2
---

## Table of Contents
- [JVM, JRE, JDK](#jvm-jre-jdk)
- [Compilation and Execution](#compilation-and-execution)
- [Basic Syntax](#basic-syntax)
- [Packages and Imports](#packages-and-imports)
- [Primitive Types](#primitive-types)
- [Reference Types](#reference-types)
- [Variables and Assignment](#variables-and-assignment)
- [Varargs](#varargs)
- [Pass-by-Value](#pass-by-value)
- [Control Flow](#control-flow)
- [Loops](#loops)
- [Arrays](#arrays)

---

## JVM, JRE, JDK

### Why Does This Matter?

Understanding the difference between JVM, JRE, and JDK is fundamental to how Java applications run. This affects:
- What you need installed to *run* Java applications
- What you need to *develop* Java applications
- How Java achieves "write once, run anywhere"
- How to troubleshoot deployment issues

### Core Concepts

**Java Virtual Machine (JVM)**
- An abstract computing machine that executes bytecode (compiled Java)
- Not specific to Java – can execute any language compiled to bytecode (Kotlin, Scala, Groovy)
- Platform-dependent – JVM for Windows differs from JVM for macOS differs from JVM for Linux
- Provides a layer of abstraction between Java code and the operating system

**Java Runtime Environment (JRE)**
- A *package* containing the JVM + standard libraries
- Everything needed to *run* a Java application
- Does NOT include development tools (compiler, debugger, etc.)
- Suitable for end users who just want to run Java apps
- **Becoming rare** – most developers use JDK instead

**Java Development Kit (JDK)**
- Everything in the JRE, PLUS
- Java compiler (`javac`)
- Debugger
- Development tools
- What developers install

### Visualization

```
Development Machine          Production Server
      ↓                              ↓
   JDK                            JRE
  ├─ JVM                        ├─ JVM
  ├─ javac compiler             ├─ Standard libraries
  ├─ Standard libraries         └─ (No compiler, no dev tools)
  ├─ Debugger
  ├─ Profiler
  └─ IDE plugins
```

### How It Works in Practice

When you install a JDK on your development machine:
- You can **write** Java code
- You can **compile** Java code to bytecode
- You can **debug** Java applications
- You can **run** Java applications

When you install a JRE on a production server:
- You can **run** pre-compiled Java applications
- You cannot compile or develop

### Interview Questions

**Q: What's the difference between JVM and JRE?**
A: JVM is the virtual machine that executes bytecode. JRE is a package containing the JVM plus standard libraries. JVM alone isn't runnable – you need the JRE or JDK.

**Q: Can you run Java applications with only the JVM?**
A: No. The JVM needs the standard libraries (like `java.lang`, `java.util`, etc.) which come in the JRE/JDK. The JVM is just the execution engine.

**Q: Do you need the JDK on a production server?**
A: No. You only need the JRE (or a lightweight JDK). The JDK's compiler and tools aren't used in production.

---

## Compilation and Execution

### The Java Compilation Pipeline

```
Java Source Code
    (.java files)
         ↓
    [javac compiler]
         ↓
Java Bytecode
 (.class files)
         ↓
  [JVM classloader]
         ↓
 Bytecode verified
         ↓
[JIT compiler (optional)]
         ↓
 Native machine code
         ↓
[CPU executes]
```

### Source to Bytecode

When you compile Java code:

```java
// Example.java
public class Example {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
```

Running `javac Example.java` produces `Example.class` containing bytecode.

**Bytecode is NOT machine code.** It's an intermediate format that the JVM understands. This is why Java is "write once, run anywhere" – the same bytecode runs on Windows, macOS, Linux, etc., because each platform has its own JVM that understands bytecode.

### JVM Execution

When you run `java Example`:

1. **Class Loading** – The `Example.class` file is loaded into memory
2. **Verification** – Bytecode is verified for safety (no invalid operations)
3. **JIT Compilation** – Modern JVMs convert bytecode to machine code (optional but default)
4. **Execution** – The native machine code runs on the CPU

### Why Bytecode?

**Portability**: The same `.class` file runs on any JVM.

**Security**: Bytecode can be verified before execution, catching potential exploits.

**Performance**: JIT compilation converts to native code, making Java competitive with C/C++.

**Optimization**: The JVM can optimize bytecode at runtime based on actual usage patterns.

---

## Basic Syntax

### Package Declaration

Every Java file should start with a package declaration (except for the default package, which you should avoid in production):

```java
package com.axxes.example;  // Package structure matches directory structure

public class Customer {
    // Code here
}
```

### Classes

A class is a blueprint for objects:

```java
public class Customer {
    // Class body
}
```

### Main Method

The entry point for a Java application:

```java
public class Application {
    public static void main(String[] args) {
        System.out.println("Application started");
    }
}
```

**Breakdown:**
- `public` – accessible from anywhere
- `static` – belongs to the class, not instances
- `void` – returns nothing
- `String[] args` – command-line arguments passed to the program

### The `args` Array and Varargs Form

`args` holds whatever you typed after the class name on the command line:

```java
public static void main(String[] args) {
    if (args.length > 0) {
        System.out.println("First argument: " + args[0]);
    }
}
// java Application hello world → args = {"hello", "world"}
```

`main` may also be declared with varargs — `public static void main(String... args)` — because varargs *is* an array under the hood (see [Varargs](#varargs) below). Both signatures are valid JVM entry points. You can also have other overloaded `main` methods in the same class (e.g. `main(String[] args, int flag)`), but only the exact `public static void main(String[])` (or its varargs form) is ever picked as the entry point when the class is launched.

<div class="callout concept" markdown="1">
<div class="callout-title"><span>💡</span>Modern Java Note — Instance Main Methods</div>

Newer Java versions let you skip the class wrapper and the `public static` boilerplate entirely for small programs and scripts:

```java
void main() {
    System.out.println("Hello");
}
```

This started as a preview feature in Java 21 ("Unnamed Classes and Instance Main Methods") and was finalized in later releases. It's aimed at beginners and quick scripts, not production code. See [Modules, Reflection & Java 21](../16-modules-reflection-and-java21/) for the full picture, including why it exists and its current limitations.
</div>

### Comments

```java
// Single-line comment

/*
 * Multi-line comment
 */

/**
 * Javadoc comment
 * Used to generate documentation
 */
public class Example {
}
```

### Blocks and Scope

Curly braces `{}` define scope:

```java
public class Scope {
    public void method() {
        int x = 5;  // x is scoped to this method
        
        if (x > 0) {
            int y = 10;  // y is scoped to this if block
        }
        // y is NOT accessible here
    }
}
```

---

## Packages and Imports

### Why Packages Exist

Packages group related classes together and prevent naming collisions — two libraries can each ship a `Customer` class as long as they live in different packages (`com.axxes.billing.Customer` vs. `com.acme.crm.Customer`).

```java
package com.axxes.customer.service;

public class CustomerService {
    // ...
}
```

**The directory structure must match the package name.** `com.axxes.customer.service.CustomerService` must live at `com/axxes/customer/service/CustomerService.java` relative to the source root. The compiler and build tools rely on this to locate classes.

### Importing Classes

```java
import java.util.List;             // Single-type import
import java.util.ArrayList;
import java.util.*;                // Wildcard import – brings in every public type in java.util

import static java.util.Collections.emptyList; // Static import – lets you call emptyList() directly
```

- `java.lang` (String, Object, Integer, Math, …) is imported **automatically** — no `import` needed.
- Wildcard imports (`import java.util.*`) are convenient but hide exactly which classes are in use and can cause ambiguity if two packages export a type with the same name; most teams prefer explicit imports (and IDEs auto-manage them anyway).
- If two imported types share a name (e.g. `java.util.Date` and `java.sql.Date`), you must fully qualify at least one usage: `java.sql.Date sqlDate = ...`.
- Static imports pull in `static` members so you can write `emptyList()` instead of `Collections.emptyList()` — useful for test assertions (`assertEquals`) and math-heavy code, but overuse hurts readability.

### The Default Package

A class with no `package` declaration lives in the **default (unnamed) package**. Avoid this in real projects — classes in the default package can't be imported by classes that *do* declare a package, which makes the code impossible to reuse from anywhere else.

### Package-Private Access

Classes and members with no access modifier are visible only within their own package — this ties directly into the access modifiers covered in [Object-Oriented Java](../02-object-oriented-java/#access-modifiers), and is how a package can expose a small public API while hiding its internal helper classes.

---

## Primitive Types

### Overview

Java has 8 primitive types. They are NOT objects – they are simple values:

| Type | Size | Range | Default | Example |
|------|------|-------|---------|---------|
| `byte` | 8 bits | -128 to 127 | 0 | `byte age = 25;` |
| `short` | 16 bits | -32,768 to 32,767 | 0 | `short code = 1000;` |
| `int` | 32 bits | -2.1B to 2.1B | 0 | `int count = 1000000;` |
| `long` | 64 bits | -9.2E18 to 9.2E18 | 0L | `long id = 123456789L;` |
| `float` | 32 bits | ~±3.4E38 | 0.0f | `float rate = 3.14f;` |
| `double` | 64 bits | ~±1.7E308 | 0.0d | `double value = 3.14159;` |
| `boolean` | 1 bit | true/false | false | `boolean active = true;` |
| `char` | 16 bits | Unicode 0-65535 | `'\u0000'` | `char grade = 'A';` |

### Integer Types

Use `int` by default for integers. Use `long` for values that might exceed 2.1 billion:

```java
int count = 100;  // Safe for normal counts
long id = 1234567890123L;  // Note the 'L' suffix

// Without 'L', large numbers are treated as int and overflow
long wrongId = 1234567890123;  // Compiler error
```

### Floating Point

Use `double` by default for decimals (it's more precise):

```java
double price = 19.99;  // Preferred
float discount = 0.1f;  // Only use if memory is critical

// Floating point math has precision issues
double result = 0.1 + 0.2;  // Result is 0.30000000000000004, not 0.3
```

<div class="callout warning" markdown="1">
<div class="callout-title"><span>⚠️</span>Floating Point Pitfall</div>

Never use floating point for money. Always use `BigDecimal`:

```java
// WRONG
double accountBalance = 100.10;
accountBalance = accountBalance - 0.05;  // Precision loss

// CORRECT
BigDecimal accountBalance = new BigDecimal("100.10");
accountBalance = accountBalance.subtract(new BigDecimal("0.05"));
```

</div>

### Boolean

```java
boolean isActive = true;
boolean isEmpty = false;

// Can only be true or false (not 0 or 1 like in C)
// if (1) { }  // Compiler error
if (isActive) { }  // Correct
```

### Character

```java
char grade = 'A';  // Single character, must use single quotes
char newline = '\n';
char tab = '\t';
char unicode = 'A';  // Unicode for 'A'

// String is NOT primitive, it's a reference type
String name = "John";  // Uses double quotes
```

### Literal Formats

```java
int decimal = 1_000_000;      // Underscores for readability (Java 7+), value is 1000000
int hex = 0x1A;               // Hexadecimal
int binary = 0b1010;          // Binary (Java 7+)
int octal = 012;               // Octal (leading zero) – rarely used, easy to trip over
long big = 10_000_000_000L;   // 'L' suffix required beyond int range
double sci = 1.5e3;            // Scientific notation – 1500.0
```

### Widening, Narrowing, and Casting

Converting between numeric types is either automatic or requires an explicit cast, depending on whether information can be lost:

```java
// Widening – automatic, no data loss (smaller type → bigger type)
int i = 100;
long l = i;      // int → long, implicit
double d = l;    // long → double, implicit

// Narrowing – requires an explicit cast, CAN lose data (bigger type → smaller type)
double price = 19.99;
int truncated = (int) price;   // truncated = 19 – decimal part is dropped, not rounded

long bigValue = 3_000_000_000L;
int overflowed = (int) bigValue;  // Overflows silently – no exception, just a wrong int value
```

<div class="callout warning" markdown="1">
<div class="callout-title"><span>⚠️</span>Narrowing Is Silent</div>

Casting a `double` to an `int` truncates rather than rounds, and casting a value outside the target type's range wraps around instead of throwing. Neither case produces a compiler warning at the call site once you've added the cast — the cast is your explicit "I know what I'm doing":

```java
int score = (int) 9.99;          // 9, not 10 – use Math.round() if you want rounding
byte tooBig = (byte) 200;        // -56 – silently wraps, byte only holds -128..127
```

</div>

Casting also applies to reference types (upcasting/downcasting between related classes) and to boxing/unboxing between primitives and their wrapper types — both are covered in depth in [Casting, instanceof & Copying](../14-object-copying-and-casting/).

### Why Primitives Matter

Primitives are **stack-allocated** and very fast. Reference types are **heap-allocated** and involve more overhead.

```java
int count = 100;      // Primitive – stack, very fast
Integer counted = 100;  // Reference type – heap, wrapper, overhead
```

In modern Java, use primitives for performance-critical code, and use wrapper types (`Integer`, `Long`, etc.) when you need to store them in collections or nullable fields.

---

## Reference Types

### What Are Reference Types?

Everything except primitives. Reference types include:
- Classes
- Interfaces
- Arrays
- Enums
- Records (Java 16+)

Unlike primitives, reference types are stored on the **heap**, and variables hold a **reference** (address) to the object, not the object itself.

### Classes

```java
public class Customer {
    private String name;
    private String email;
    
    public Customer(String name, String email) {
        this.name = name;
        this.email = email;
    }
}

// Creating an instance
Customer customer = new Customer("Alice", "alice@example.com");
// 'customer' is a reference to the object on the heap
```

### Arrays

Arrays are reference types:

```java
int[] numbers = new int[5];  // Array of 5 ints
numbers[0] = 10;

String[] names = new String[3];
names[0] = "Alice";
names[1] = "Bob";

// Arrays can be initialized inline
int[] values = {1, 2, 3, 4, 5};
```

### Null

Reference types can be `null` (pointing to nothing). Primitives cannot:

```java
int count = null;  // Compiler error
Integer count = null;  // OK – wrapper type

String name = null;  // OK
System.out.println(name.length());  // NullPointerException at runtime!
```

---

## Variables and Assignment

### Declaration and Initialization

```java
int age;              // Declaration
age = 25;             // Initialization
int count = 5;        // Declaration + initialization

// Modern Java - use 'var' for local variables
var customerName = "Alice";  // Type inferred as String
var productCount = 100;      // Type inferred as int
```

### `var` Type Inference (Java 10+)

Modern Java allows `var` for local variables. The type is inferred from the right-hand side:

```java
var count = 5;  // Inferred as int
var price = 19.99;  // Inferred as double
var customer = new Customer("Alice", "alice@example.com");  // Inferred as Customer

// WRONG – cannot use var without initialization
var unknown;  // Compiler error
```

**When to use `var`:**
- Local variables where the type is obvious
- Makes code more concise

**When to avoid `var`:**
- Class fields (always use explicit type)
- Public method parameters
- When type is not immediately clear

### Final Variables

```java
final int maxRetries = 3;
maxRetries = 5;  // Compiler error – cannot reassign

final String name;
name = "Alice";  // OK – initialized later
name = "Bob";    // Compiler error – already assigned
```

### Naming Conventions

```java
// Variables and methods: camelCase
int customerAge = 25;
void calculateTotal() { }

// Constants: UPPER_SNAKE_CASE, declared as static final
public static final int MAX_CONNECTIONS = 100;
public static final String APP_NAME = "MyApp";

// Classes: PascalCase
public class OrderProcessor { }
public class PaymentService { }

// Packages: lowercase.separated.by.dots
package com.axxes.customer.service;
```

---

## Varargs

A method can accept a variable number of arguments using `...` (varargs), which the compiler treats as an array:

```java
public int sum(int... numbers) {
    int total = 0;
    for (int n : numbers) {
        total += n;
    }
    return total;
}

sum();           // numbers = {} (empty array), not null
sum(1);           // numbers = {1}
sum(1, 2, 3);     // numbers = {1, 2, 3}
sum(new int[]{1, 2, 3});  // passing an array directly also works
```

**Rules:**
- A method can have at most **one** varargs parameter, and it must be the **last** parameter: `void log(String tag, Object... args)` is valid; `void log(Object... args, String tag)` is not.
- Internally, `int... numbers` is exactly `int[] numbers` — you can use it like any array inside the method.

<div class="callout warning" markdown="1">
<div class="callout-title"><span>⚠️</span>Overload Resolution With Varargs</div>

When both a fixed-arity method and a varargs method could match a call, **Java always prefers the fixed-arity (more specific) match**:

```java
void print(int a, int b) { System.out.println("fixed"); }
void print(int... values) { System.out.println("varargs"); }

print(1, 2);  // Prints "fixed" — exact match wins over varargs
print(1, 2, 3);  // Prints "varargs" — only the varargs version can match 3 arguments
```

Mixing varargs with overloads that could also accept `null` is a classic ambiguity trap — `print((int[]) null)` compiles, but `print(null)` alone may not resolve the way you expect if multiple overloads accept reference types.
</div>

---

## Pass-by-Value

This is one of the most misunderstood rules in Java, and it trips up developers coming from languages with true pass-by-reference: **Java is always pass-by-value — for both primitives and objects.**

For primitives, the value itself is copied:

```java
void increment(int x) {
    x = x + 1;  // Only changes the local copy
}

int number = 5;
increment(number);
System.out.println(number);  // Still 5 — the method got a copy
```

For objects, what gets copied is the **reference value** (the address), not the object it points to. That copy still points at the *same* object on the heap, so mutating the object through it is visible to the caller — but reassigning the parameter itself is not:

```java
void rename(Customer customer) {
    customer.setName("Changed");   // Mutates the SAME object the caller has → visible to caller
    customer = new Customer("New", "new@example.com");  // Reassigns the LOCAL copy of the reference only
}

Customer alice = new Customer("Alice", "alice@example.com");
rename(alice);
System.out.println(alice.getName());  // "Changed" — the mutation stuck
// alice still refers to the original object — the reassignment inside rename() had no effect on it
```

<div class="callout concept" markdown="1">
<div class="callout-title"><span>💡</span>The Rule in One Sentence</div>

Java copies the **reference**, not the object. Mutating through the copied reference affects the shared object; reassigning the copied reference does not affect the caller's variable. There is no way in standard Java to pass a variable "by reference" such that reassigning the parameter changes the caller's variable.
</div>

---

## Control Flow

### If-Else

```java
int age = 20;

if (age >= 18) {
    System.out.println("Adult");
} else if (age >= 13) {
    System.out.println("Teenager");
} else {
    System.out.println("Child");
}
```

### Switch Statement (Traditional)

```java
int dayOfWeek = 2;
String dayName;

switch (dayOfWeek) {
    case 1:
        dayName = "Monday";
        break;
    case 2:
        dayName = "Tuesday";
        break;
    default:
        dayName = "Unknown";
}
```

<div class="callout warning" markdown="1">
<div class="callout-title"><span>⚠️</span>Fallthrough Is the Default</div>

Without `break;`, execution **falls through** into the next case, running its code too — this is a classic source of bugs in traditional switch statements:

```java
int day = 6;
switch (day) {
    case 6:
        System.out.println("Saturday");
        // No break! Falls through into case 7...
    case 7:
        System.out.println("Sunday");
        break;
    default:
        System.out.println("Weekday");
}
// Output for day = 6:
// Saturday
// Sunday       <- printed too, because there was no break after case 6
```

Fallthrough is occasionally used intentionally to group multiple labels with shared behavior:

```java
switch (day) {
    case 6:
    case 7:
        System.out.println("Weekend");   // Runs for both 6 and 7
        break;
    default:
        System.out.println("Weekday");
}
```

</div>

### Switch Expression (Java 14+, Preferred)

Modern Java uses switch expressions, which are cleaner and type-safe. Because it's an *expression* (it produces a value), the arrow form has **no fallthrough** — each branch is isolated:

```java
int dayOfWeek = 2;
String dayName = switch (dayOfWeek) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    case 3 -> "Wednesday";
    default -> "Unknown";
};
```

When a branch needs more than one statement to compute its value, use a block with `yield` to produce the result:

```java
int day = 6;
String category = switch (day) {
    case 1, 2, 3, 4, 5 -> "Weekday";
    case 6, 7 -> {
        String note = "No work!";
        yield "Weekend (" + note + ")";   // yield "returns" the value of this branch
    }
    default -> throw new IllegalArgumentException("Invalid day: " + day);
};
```

`yield` is only valid inside a switch expression block — it is not a general-purpose return statement.

### Ternary Operator

```java
int age = 20;
String status = age >= 18 ? "Adult" : "Minor";

// Avoid deeply nested ternary
String message = (age >= 65) ? "Senior" : 
                  (age >= 18) ? "Adult" : 
                  "Minor";  // Hard to read
```

### Null-Safe Access

```java
String customerName = customer != null ? customer.getName() : "Unknown";

// Better in modern Java – use Optional (covered later)
var name = customer.map(Customer::getName).orElse("Unknown");
```

---

## Loops

### For Loop (Traditional)

```java
for (int i = 0; i < 5; i++) {
    System.out.println(i);  // 0, 1, 2, 3, 4
}
```

### Enhanced For Loop (For-Each)

Preferred for iterating over collections:

```java
int[] numbers = {1, 2, 3, 4, 5};
for (int number : numbers) {
    System.out.println(number);
}

List<String> names = List.of("Alice", "Bob", "Charlie");
for (String name : names) {
    System.out.println(name);
}
```

<div class="callout concept" markdown="1">
<div class="callout-title"><span>💡</span>What the Enhanced For Loop Really Does</div>

The enhanced for-loop isn't special syntax tied to arrays and `List` — it works on **anything that implements `Iterable<T>`**. The compiler rewrites `for (String name : names)` into calls to `names.iterator()`, then repeatedly calls `hasNext()` and `next()` on the returned `Iterator<String>`. `names.forEach(...)` is just a method that does this same loop internally. See [Arrays, Iterators & Conversions](../17-arrays-iterators-and-conversions/) for how `Iterable`, `Iterator`, and fail-fast behavior actually work under the hood.
</div>

### While Loop

```java
int count = 0;
while (count < 5) {
    System.out.println(count);
    count++;
}

// Do-while: executes at least once
int i = 0;
do {
    System.out.println(i);
    i++;
} while (i < 5);
```

### Stream API (Functional, Preferred)

Modern Java prefers streams over loops for collection processing:

```java
List<String> names = List.of("Alice", "Bob", "Charlie");

// Traditional loop
for (String name : names) {
    System.out.println(name);
}

// Stream-based (preferred in modern code)
names.forEach(System.out::println);

// Stream with transformation
names.stream()
    .map(String::toUpperCase)
    .forEach(System.out::println);
```

### Break and Continue

```java
for (int i = 0; i < 10; i++) {
    if (i == 5) break;  // Exit loop
    if (i == 2) continue;  // Skip to next iteration
    System.out.println(i);  // Prints 0, 1, 3, 4
}
```

### Labeled Break and Continue

A plain `break`/`continue` only affects the **innermost** loop. To control an outer loop from inside a nested one, label the outer loop:

```java
outer:
for (int row = 0; row < 3; row++) {
    for (int col = 0; col < 3; col++) {
        if (col == 1 && row == 1) {
            break outer;   // Exits BOTH loops immediately, not just the inner one
        }
        System.out.println(row + "," + col);
    }
}
// Output: 0,0  0,1  0,2  1,0   then stops entirely

search:
for (int row = 0; row < 3; row++) {
    for (int col = 0; col < 3; col++) {
        if (col == row) {
            continue search;  // Skips to the NEXT iteration of the outer loop
        }
        System.out.println(row + "," + col);
    }
}
```

Without the label, `break`/`continue` inside the inner loop has no way to affect the outer one directly.

<div class="callout warning" markdown="1">
<div class="callout-title"><span>⚠️</span>Loop Pitfall</div>

Modifying a collection while looping can cause `ConcurrentModificationException`:

```java
// WRONG
List<String> names = new ArrayList<>(List.of("Alice", "Bob"));
for (String name : names) {
    if (name.equals("Bob")) {
        names.remove(name);  // ConcurrentModificationException!
    }
}

// CORRECT – Use iterator or stream
List<String> names = new ArrayList<>(List.of("Alice", "Bob"));
names.removeIf(name -> name.equals("Bob"));

// Or use iterator
Iterator<String> it = names.iterator();
while (it.hasNext()) {
    if (it.next().equals("Bob")) {
        it.remove();  // Safe
    }
}
```

</div>

---

## Arrays

### Creating Arrays

```java
// Specify size
int[] numbers = new int[5];  // Contains: 0, 0, 0, 0, 0

// Initialize with values
int[] values = {10, 20, 30, 40, 50};
String[] names = {"Alice", "Bob", "Charlie"};

// Multi-dimensional
int[][] matrix = new int[3][3];
matrix[0][0] = 1;

// Jagged arrays (rows can have different lengths)
int[][] jagged = new int[3][];
jagged[0] = new int[2];
jagged[1] = new int[5];
jagged[2] = new int[3];
```

### Array Length

```java
int[] numbers = {1, 2, 3};
System.out.println(numbers.length);  // 3

// For 2D array
int[][] matrix = new int[3][4];
System.out.println(matrix.length);      // 3 (rows)
System.out.println(matrix[0].length);   // 4 (columns)
```

### Iterating Arrays

```java
int[] numbers = {1, 2, 3, 4, 5};

// Traditional for
for (int i = 0; i < numbers.length; i++) {
    System.out.println(numbers[i]);
}

// Enhanced for
for (int number : numbers) {
    System.out.println(number);
}

// Streams (modern)
Arrays.stream(numbers)
    .forEach(System.out::println);
```

### Arrays Utility Class

```java
int[] numbers = {3, 1, 4, 1, 5};

// Sorting
Arrays.sort(numbers);  // Sorts in-place

// Searching (requires sorted array)
int index = Arrays.binarySearch(numbers, 4);

// Convert to List
List<Integer> list = Arrays.asList(1, 2, 3);

// Equality
int[] a = {1, 2, 3};
int[] b = {1, 2, 3};
System.out.println(Arrays.equals(a, b));  // true
System.out.println(a.equals(b));  // false – arrays use reference equality
```

---

## Common Mistakes

### Mistake 1: Confusing Primitives and Wrapper Types

```java
// WRONG – inefficient boxing/unboxing
Integer count = 0;
count++;  // Unbox to int, increment, box to Integer

// CORRECT – use primitive for calculation
int count = 0;
count++;  // Direct operation on primitive

// Wrapper types are useful for collections
List<Integer> numbers = new ArrayList<>();  // OK
```

### Mistake 2: Floating Point Equality

```java
// WRONG
double a = 0.1 + 0.2;
double b = 0.3;
if (a == b) {  // false! Due to precision loss
    System.out.println("Equal");
}

// CORRECT
double delta = 0.0001;
if (Math.abs(a - b) < delta) {
    System.out.println("Equal enough");
}

// BEST – use BigDecimal for precision
BigDecimal a = new BigDecimal("0.1").add(new BigDecimal("0.2"));
BigDecimal b = new BigDecimal("0.3");
if (a.equals(b)) {
    System.out.println("Equal");
}
```

### Mistake 3: Mutable Default Values

```java
public class Config {
    private static List<String> hosts = new ArrayList<>();
    
    public static List<String> getHosts() {
        return hosts;  // WRONG – caller can modify!
    }
}

// Caller modifies the internal state
Config.getHosts().add("evil.com");

// CORRECT – return immutable view
public static List<String> getHosts() {
    return Collections.unmodifiableList(hosts);
}

// Or return a copy
public static List<String> getHosts() {
    return new ArrayList<>(hosts);
}
```

---

## When to Use

**Primitives**: 
- Numeric calculations
- Boolean flags
- Character data
- Performance-critical code

**Reference Types**:
- Complex data structures
- Objects with behavior
- When you need `null`
- Collections

**Arrays**:
- Fixed-size collections of primitives
- When performance is critical
- Multi-dimensional data

---

## Summary

- **JVM/JRE/JDK**: JVM executes bytecode. JRE is JVM + libraries. JDK is JRE + development tools.
- **Compilation**: Java source is compiled to bytecode, which runs on any JVM.
- **Primitives**: 8 simple types (int, double, boolean, etc.). Stack-allocated, very fast.
- **References**: Classes, arrays, etc. Heap-allocated, can be null.
- **Variables**: Use `var` for local variables when type is obvious. Use `final` for immutability.
- **Control flow**: Prefer switch expressions over traditional switch in Java 14+.
- **Loops**: Use enhanced for and streams in modern Java.
- **Arrays**: Reference type with fixed size. Use Collections for flexibility.

---

## Further Reading

- [Baeldung – Java Syntax](https://www.baeldung.com/java-syntax){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Java Primitives](https://www.baeldung.com/java-primitives){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Main Method](https://www.baeldung.com/java-main-method){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Control Structures](https://www.baeldung.com/java-control-structures){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Loops](https://www.baeldung.com/java-loops){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Arrays Guide](https://www.baeldung.com/java-arrays-guide){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Java Packages](https://www.baeldung.com/java-packages){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Pass-by-Value or Pass-by-Reference](https://www.baeldung.com/java-pass-by-value-or-pass-by-reference){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Varargs in Java](https://www.baeldung.com/java-varargs){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Java Switch Statement](https://www.baeldung.com/java-switch){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – The Enhanced For-Each Loop](https://www.baeldung.com/foreach-java){:target="_blank" rel="noopener noreferrer"}
- [Oracle Java Tutorials – Language Basics](https://docs.oracle.com/javase/tutorial/java/nutsandbolts/index.html){:target="_blank" rel="noopener noreferrer"}

---

<div class="chapter-nav">
<a href="{{ '/docs/00-java-project-setup' | relative_url }}" class="btn btn-secondary">← Previous: Java Project Setup</a>
<div class="chapter-nav-spacer"></div>
<a href="{{ '/docs/02-object-oriented-java' | relative_url }}" class="btn">Next: Object-Oriented Java →</a>
</div>
