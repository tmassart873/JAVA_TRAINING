---
layout: default
title: Immutability & Object Relationships
subtitle: Designing immutable objects and understanding how objects relate to each other
type: docs
quiz:
  - question: "Which of these is required for a class to be truly immutable?"
    options: ["All fields must be private", "All fields must be final AND any mutable field must be defensively copied on the way in/out", "The class must implement Serializable", "The class must have a no-argument constructor"]
    answer: 1
  - question: "What's the key difference between aggregation and composition?"
    options: ["Aggregation uses interfaces, composition uses classes", "In composition, the contained object's lifecycle is owned by the container; in aggregation, it can outlive it", "There is no real difference", "Composition only works with primitives"]
    answer: 1
  - question: "Given a class with an instance initializer block, a field initializer, and a constructor, in what order do they run when `new` is called?"
    options: ["Constructor, then field initializers, then instance initializer blocks", "Field initializers and instance initializer blocks run in source order, then the constructor body", "Instance initializer blocks always run last", "The order is undefined and can vary between JVMs"]
    answer: 1
  - question: "Why doesn't `final List<String> names = new ArrayList<>();` make the list immutable?"
    options: ["final only prevents reassigning the 'names' reference itself — the ArrayList object it points to can still be mutated (add/remove)", "It's a compiler bug", "final only works on primitives", "ArrayList overrides final to ignore it"]
    answer: 0
---

## Why This Matters

Two of the most common sources of subtle bugs in Java codebases are: objects that were assumed to be immutable but weren't, and confusion about which object "owns" another. This lesson consolidates both, plus the exact rules for `this`/`super` and initialization order that are easy to get wrong once your classes get more complex than the simple examples earlier in the course.

---

## Table of Contents
- [Designing Immutable Objects](#designing-immutable-objects)
- [Association, Aggregation, and Composition](#association-aggregation-and-composition)
- [this and super: The Complete Picture](#this-and-super-the-complete-picture)
- [Initialization Blocks and Order](#initialization-blocks-and-order)

---

## Designing Immutable Objects

An immutable object's state cannot change after construction. `String`, `Integer`, and all records with only immutable fields are examples. Immutability eliminates entire categories of bugs: no thread-safety issues, no defensive-copying-on-every-read, no "who mutated this and when."

### The Rules

To make a class genuinely immutable:

1. Make the class `final` (or otherwise prevent subclassing) so a subclass can't add mutable state or override behavior.
2. Make all fields `private final`.
3. Don't provide setters or any other mutator methods.
4. If a field is a **mutable** type (a `List`, `Date`, custom mutable class, array, etc.), defensively copy it both on the way in (constructor) and on the way out (getter) — otherwise external code can mutate your "immutable" object's internals through the reference it was given.

```java
public final class Itinerary {
    private final String destination;
    private final List<String> stops;   // Mutable type!

    public Itinerary(String destination, List<String> stops) {
        this.destination = destination;
        this.stops = new ArrayList<>(stops);  // Defensive copy IN — caller's list can't affect us later
    }

    public String getDestination() { return destination; }

    public List<String> getStops() {
        return List.copyOf(stops);   // Defensive copy OUT — caller can't mutate our internal list
    }
}
```

<div class="callout warning">
<div class="callout-title"><span>⚠️</span>final Prevents Reassignment, Not Mutation</div>

This is the single most common misunderstanding about immutability:

```java
final List<String> names = new ArrayList<>();
names.add("Alice");     // Perfectly legal — the LIST is mutable
names.add("Bob");

names = new ArrayList<>();  // COMPILE ERROR — 'names' the reference can't be reassigned
```

`final` on a variable only locks the **reference** — which object it points to. It says nothing about whether that object's own internal state can change. A `final List` is still a fully mutable list. Genuine immutability requires the referenced object's *own* design to forbid mutation, not just a `final` variable pointing at it.
</div>

Records give you fields 1–3 for free (they're implicitly `final` and expose no setters), but rule 4 is still your responsibility if a record component is a mutable type:

```java
public record Itinerary(String destination, List<String> stops) {
    public Itinerary {  // Compact canonical constructor
        stops = List.copyOf(stops);  // Defensive copy even in a record
    }
}
```

---

## Association, Aggregation, and Composition

"HAS-A" relationships (as opposed to inheritance's "IS-A") come in different strengths, distinguished by **lifecycle ownership** — does the contained object's lifetime depend on the container's?

### Association — Loosest Coupling

Two objects are simply aware of and use each other; neither owns the other's lifecycle:

```java
public class Student {
    private List<Course> enrolledCourses;  // Student knows about Courses...
}

public class Course {
    private List<Student> enrolledStudents;  // ...and Courses know about Students
}
// Neither owns the other — a Course exists whether or not any Student has enrolled
```

### Aggregation — "Has-A", Independent Lifecycle

One object contains a reference to another, but the contained object can exist independently and outlive the container:

```java
public class Department {
    private List<Employee> employees;  // A Department HAS employees...

    public Department(List<Employee> employees) {
        this.employees = employees;  // ...but doesn't create or own them
    }
}
// If the Department object is discarded, the Employee objects still exist —
// they can be reassigned to a different Department
```

### Composition — Strongest "Has-A", Owned Lifecycle

The contained object's lifecycle is fully owned by the container — it's created by the container and has no meaning or existence outside it:

```java
public class Order {
    private final List<OrderLine> lines = new ArrayList<>();  // Order CREATES its own OrderLines

    public void addLine(String product, int quantity) {
        lines.add(new OrderLine(product, quantity));  // OrderLine has no independent existence
    }
}
// If the Order is discarded, its OrderLines are discarded with it —
// an OrderLine detached from an Order doesn't make sense in this domain
```

<div class="callout concept">
<div class="callout-title"><span>💡</span>The Quick Test</div>

Ask: **"If I delete the container, should the contained object also disappear?"** Yes → composition. "It depends, it could be reassigned elsewhere" → aggregation. "They're just two independent things that reference each other" → association. The code structure (a field holding a reference) looks identical in all three cases — the distinction is about domain meaning and lifecycle, not syntax.
</div>

This connects directly to [Composition vs Inheritance](../02-object-oriented-java/#composition-vs-inheritance): "prefer composition over inheritance" specifically means the strong, owned-lifecycle form described here.

---

## this and super: The Complete Picture

You've seen `this` and `super` used individually in earlier lessons ([`this` keyword](../02-object-oriented-java/#this-keyword), [`super` keyword](../02-object-oriented-java/#super-keyword), [constructor chaining](../02-object-oriented-java/#constructor-chaining-with-this)). Here's the complete reference of every use:

| Usage | Meaning |
|---|---|
| `this.field` | The current object's field (disambiguates from a same-named parameter) |
| `this.method()` | Calls a method on the current object |
| `this(...)` | Calls another constructor **in the same class** — must be the first statement |
| `super.field` | The parent class's field (when shadowed by a subclass field — rare and generally best avoided) |
| `super.method()` | Calls the parent's version of a method the subclass has overridden |
| `super(...)` | Calls the parent class's constructor — must be the first statement |

```java
public class Vehicle {
    protected String brand;
    public Vehicle(String brand) { this.brand = brand; }
    public String describe() { return "A " + brand + " vehicle"; }
}

public class Car extends Vehicle {
    private int doors;

    public Car(String brand, int doors) {
        super(brand);        // Must be first: initializes the Vehicle part
        this.doors = doors;  // 'this' disambiguates field from parameter
    }

    @Override
    public String describe() {
        return super.describe() + " with " + doors + " doors";  // Extend, don't just replace, the parent's behavior
    }
}
```

A constructor can call `this(...)` **or** `super(...)`, never both — and if you call neither, the compiler silently inserts a no-argument `super()` for you (see [Constructors](../02-object-oriented-java/#constructor-chaining-with-this) for what happens when the parent has no no-argument constructor).

---

## Initialization Blocks and Order

Beyond constructors, Java has **instance initializer blocks** — a `{ }` block directly in the class body, not inside any method. They're uncommon in everyday code (constructors usually suffice) but understanding them clarifies exactly what happens when `new` runs.

```java
public class Order {
    private String id = "PENDING";      // 1. Field initializer

    {
        System.out.println("Instance initializer block running");  // 2. Instance initializer block
    }

    public Order(String id) {
        System.out.println("Constructor running");  // 3. Constructor body
        this.id = id;
    }
}
```

### The Exact Order

When `new Order("A1")` runs:

1. **Field initializers and instance initializer blocks run first, in the order they appear in the source file** (top to bottom, interleaved if mixed).
2. **Then the constructor body runs.**

If there's inheritance involved, the full order is: static initializers of the whole hierarchy (once, on class loading) → parent's field initializers/instance blocks → parent's constructor body → subclass's field initializers/instance blocks → subclass's constructor body. This is a direct consequence of `super(...)` always running first.

```java
public class Base {
    { System.out.println("Base instance block"); }
    public Base() { System.out.println("Base constructor"); }
}

public class Derived extends Base {
    { System.out.println("Derived instance block"); }
    public Derived() { System.out.println("Derived constructor"); }
}

new Derived();
// Output:
// Base instance block
// Base constructor
// Derived instance block
// Derived constructor
```

Static initializer blocks (`static { ... }`) follow the same "in source order" rule but run only **once**, when the class is first loaded — not on every `new`.

---

## Common Mistakes

### Mistake 1: Believing final Fields Alone Make a Class Immutable

```java
// WRONG — still mutable through the getter
public final class Team {
    private final List<String> members;
    public Team(List<String> members) { this.members = members; }  // No defensive copy
    public List<String> getMembers() { return members; }  // Leaks the internal list!
}

Team team = new Team(new ArrayList<>(List.of("Alice")));
team.getMembers().add("Mallory");  // Silently corrupts Team's internal state
```

### Mistake 2: Confusing Aggregation and Composition Because the Code Looks the Same

Remember: the distinction is about domain-level lifecycle ownership, not syntax — always ask "does the child make sense without the parent?"

### Mistake 3: Relying on Instance Initializer Order Instead of Just Using the Constructor

Instance initializer blocks are legal but rarely the clearest choice — prefer doing setup directly in the constructor unless you specifically need logic shared across multiple constructors without using `this(...)` chaining.

---

## Summary

- True immutability requires `final` fields **and** defensive copying of any mutable field, both in and out.
- `final` on a variable prevents reassignment of the reference, not mutation of the object it points to.
- Association, aggregation, and composition are increasingly strong forms of "HAS-A," distinguished by lifecycle ownership, not code shape.
- `this(...)`/`super(...)` must be the first statement in a constructor, and you can only call one of them.
- Field initializers and instance initializer blocks run in source order, before the constructor body; in an inheritance chain, the whole parent is fully constructed before the subclass's own initialization begins.

---

## Further Reading

- [Baeldung – Immutable Objects in Java](https://www.baeldung.com/java-immutable-object){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Association, Composition, and Aggregation](https://www.baeldung.com/java-composition-aggregation-association){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Java Initialization](https://www.baeldung.com/java-initialization){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – this Keyword](https://www.baeldung.com/java-this){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – super Keyword](https://www.baeldung.com/java-super){:target="_blank" rel="noopener noreferrer"}

---

<div class="chapter-nav">
<a href="{{ '/docs/14-object-copying-and-casting' | relative_url }}" class="btn btn-secondary">← Previous: Casting, instanceof & Copying</a>
<div class="chapter-nav-spacer"></div>
<a href="{{ '/docs/03-modern-java' | relative_url }}" class="btn">Next: Modern Java (17+) →</a>
</div>
