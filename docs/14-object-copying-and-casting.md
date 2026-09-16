---
layout: default
title: Casting, instanceof & Copying
subtitle: Type casting, safe type checks, and copying objects correctly
type: docs
quiz:
  - question: "What happens when you cast an Object reference that is not actually an instance of the target type?"
    options: ["It silently becomes null", "It throws a ClassCastException at runtime", "It fails to compile", "It truncates the object"]
    answer: 1
  - question: "In `if (obj instanceof String s)`, where is the variable `s` usable?"
    options: ["Nowhere, this is invalid syntax", "Only inside the if block, and only when the condition is true", "Everywhere in the method, always", "Only after the if block"]
    answer: 1
  - question: "Given `Address address; Customer copy = new Customer(original.getName(), original.getAddress());` — what kind of copy is this if Address is mutable and not copied itself?"
    options: ["A deep copy", "A shallow copy — the same Address object is shared by both Customers", "An immutable copy", "A compile error"]
    answer: 1
  - question: "Why is `Cloneable` generally discouraged in modern Java?"
    options: ["It doesn't exist in Java 17+", "It's a marker interface with no clone() method of its own, and Object.clone() is protected and does a fragile shallow copy", "It only works on primitives", "It requires implementing Serializable first"]
    answer: 1
---

## Why This Matters

Casting and copying come up constantly once you're past "hello world" Java: working with legacy APIs that return `Object`, branching on the runtime type of a polymorphic reference, or handing a mutable object to another part of the system without letting it corrupt your internal state. Getting these wrong causes two very different classes of bugs — a `ClassCastException` that crashes loudly, or a shared-mutable-state bug that corrupts data silently.

---

## Table of Contents
- [Type Casting](#type-casting)
- [instanceof: Classic and Pattern Matching](#instanceof-classic-and-pattern-matching)
- [Shallow Copy vs. Deep Copy](#shallow-copy-vs-deep-copy)
- [Cloneable and Its Pitfalls](#cloneable-and-its-pitfalls)
- [Copy Constructors: The Preferred Approach](#copy-constructors-the-preferred-approach)

---

## Type Casting

You've already seen **primitive casting** (widening/narrowing) in [Java Fundamentals](../01-java-fundamentals/#widening-narrowing-and-casting). **Reference type casting** is a different mechanism: it doesn't convert the object itself, it just changes which "view" of the object you're allowed to use through a given reference.

```java
Object obj = "Hello, world";      // A String, stored via an Object reference

String str = (String) obj;         // Downcast: narrowing the reference type back to String
System.out.println(str.length());  // Now you can call String-specific methods
```

### Upcasting vs. Downcasting

**Upcasting** (subtype → supertype) is always safe and often implicit — a `Dog` always "is-a" `Animal`:

```java
Dog dog = new Dog();
Animal animal = dog;          // Upcast, implicit — no cast needed
```

**Downcasting** (supertype → subtype) requires an explicit cast and is only safe if the object's *actual runtime type* really is (or extends) the target type:

```java
Animal animal = new Dog();
Dog dog = (Dog) animal;       // OK — animal really is a Dog at runtime

Animal animal2 = new Cat();
Dog dog2 = (Dog) animal2;     // Compiles fine, but throws ClassCastException at runtime!
```

<div class="callout warning">
<div class="callout-title"><span>⚠️</span>The Compiler Can't Save You From a Bad Downcast</div>

The compiler only checks that the cast is *plausible* given the declared types — it cannot know the actual runtime type. A bad downcast compiles cleanly and blows up in production the first time it executes with the wrong object:

```java
Object value = "a string";
Integer number = (Integer) value;  // Compiles. Throws ClassCastException at runtime.
```

Always guard a risky downcast with `instanceof` first, or better, redesign so the cast isn't needed at all (polymorphism/overloading usually can replace it).
</div>

---

## instanceof: Classic and Pattern Matching

### The Classic Form

`instanceof` checks whether an object is an instance of a given type (or subtype) at runtime, returning `false` for `null` rather than throwing:

```java
Object obj = "hello";

if (obj instanceof String) {
    String str = (String) obj;   // Still need a separate, redundant cast
    System.out.println(str.toUpperCase());
}

System.out.println(null instanceof String);  // false — never throws
```

### Pattern Matching for instanceof (Java 16+)

Modern Java lets you combine the check and the cast into one expression — if the check passes, the compiler introduces a variable of the narrowed type, already cast for you:

```java
Object obj = "hello";

if (obj instanceof String str) {
    System.out.println(str.toUpperCase());  // 'str' is already a String here
}
```

The pattern variable (`str`) is only in scope where the compiler can prove the `instanceof` check was true — this is called **flow scoping**:

```java
if (obj instanceof String str && str.length() > 3) {
    // str is usable here — short-circuit && guarantees the instanceof passed first
}

if (!(obj instanceof String str)) {
    return;
}
// str IS usable here — the only way past the early return is that obj was a String
System.out.println(str.length());
```

<div class="callout modern">
<div class="callout-title"><span>🚀</span>Modern Java: Pattern Matching in switch (Java 21)</div>

Java 21 extends the same idea to `switch`, letting you branch on type directly:

```java
static String describe(Object obj) {
    return switch (obj) {
        case Integer i when i < 0 -> "negative integer";
        case Integer i -> "integer: " + i;
        case String s -> "string of length " + s.length();
        case null -> "it's null";
        default -> "something else";
    };
}
```

This replaces long `if/else instanceof` chains with something the compiler can exhaustiveness-check.
</div>

---

## Shallow Copy vs. Deep Copy

Once you copy an object that contains references to other mutable objects, you have to decide: does the copy share those nested objects with the original, or get its own independent copies?

```java
public class Address {
    private String city;
    public Address(String city) { this.city = city; }
    public void setCity(String city) { this.city = city; }
    public String getCity() { return city; }
}

public class Customer {
    private String name;
    private Address address;

    public Customer(String name, Address address) {
        this.name = name;
        this.address = address;
    }
    public Address getAddress() { return address; }
    public String getName() { return name; }
}
```

### Shallow Copy

A shallow copy duplicates the top-level object, but nested reference fields still point at the **same** objects as the original:

```java
Customer original = new Customer("Alice", new Address("Brussels"));

// Shallow copy — reuses the SAME Address instance
Customer shallowCopy = new Customer(original.getName(), original.getAddress());

shallowCopy.getAddress().setCity("Ghent");
System.out.println(original.getAddress().getCity());  // "Ghent" — the original was mutated too!
```

This is a common source of bugs: the two `Customer` objects are distinct, but mutating the shared `Address` through one is visible through the other.

### Deep Copy

A deep copy recursively copies every mutable nested object too, so the copy is fully independent:

```java
Address originalAddress = original.getAddress();
Address copiedAddress = new Address(originalAddress.getCity());  // A brand-new Address
Customer deepCopy = new Customer(original.getName(), copiedAddress);

deepCopy.getAddress().setCity("Ghent");
System.out.println(original.getAddress().getCity());  // Still "Brussels" — fully independent
```

Immutable fields (like `String`, records, or your own immutable classes) don't need deep copying — since they can't be mutated, sharing a reference to them is always safe. Deep copying only matters for **mutable** nested objects.

---

## Cloneable and Its Pitfalls

Java's built-in cloning mechanism, `Object.clone()` combined with the `Cloneable` marker interface, is widely considered a design mistake in the JDK — most modern Java code avoids it entirely.

```java
public class Address implements Cloneable {
    private String city;

    @Override
    public Address clone() {
        try {
            return (Address) super.clone();  // Only works because we implement Cloneable
        } catch (CloneNotSupportedException e) {
            throw new AssertionError(e);  // Can't actually happen once Cloneable is implemented
        }
    }
}
```

<div class="callout warning">
<div class="callout-title"><span>⚠️</span>Why Cloneable Is Best Avoided</div>

- `Cloneable` is a **marker interface** — it has no `clone()` method of its own. It only flips a runtime flag that `Object.clone()` checks; if you forget to implement it, `Object.clone()` throws `CloneNotSupportedException` at runtime, not compile time.
- `Object.clone()` is `protected` and does a **shallow** field-by-field copy — you still have to manually deep-copy every mutable field yourself, and it's easy to forget one after a refactor.
- It doesn't call any constructor, which can leave `final` fields or invariants in a broken intermediate state.
- The checked `CloneNotSupportedException` boilerplate (as shown above) adds noise for no real benefit.

For nearly all cases, a **copy constructor** (below) is clearer, safer, and doesn't require implementing a marker interface at all.
</div>

---

## Copy Constructors: The Preferred Approach

A copy constructor takes another instance of the same class and builds a new, independent object from it — explicit, readable, and fully under your control:

```java
public class Customer {
    private String name;
    private Address address;

    public Customer(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    // Copy constructor — makes the copy's intent explicit and lets you choose shallow or deep per field
    public Customer(Customer other) {
        this.name = other.name;                          // String is immutable — safe to share
        this.address = new Address(other.address.getCity());  // Deep-copy the mutable Address
    }
}

Customer original = new Customer("Alice", new Address("Brussels"));
Customer copy = new Customer(original);
copy.getAddress().setCity("Ghent");
System.out.println(original.getAddress().getCity());  // "Brussels" — unaffected
```

Records get an equivalent for free via their canonical constructor, and immutable records rarely need copying at all — see [Immutability & Object Relationships](../15-immutability-and-relationships/) for designing objects that avoid this problem altogether.

---

## Common Mistakes

### Mistake 1: Assuming a Downcast Is Safe Without Checking

```java
// WRONG — crashes if payment isn't actually a CreditCardPayment
CreditCardPayment cc = (CreditCardPayment) payment;

// CORRECT — guard first, or use pattern matching
if (payment instanceof CreditCardPayment cc) {
    cc.charge();
}
```

### Mistake 2: Thinking a "New Object" Is Automatically an Independent Copy

```java
// WRONG — this is still a shallow copy; both share the same List
Order copy = new Order(original.getId(), original.getLines());

// CORRECT — copy the mutable collection too
Order copy = new Order(original.getId(), new ArrayList<>(original.getLines()));
```

### Mistake 3: Implementing Cloneable "Because It's the Built-In Way"

Reach for a copy constructor by default; only consider `Cloneable` if you're working inside a legacy API that specifically requires it.

---

## Summary

- Downcasting a reference is only safe if the object's actual runtime type matches — otherwise you get a `ClassCastException`.
- `instanceof` pattern matching (Java 16+) combines the type check and the cast, with the pattern variable flow-scoped to where the check is known to be true.
- A shallow copy shares nested mutable objects with the original; a deep copy recursively duplicates them so the two are fully independent.
- Immutable fields never need deep copying — only mutable nested objects do.
- `Cloneable`/`Object.clone()` is fragile and best avoided; prefer an explicit copy constructor.

---

## Further Reading

- [Baeldung – Casting in Java](https://www.baeldung.com/java-type-casting){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – instanceof Operator](https://www.baeldung.com/java-instanceof){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Deep Copy vs. Shallow Copy](https://www.baeldung.com/java-deep-copy){:target="_blank" rel="noopener noreferrer"}
- [Oracle – Object.clone()](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#clone()){:target="_blank" rel="noopener noreferrer"}

---

<div class="chapter-nav">
<a href="{{ '/docs/02-object-oriented-java' | relative_url }}" class="btn btn-secondary">← Previous: Object-Oriented Java</a>
<div class="chapter-nav-spacer"></div>
<a href="{{ '/docs/15-immutability-and-relationships' | relative_url }}" class="btn">Next: Immutability & Object Relationships →</a>
</div>
