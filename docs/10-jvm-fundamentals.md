---
layout: default
title: JVM Fundamentals
subtitle: Understanding the Java Virtual Machine, bytecode, memory, and execution
type: docs
---

## The JVM Execution Pipeline

### From Source to Execution

```
Java Source Code (.java)
    ↓
javac Compiler
    ↓
Java Bytecode (.class file)
    ↓
JVM Class Loader
    ↓
Bytecode Verifier (safety checks)
    ↓
JIT Compiler (optional)
    ↓
Native Machine Code
    ↓
CPU Executes
```

---

## Bytecode

### What Is Bytecode?

Bytecode is an intermediate representation between Java source and machine code:
- **Platform-independent** – same bytecode runs on any JVM
- **Compact** – smaller than source code
- **Verifiable** – JVM checks safety before execution
- **Optimizable** – JVM can optimize at runtime

### Example Bytecode

Java source:

```java
public class Simple {
    public int add(int a, int b) {
        return a + b;
    }
}
```

Compiled bytecode (from `javap -c Simple.class`):

```
public int add(int, int);
  Code:
    0: iload_1      // Load first parameter to stack
    1: iload_2      // Load second parameter to stack
    2: iadd         // Add two ints on stack
    3: ireturn      // Return result
```

---

## Stack vs Heap

### The Stack

- **Stores**: Primitive values and references to objects
- **Size**: Fixed (usually smaller)
- **Speed**: Very fast
- **Lifetime**: Deallocated when method exits
- **Thread**: Each thread has its own stack

```java
public void method() {
    int count = 5;           // Stack: stores primitive value 5
    String name = "Alice";   // Stack: stores reference to string
    List list = new ArrayList();  // Stack: stores reference
}
// When method exits: count and name removed from stack
```

### The Heap

- **Stores**: Objects and arrays
- **Size**: Larger (can grow)
- **Speed**: Slower than stack
- **Lifetime**: Managed by garbage collector
- **Shared**: Shared among all threads

```java
public void method() {
    String name = "Alice";
    // Stack has reference to String
    // Heap has the actual String object "Alice"
    
    List<String> list = new ArrayList<>();
    list.add("item");
    // Stack has reference to ArrayList
    // Heap has the ArrayList object and its items
}
```

### Memory Layout

```
STACK (per thread)              HEAP (shared)
┌──────────────────┐           ┌──────────────────┐
│ int count = 5    │           │ "Alice"          │
├──────────────────┤           │ (String object)  │
│ String name ──┐  │           │                  │
│ (reference)   │  │           │ ArrayList        │
└──────────────────┘           │ (object + items) │
       ↑                        └──────────────────┘
       │
      Reference points to heap
```

### Key Differences

| Aspect | Stack | Heap |
|--------|-------|------|
| Storage | Primitives, references | Objects, arrays |
| Speed | Very fast | Slower |
| Size | Limited | Larger |
| Thread | Per-thread | Shared |
| Deallocation | Automatic | Garbage collected |
| Overflow | StackOverflowError | OutOfMemoryError |

---

## Garbage Collection

### How It Works

Java automatically manages memory. Objects no longer referenced are garbage collected:

```java
public void example() {
    String a = new String("Hello");  // Created on heap
    String b = a;                     // Both point to same object
    a = null;                         // a no longer references object
    b = null;                         // Object now unreachable
    
    // Garbage collector will reclaim this memory
}
```

### Mark-Sweep Algorithm (Simplified)

1. **Mark**: Identify reachable objects
2. **Sweep**: Deallocate unreachable objects
3. **Compact**: Rearrange remaining objects (optional)

### Generational GC

Modern JVMs use generational collection:

```
Young Generation: Short-lived objects
  ├── Eden Space: New objects created here
  ├── Survivor Space 1
  └── Survivor Space 2

Old Generation: Long-lived objects
  └── Tenured Space
```

Young generation is collected frequently (fast). Old generation less frequently.

### Tuning GC

```bash
# Set heap size
java -Xms1G -Xmx4G MyApp
# Xms: initial heap (1GB)
# Xmx: maximum heap (4GB)

# Specify garbage collector
java -XX:+UseG1GC MyApp  # G1 (good default)
java -XX:+UseSerialGC MyApp  # Serial (single-threaded)
java -XX:+UseParallelGC MyApp  # Parallel (multi-threaded)
java -XX:+UseConcMarkSweepGC MyApp  # CMS (concurrent)
```

---

## Class Loading

### Class Loader Hierarchy

```
Bootstrap Class Loader
  ├─ Loads core JDK classes (java.lang, java.util, etc.)
  └─ Part of JVM itself

Platform Class Loader (Java 9+)
  ├─ Loads Java SE platform classes
  └─ Replaces Extension Class Loader

Application Class Loader
  └─ Loads application and 3rd-party classes (your classes)
```

### Loading Process

1. **Loading**: Read .class file, create Class object
2. **Linking**: 
   - Verify: Check bytecode validity
   - Prepare: Allocate memory for static fields
   - Resolve: Replace symbolic references with actual references
3. **Initialization**: Execute static initializers

```java
public class Example {
    static {
        System.out.println("Static initializer runs during class loading");
    }
    
    static int count = 5;  // Initialized during class loading
    
    public Example() {
        System.out.println("Constructor runs during object creation");
    }
}

// Loading happens once:
Example e1 = new Example();  // Static init runs, then constructor
Example e2 = new Example();  // Only constructor runs
```

### Lazy Loading

Classes are loaded only when needed:

```java
public class Container {
    static class ExpensiveClass {
        static {
            System.out.println("Loading expensive class");
        }
    }
}

// ExpensiveClass not loaded yet
Container c = new Container();

// Now it's loaded
Container.ExpensiveClass obj = new Container.ExpensiveClass();
```

---

## Method Execution

### Stack Frame

When a method is called, a stack frame is created:

```
Stack Frame Structure:
┌─────────────────────┐
│ Local Variables     │ (method parameters, local vars)
├─────────────────────┤
│ Operand Stack       │ (values being computed)
├─────────────────────┤
│ Constant Pool Ref   │ (references to constants)
├─────────────────────┤
│ Return Address      │ (where to return after method)
└─────────────────────┘
```

### Method Call Stack

```java
public class Calculator {
    public int calculate(int a, int b) {
        return add(a, b) * 2;
    }
    
    private int add(int x, int y) {
        return x + y;
    }
}

// Call stack:
// calculate()
//   └─ add()
```

### Stack Overflow

```java
// WRONG – infinite recursion
public int badRecursion(int n) {
    return badRecursion(n + 1);  // Never ends
}

// Each call adds stack frame, stack eventually overflows
// Result: StackOverflowError

// CORRECT – base case
public int goodRecursion(int n) {
    if (n == 0) return 0;  // Base case
    return n + goodRecursion(n - 1);
}
```

---

## Just-In-Time (JIT) Compilation

### How JIT Works

Modern JVMs don't just interpret bytecode – they compile it to native code:

```
First execution:     Interpreter (fast startup)
Later executions:    JIT-compiled native code (fast execution)

Bytecode → JIT Compiler → Native Code (for x86, ARM, etc.)
```

### Hotspot Detection

JVM tracks which methods are called frequently ("hot"):

```java
for (int i = 0; i < 10000; i++) {
    expensiveMethod();  // Called 10,000 times
}

// JVM detects hotspot and JIT-compiles expensiveMethod
// Subsequent calls run as native code (much faster)
```

### Implications

- **Warmup time**: Application might be slow initially
- **Optimization**: JVM optimizes based on actual usage patterns
- **Profiling**: Profile with sufficient warmup to see realistic performance

---

## Common Runtime Errors

### NullPointerException

```java
String name = null;
name.length();  // NullPointerException
```

### ClassNotFoundException

```java
Class.forName("NonExistentClass");  // ClassNotFoundException
```

### OutOfMemoryError

```java
// WRONG – creates infinite list
List<String> list = new ArrayList<>();
while (true) {
    list.add("item");  // Eventually OutOfMemoryError
}
```

### StackOverflowError

```java
// WRONG – infinite recursion
public void infinite() {
    infinite();  // StackOverflowError
}
```

---

## Performance Considerations

### Understanding Performance

```java
// Premature optimization is evil, but understanding helps:

// Object allocation (relatively cheap due to pool allocation)
Object obj = new Object();

// String concatenation (creates multiple strings)
String result = a + b + c;  // Creates temp strings

// String with StringBuilder (efficient)
StringBuilder sb = new StringBuilder();
sb.append(a).append(b).append(c);
String result = sb.toString();
```

### Profiling

```bash
# Run with profiler
java -XX:+UnlockDiagnosticVMOptions -XX:+TraceClassLoading MyApp

# JMH (Java Microbenchmark Harness) for detailed performance testing
# Example: compare ArrayList vs LinkedList performance
```

---

## Summary

- **JVM**: Platform-independent virtual machine executing bytecode
- **Bytecode**: Intermediate representation, platform-independent
- **Stack**: Stores primitives and references (per-thread, fast, limited)
- **Heap**: Stores objects (shared, slower, larger, garbage-collected)
- **Garbage Collection**: Automatic memory management
- **Class Loading**: Bootstrap → Platform → Application class loaders
- **JIT Compilation**: Bytecode compiled to native code for performance
- **Stack Frame**: Created for each method call with local variables and operand stack

---

## Further Reading

- [Baeldung – JVM vs JRE vs JDK](https://www.baeldung.com/jvm-vs-jre-vs-jdk){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Stack vs Heap](https://www.baeldung.com/java-stack-heap){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Class Loaders](https://www.baeldung.com/java-classloaders){:target="_blank" rel="noopener noreferrer"}
- [Oracle JVM Specification](https://docs.oracle.com/javase/specs/jvms/se21/html/index.html){:target="_blank" rel="noopener noreferrer"}

---

<div class="chapter-nav">
<a href="{{ '/docs/09-java-io' | relative_url }}" class="btn btn-secondary">← Previous: Java IO</a>
<div class="chapter-nav-spacer"></div>
<a href="{{ '/docs/11-exercises' | relative_url }}" class="btn">Next: Exercises →</a>
</div>
