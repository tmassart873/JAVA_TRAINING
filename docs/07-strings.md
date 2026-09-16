---
layout: default
title: Strings
subtitle: String immutability, the String pool, and string operations
type: docs
quiz:
  - question: "Once created, can the contents of a String object be changed?"
    options: ["Yes, always", "No, Strings are immutable", "Only with reflection", "Only inside the same package"]
    answer: 1
  - question: "Which class should you use to build a string efficiently in a loop?"
    options: ["String", "StringBuilder", "StringPool", "CharArray"]
    answer: 1
  - question: "What is the correct way to compare the content of two Strings?"
    options: ["Using ==", "Using .equals()", "Using instanceof", "Using .hashCode() == .hashCode()"]
    answer: 1
  - question: "What does \"apple\".compareTo(\"banana\") return?"
    options: ["true", "A negative number, because 'a' comes before 'b' lexicographically", "0", "A positive number"]
    answer: 1
  - question: "Why is Objects.equals(a, b) often safer than a.equals(b)?"
    options: ["It's faster", "It handles the case where 'a' is null without throwing a NullPointerException", "It ignores case differences", "There is no difference"]
    answer: 1
  - question: "If a class doesn't override toString(), what does calling it on an instance print?"
    options: ["An empty string", "The class name plus '@' plus the object's hex hash code, e.g. Customer@1b6d3586", "null", "A compile error"]
    answer: 1
---

## String Immutability

### The Concept

Strings in Java are immutable – once created, they cannot be changed:

```java
String name = "Alice";
String updated = name.toUpperCase();  // Creates NEW string

System.out.println(name);     // "Alice" – unchanged
System.out.println(updated);  // "ALICE" – new string

// 'name' still refers to original "Alice"
```

### Memory Picture

```
String name = "Alice";
String upper = name.toUpperCase();

Memory:
┌──────────────────┐
│ "Alice"          │ ← name points here
└──────────────────┘

┌──────────────────┐
│ "ALICE"          │ ← upper points here
└──────────────────┘
```

### Why Immutability Matters

1. **Thread safety** – Strings are safe to share between threads
2. **Security** – String data can't be modified unexpectedly
3. **Caching** – JVM can reuse strings safely
4. **Performance** – Hashing is stable

---

## String Pool

### What Is It?

The String pool is a special memory region where Java keeps unique string literals:

```java
// Both reference same object in pool
String a = "hello";
String b = "hello";

System.out.println(a == b);  // true – same object!

// Created with 'new' goes to heap, not pool
String c = new String("hello");

System.out.println(a == c);  // false – different objects
System.out.println(a.equals(c));  // true – same content
```

### Visualization

```
String Pool (special memory)
┌────────────────┐
│ "hello"        │ ← a and b both point here
│ "world"        │
│ ...            │
└────────────────┘

Heap (general memory)
┌────────────────┐
│ "hello"        │ ← c points here (separate object)
└────────────────┘
```

### String Intern

Explicitly add a string to the pool:

```java
String c = new String("hello");
String pooled = c.intern();  // Now in pool

String a = "hello";
System.out.println(a == pooled);  // true – same pool object
```

---

## String Comparison

### == vs equals()

```java
// Reference equality (wrong for comparing values)
String a = new String("hello");
String b = new String("hello");
System.out.println(a == b);  // false

// Value equality (correct)
System.out.println(a.equals(b));  // true

// Case-insensitive comparison
System.out.println(a.equalsIgnoreCase("HELLO"));  // true

// Containment
System.out.println(a.contains("ell"));  // true

// Starts/Ends with
System.out.println(a.startsWith("he"));  // true
System.out.println(a.endsWith("lo"));    // true
```

### Ordering: compareTo() and compareToIgnoreCase()

`String` implements `Comparable<String>`, comparing lexicographically (dictionary order, based on Unicode code points) — this is what powers `Collections.sort()` on a `List<String>` by default:

```java
System.out.println("apple".compareTo("banana"));  // Negative — "apple" comes before "banana"
System.out.println("banana".compareTo("apple"));  // Positive — "banana" comes after "apple"
System.out.println("apple".compareTo("apple"));   // 0 — equal

System.out.println("Apple".compareTo("apple"));   // Negative — uppercase letters sort before lowercase (Unicode value)
System.out.println("Apple".compareToIgnoreCase("apple"));  // 0 — case-insensitive comparison
```

For sorting a list of strings case-insensitively without permanently changing the strings themselves, use a `Comparator`:

```java
List<String> names = new ArrayList<>(List.of("bob", "Alice", "charlie"));
names.sort(String.CASE_INSENSITIVE_ORDER);                 // Built-in case-insensitive Comparator
// or equivalently:
names.sort(Comparator.comparing(String::toLowerCase));
```

### Null-Safe Comparison With Objects.equals()

Calling `.equals()` directly on a value that might be `null` throws `NullPointerException`. `java.util.Objects` provides a null-safe alternative:

```java
String a = null;
String b = "hello";

// a.equals(b);                 // NullPointerException!
System.out.println(Objects.equals(a, b));  // false — handles null gracefully, no exception
System.out.println(Objects.equals(null, null));  // true — both null counts as equal
```

`Objects.equals(a, b)` is exactly equivalent to `(a == b) || (a != null && a.equals(b))` — it's a small utility, but it's the idiomatic way to write null-tolerant equality checks, and (as seen in [equals() & hashCode()](../04-equals-hashcode/)) it's what generated `equals()` implementations typically use internally for nullable fields.

---

## String Operations

### Create Strings

```java
// String literal
String literal = "hello";

// Constructor
String fromChars = new String(new char[]{'h', 'e', 'l', 'l', 'o'});

// valueOf
String fromInt = String.valueOf(42);
String fromDouble = String.valueOf(3.14);
String fromBoolean = String.valueOf(true);

// Static factory (Java 11+)
String repeated = "ha".repeat(3);  // "hahaha"
```

### Modify Strings (Create New)

```java
String original = "Hello World";

// Case
String upper = original.toUpperCase();
String lower = original.toLowerCase();

// Substrings
String sub = original.substring(0, 5);  // "Hello"
String from = original.substring(6);    // "World"

// Replace
String replaced = original.replace("World", "Java");  // Exact match
String regexReplaced = original.replaceAll("\\d+", "X");  // Regex

// Trim whitespace
String trimmed = "  hello  ".trim();  // "hello"

// Split
String[] parts = "apple,banana,orange".split(",");
// ["apple", "banana", "orange"]

// Join (Java 8+)
String joined = String.join(", ", "apple", "banana", "orange");
// "apple, banana, orange"

// Reverse
String reversed = new StringBuilder(original).reverse().toString();
```

### Query Strings

```java
String text = "hello world";

// Length
int len = text.length();  // 11

// Character at position
char c = text.charAt(0);  // 'h'

// Index of substring
int index = text.indexOf("world");  // 6
int lastIndex = text.lastIndexOf("l");  // 9

// Check empty
boolean empty = "".isEmpty();  // true
boolean blank = "  ".isBlank();  // true (Java 11+)
```

---

## StringBuilder

### The Problem

Strings are immutable. Each concatenation creates a new string:

```java
// Creates 5 string objects!
String result = "";
result += "a";  // Creates "a"
result += "b";  // Creates "ab"
result += "c";  // Creates "abc"
result += "d";  // Creates "abcd"
result += "e";  // Creates "abcde"
```

### The Solution

`StringBuilder` is mutable and efficient:

```java
StringBuilder sb = new StringBuilder();
sb.append("a");
sb.append("b");
sb.append("c");
sb.append("d");
sb.append("e");

String result = sb.toString();  // Only creates one final string
```

### When to Use StringBuilder

```java
// Good
StringBuilder sb = new StringBuilder();
for (String item : items) {
    sb.append(item).append(", ");
}
String result = sb.toString();

// OK – compiler optimizes concatenation in loop
String result = "";
for (String item : items) {
    result += item + ", ";  // Compiler uses StringBuilder behind scenes
}

// Avoid
String a = "hello";
String b = "world";
String result = a + b;  // Fine – just two objects

// Don't use in one-off concatenation
StringBuilder sb = new StringBuilder();
sb.append("hello");
sb.append("world");
String result = sb.toString();  // Overkill for one concatenation
```

### StringJoiner (Convenient Alternative)

```java
StringJoiner joiner = new StringJoiner(", ", "[", "]");
joiner.add("apple");
joiner.add("banana");
joiner.add("orange");

System.out.println(joiner);  // [apple, banana, orange]

// Or use String.join()
String result = String.join(", ", "apple", "banana");
```

---

## String Formatting

### String.format()

```java
String formatted = String.format("Hello, %s! You are %d years old.", "Alice", 30);
// "Hello, Alice! You are 30 years old."

// Common format specifiers
String.format("%s", "text");        // String
String.format("%d", 42);            // Integer
String.format("%f", 3.14);          // Double
String.format("%x", 255);           // Hexadecimal
String.format("%b", true);          // Boolean
```

### System.out.printf()

```java
System.out.printf("Name: %s, Age: %d%n", "Alice", 30);
// %n is newline
```

### Text Blocks (Java 15+)

```java
String html = """
    <html>
        <head><title>Page</title></head>
        <body>Hello!</body>
    </html>
    """;
```

---

## String Conversion

### To Other Types

```java
// String to int
int number = Integer.parseInt("42");

// String to double
double decimal = Double.parseDouble("3.14");

// String to boolean
boolean flag = Boolean.parseBoolean("true");

// String to char[]
char[] chars = "hello".toCharArray();

// String to bytes
byte[] bytes = "hello".getBytes(StandardCharsets.UTF_8);
```

### From Other Types

```java
// int to String
String intStr = String.valueOf(42);
String intStr2 = Integer.toString(42);

// double to String
String doubleStr = String.valueOf(3.14);
String doubleStr2 = Double.toString(3.14);

// char[] to String
String fromChars = new String(new char[]{'h', 'e', 'l', 'l', 'o'});

// bytes to String
byte[] bytes = {72, 101, 108, 108, 111};
String fromBytes = new String(bytes, StandardCharsets.UTF_8);
```

### char ↔ String Conversions

```java
// char to String
char c = 'A';
String fromChar = String.valueOf(c);        // "A"
String fromChar2 = Character.toString(c);   // "A"

// String to char (single character)
char firstChar = "Hello".charAt(0);         // 'H'

// String to char[] and back
char[] chars = "Hello".toCharArray();
String backToString = new String(chars);    // "Hello"
String backToString2 = String.valueOf(chars);  // "Hello" — equivalent
```

### String ↔ StringBuilder Conversions

```java
// String to StringBuilder
String text = "Hello";
StringBuilder sb = new StringBuilder(text);

// StringBuilder to String
String result = sb.toString();

// Common pattern: wrap, mutate, unwrap
StringBuilder builder = new StringBuilder("Hello");
builder.append(", World!").insert(0, ">> ");
String finalText = builder.toString();  // ">> Hello, World!"
```

### String.chars(): Streaming Over Characters

`chars()` (Java 8+) returns an `IntStream` of the string's UTF-16 code units — useful for character-level stream processing without manually indexing:

```java
long vowelCount = "hello world".chars()
    .filter(c -> "aeiou".indexOf(c) >= 0)
    .count();  // 3

String upperViaStream = "hello".chars()
    .mapToObj(c -> String.valueOf((char) c).toUpperCase())
    .collect(Collectors.joining());  // "HELLO" — illustrative; toUpperCase() alone is simpler for this case
```

<div class="callout warning">
<div class="callout-title"><span>⚠️</span>chars() Produces int Code Points, Not char</div>

`IntStream` elements from `chars()` are `int` values (UTF-16 code units), not `char` — you must cast (`(char) c`) before treating one as a character, and comparisons like `"aeiou".indexOf(c)` work because `indexOf(int)` accepts a code point directly.
</div>

---

## The toString() Method

Every object has a `toString()`, inherited from `Object`. Its default implementation is rarely useful:

```java
public class Customer {
    private String name;
    private int id;
    // constructor omitted
}

Customer customer = new Customer("Alice", 42);
System.out.println(customer);  // Something like "Customer@1b6d3586" — className@hexHashCode
```

That default comes directly from `Object.toString()`'s source: `getClass().getName() + "@" + Integer.toHexString(hashCode())`. It's almost never what you want for debugging or logging, so most classes should override it:

```java
public class Customer {
    private final String name;
    private final int id;

    @Override
    public String toString() {
        return "Customer{name='" + name + "', id=" + id + "}";
    }
}

Customer customer = new Customer("Alice", 42);
System.out.println(customer);  // "Customer{name='Alice', id=42}"
```

### Records Get toString() for Free

A `record` automatically generates a `toString()` that lists every component, so you don't need to hand-write one for simple data carriers:

```java
public record Point(int x, int y) {}

Point p = new Point(3, 4);
System.out.println(p);  // "Point[x=3, y=4]" — generated automatically
```

<div class="callout warning">
<div class="callout-title"><span>⚠️</span>Never Include Sensitive Data in toString()</div>

`toString()` output routinely ends up in logs, exception messages, and debugger views — places you don't fully control the audience for. Never include passwords, tokens, national ID numbers, or other sensitive fields:

```java
// WRONG — password ends up in every log line that prints this object
public record User(String username, String password) {
    // Using the default record toString() here leaks the password
}

// CORRECT — override to redact sensitive fields
public record User(String username, String password) {
    @Override
    public String toString() {
        return "User{username='" + username + "', password='[REDACTED]'}";
    }
}
```
</div>

---

## Common Mistakes

### Mistake 1: Using == for String Comparison

```java
// WRONG
String a = "hello";
String b = "hello";
if (a == b) { }  // Works sometimes, fails other times!

// CORRECT
if (a.equals(b)) { }

// For case-insensitive
if (a.equalsIgnoreCase(b)) { }
```

### Mistake 2: NPE with String Methods

```java
// WRONG
String name = null;
System.out.println(name.length());  // NullPointerException!

// CORRECT
if (name != null && !name.isEmpty()) {
    System.out.println(name.length());
}

// Or use Optional
Optional.ofNullable(name)
    .ifPresent(n -> System.out.println(n.length()));
```

### Mistake 3: Inefficient StringBuilder

```java
// WRONG – defeats the purpose of StringBuilder
StringBuilder sb = new StringBuilder();
sb.append("hello");
String result = sb.toString();
// Just use String concatenation

// CORRECT – use StringBuilder only for repeated operations
StringBuilder sb = new StringBuilder();
for (String item : items) {
    sb.append(item).append(", ");
}
String result = sb.toString();
```

---

## Summary

- **Immutable**: Strings don't change; operations create new strings
- **String pool**: Unique literals cached in special memory region
- **==**: Checks reference equality, not value
- **equals()**: Checks value equality (use this for strings)
- **StringBuilder**: Mutable alternative for string building
- **Formatting**: String.format() and System.out.printf()
- **Operations**: substring, replace, split, join, trim, etc.
- **Ordering**: compareTo()/compareToIgnoreCase() for lexicographic comparison; Objects.equals() for null-safe equality
- **toString()**: override it for meaningful output; records generate one automatically; never leak sensitive data through it

---

## Further Reading

- [Baeldung – Strings](https://www.baeldung.com/java-string){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – String Immutability](https://www.baeldung.com/java-string-immutable){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – String Comparison](https://www.baeldung.com/java-compare-strings){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Guide to toString()](https://www.baeldung.com/java-tostring){:target="_blank" rel="noopener noreferrer"}
- [Oracle String API](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html){:target="_blank" rel="noopener noreferrer"}

---

<div class="chapter-nav">
<a href="{{ '/docs/06-functional-java' | relative_url }}" class="btn btn-secondary">← Previous: Functional Java & Streams</a>
<div class="chapter-nav-spacer"></div>
<a href="{{ '/docs/08-exceptions' | relative_url }}" class="btn">Next: Exceptions →</a>
</div>
