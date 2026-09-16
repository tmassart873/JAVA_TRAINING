---
layout: default
title: Modules, Reflection & Java 21
subtitle: The Java Platform Module System, runtime reflection, and Java 21's simplified entry point
type: docs
quiz:
  - question: "What file declares a Java module's configuration?"
    options: ["module.xml", "module-info.java", "MANIFEST.MF", "package-info.java"]
    answer: 1
  - question: "What does 'exports com.example.api;' in a module-info.java do?"
    options: ["Makes every package in the module public", "Makes the com.example.api package's public types accessible to other modules that require this module", "Deletes the package", "Exports the module to a file"]
    answer: 1
  - question: "What is Class.forName(\"com.example.Foo\").getDeclaredMethods() used for?"
    options: ["Compiling the Foo class", "Inspecting Foo's methods at runtime via reflection, including private ones", "Only public methods can ever be retrieved this way", "Creating a new instance of Foo automatically"]
    answer: 1
  - question: "Why is reflection generally considered risky to overuse?"
    options: ["It's always slower and has no benefits", "It bypasses compile-time type checking and encapsulation (via setAccessible), making code harder to verify, refactor safely, and reason about", "It only works with abstract classes", "It cannot access private fields at all"]
    answer: 1
  - question: "What does Java 21's implicitly declared class / instance main method feature (preview) simplify?"
    options: ["It removes the need for a main method entirely", "It lets a minimal program skip the 'public class X' wrapper and 'static' keyword on main, reducing boilerplate for beginners and small scripts", "It makes all classes public by default", "It replaces the JVM with an interpreter"]
    answer: 1
---

## Why This Matters

The Java Platform Module System (JPMS, introduced in Java 9) and reflection both operate "around" the normal class/object model you've learned so far — modules control what's visible *between* compiled units, while reflection lets code inspect and manipulate classes *at runtime*, bypassing the usual compile-time rules. Java 21 also introduced a simplified program structure aimed at reducing the ceremony beginners hit on day one. None of these come up in every project, but understanding them fills real gaps: module errors in larger codebases, frameworks that rely on reflection (like most dependency injection and ORM libraries), and modern teaching-oriented Java syntax.

---

## Table of Contents
- [The Java Platform Module System](#the-java-platform-module-system)
- [Reflection](#reflection)
- [Java 21: Unnamed Classes and Instance main Methods](#java-21-unnamed-classes-and-instance-main-methods)

---

## The Java Platform Module System

Before Java 9, the unit of reuse was the JAR file — a bag of packages with no way to express "this package is internal, don't use it from outside" beyond convention (like naming a package `internal`). JPMS adds a real, enforced boundary: **modules**, declared by a `module-info.java` file at the root of a module's source tree.

```java
// module-info.java
module com.example.orders {
    requires java.sql;                    // This module depends on the java.sql module
    requires transitive com.example.core; // Consumers of this module also get com.example.core

    exports com.example.orders.api;       // Only this package's public types are visible outside
    // com.example.orders.internal is NOT exported — invisible to other modules, even if public
}
```

### Key Directives

```java
module com.example.app {
    requires com.example.orders;   // "I need this module to compile/run"
    requires static com.example.tools;  // Compile-time only dependency — not required at runtime
    exports com.example.app.api;   // "My package is usable by whoever requires me"
    exports com.example.app.spi to com.example.plugin;  // Exported to ONE specific module only
    opens com.example.app.model;   // Allows reflective access (see below) even without exporting
    uses com.example.app.spi.Extension;  // "I consume this service interface" (see ServiceLoader)
    provides com.example.app.spi.Extension with com.example.app.impl.DefaultExtension;  // "I provide an implementation"
}
```

<div class="callout concept" markdown="1">
<div class="callout-title"><span>💡</span>exports vs. opens</div>

`exports` makes a package's public API visible to code that `requires` the module — normal compile-time and runtime access. `opens` is specifically for **reflective** access (frameworks like Hibernate or Spring that need to read/set private fields via reflection) without also granting normal compile-time visibility. A package can be `opens`-only (reflection-only, no direct compile-time use) or both.
</div>

### Why Modules Matter in Practice

The most common real-world encounter with JPMS is an error message — `module X does not export package Y to module Z` — when a library tries to reflectively access another module's internals without an `opens` declaration. This is intentional: JPMS's main goal was **strong encapsulation**, closing off the widespread pre-Java-9 practice of libraries reaching into JDK internals (`sun.misc.*` and similar) via reflection, which made JDK internals nearly impossible to change without breaking the ecosystem.

Most everyday application code (especially anything using a build tool with the classic unnamed classpath) never writes a `module-info.java` at all — JPMS matters most for library authors and large modular codebases.

---

## Reflection

Reflection lets code inspect classes, fields, methods, and constructors **at runtime**, and even invoke or modify them — bypassing the normal compile-time-checked way of writing `object.method()`.

```java
public class Product {
    private String name = "Widget";
    private double price = 9.99;

    private void applyDiscount(double percent) {
        price -= price * (percent / 100);
    }
}

// Getting a Class object three ways
Class<?> clazz1 = Product.class;                          // Class literal — most common, compile-time safe
Class<?> clazz2 = someProductInstance.getClass();          // From an existing instance
Class<?> clazz3 = Class.forName("com.example.Product");    // From a fully-qualified name string — the only
                                                             // option when the class name is only known at runtime

// Inspecting fields and methods
Field[] fields = clazz1.getDeclaredFields();    // Includes private fields (getFields() would not)
Method[] methods = clazz1.getDeclaredMethods(); // Includes private methods

for (Field field : fields) {
    System.out.println(field.getName() + ": " + field.getType());
}
```

### Reading and Setting Private State

```java
Product product = new Product();
Field priceField = Product.class.getDeclaredField("price");
priceField.setAccessible(true);   // Bypasses the normal private access check!

double currentPrice = (double) priceField.get(product);   // Read a private field
priceField.set(product, 19.99);                             // Write a private field

Method discountMethod = Product.class.getDeclaredMethod("applyDiscount", double.class);
discountMethod.setAccessible(true);
discountMethod.invoke(product, 10.0);   // Calls the private applyDiscount(10.0) from outside the class
```

### Real-World Use Cases

- **Dependency injection frameworks** (Spring, CDI) — instantiate classes and inject fields without the application code calling `new` directly.
- **ORMs** (Hibernate, JPA) — populate entity fields from database rows, including private ones, without requiring public setters for every column.
- **Serialization libraries** (Jackson, Gson) — read/write object fields to/from JSON without every field needing a public getter/setter.
- **Testing frameworks** — JUnit uses reflection to discover and invoke `@Test`-annotated methods.

<div class="callout warning" markdown="1">
<div class="callout-title"><span>⚠️</span>Reflection's Costs: Use It Sparingly in Application Code</div>

Reflection trades away several things you normally get for free:

- **Compile-time safety** — a typo in a field/method name string is a `NoSuchFieldException` at runtime, not a compile error.
- **Encapsulation** — `setAccessible(true)` can read/write `private` state from outside the class entirely, defeating the whole point of access modifiers.
- **Performance** — reflective calls are significantly slower than direct calls (though the JIT narrows this gap somewhat for hot paths).
- **Refactoring safety** — renaming a field/method with an IDE won't update a reflective string lookup of that name.

Reach for reflection when you're building a framework/library that genuinely needs runtime introspection — avoid it in ordinary application business logic, where a direct method call or a well-designed interface almost always works better.
</div>

---

## Java 21: Unnamed Classes and Instance main Methods

Every Java program traditionally requires this ceremony before printing anything, which is a lot of unexplained syntax for a first program:

```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

Java 21 previewed (finalized as a permanent feature in later JDK releases) a simplified structure specifically aimed at reducing this beginner-facing boilerplate:

```java
// A file named Hello.java, with NO class declaration and NO "static" on main:
void main() {
    System.out.println("Hello, World!");
}
```

This works because of two related features:

- **Unnamed classes** — the compiler implicitly wraps top-level members (like `main`) in an invisible, unnamed class, so you don't need to write `public class Hello { ... }` explicitly for a simple single-file program.
- **Instance main methods** — `main` no longer needs to be `static`; the JVM creates an instance of the implicit class and calls `main` on it, and `main` can also skip the `String[] args` parameter entirely if it's unused.

```java
// You can still use fields and other methods normally within the unnamed class
int counter = 0;

void main() {
    increment();
    System.out.println("Counter: " + counter);
}

void increment() {
    counter++;
}
```

<div class="callout concept" markdown="1">
<div class="callout-title"><span>💡</span>Why This Exists: Lowering the Beginner Barrier</div>

Explaining `public static void main(String[] args)` to someone on day one of learning Java requires explaining access modifiers, static vs. instance, arrays, and the entry-point convention — all before they've written a single line of "real" logic. This feature (and the closely related simplified `System.out.println` → eventually just needing an implicit import in some tooling) exists purely to let beginners and quick scripts start with minimal ceremony, while the traditional full form remains exactly as valid and is still what real multi-class applications use.
</div>

<div class="callout warning" markdown="1">
<div class="callout-title"><span>⚠️</span>Preview Feature — Check Your JDK Version</div>

This feature was introduced as a **preview** in JDK 21 (requiring `--enable-preview` to compile and run) and refined across subsequent JDK preview cycles before finalization. If you try this on JDK 21 without the preview flag, or on an older JDK, it won't compile. Always check which JDK version your project targets before relying on very recent syntax like this in real code.
</div>

---

## Common Mistakes

### Mistake 1: Forgetting opens When a Framework Needs Reflective Access

If a module isn't `opens`ed (or exported) to a framework attempting reflective field access, you'll see `InaccessibleObjectException` at runtime, even though the code compiles fine — modules and reflection interact in ways that only surface when the JVM actually runs.

### Mistake 2: Reaching for Reflection When a Simpler Design Would Do

Before writing reflective code to "flexibly" call a method by name, ask whether a plain interface with a normal method call, or a `Map<String, Runnable>` dispatch table, would solve the same problem with none of reflection's downsides.

### Mistake 3: Assuming setAccessible(true) Always Succeeds

Under the module system's strong encapsulation, `setAccessible(true)` can itself throw `InaccessibleObjectException` if the target module hasn't opened the relevant package — reflection is no longer an unconditional escape hatch the way it was in pre-modular Java.

---

## Summary

- **JPMS** (`module-info.java`) adds enforced boundaries between compiled units: `requires` declares dependencies, `exports` makes a package's public API visible, `opens` permits reflective access.
- **Reflection** inspects and manipulates classes/fields/methods at runtime via `Class`, `Field`, `Method` — powerful, but at the cost of compile-time safety, encapsulation, and performance.
- Frameworks (DI, ORMs, serializers, test runners) are reflection's primary legitimate use case — avoid it in everyday application logic.
- **Java 21's unnamed classes and instance main methods** let a minimal program skip the `public class`/`static` ceremony, aimed at lowering the barrier for beginners and quick scripts — introduced as a preview feature, so check your JDK version.

---

## Further Reading

- [Baeldung – Java 9 Modularity](https://www.baeldung.com/java-9-modularity){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Guide to Java Reflection](https://www.baeldung.com/java-reflection){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Java 21 Unnamed Classes and Instance Main Methods](https://www.baeldung.com/java-21-unnamed-classes-instance-main){:target="_blank" rel="noopener noreferrer"}
- [Oracle – The Java Platform Module System](https://docs.oracle.com/javase/9/docs/api/java/lang/module/package-summary.html){:target="_blank" rel="noopener noreferrer"}

---

<div class="chapter-nav">
<a href="{{ '/docs/10-jvm-fundamentals' | relative_url }}" class="btn btn-secondary">← Previous: JVM Fundamentals</a>
<div class="chapter-nav-spacer"></div>
<a href="{{ '/docs/11-exercises' | relative_url }}" class="btn">Next: Practical Exercises →</a>
</div>
