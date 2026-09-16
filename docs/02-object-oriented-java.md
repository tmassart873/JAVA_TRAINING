---
layout: default
title: Object-Oriented Java
subtitle: Classes, objects, inheritance, polymorphism, and design patterns
type: docs
quiz:
  - question: "Which access modifier restricts a member to its own class only?"
    options: ["public", "protected", "private", "default"]
    answer: 2
  - question: "Which keyword lets a class inherit from another class?"
    options: ["implements", "extends", "inherits", "super"]
    answer: 1
  - question: "What is the main purpose of encapsulation?"
    options: ["Allowing multiple inheritance", "Hiding internal state and exposing controlled access", "Speeding up compilation", "Preventing method overriding"]
    answer: 1
---

## Table of Contents
- [Classes and Objects](#classes-and-objects)
- [Constructors](#constructors)
- [Access Modifiers](#access-modifiers)
- [Encapsulation](#encapsulation)
- [Inheritance](#inheritance)
- [Interfaces](#interfaces)
- [Abstract Classes](#abstract-classes)
- [Polymorphism](#polymorphism)
- [Composition vs Inheritance](#composition-vs-inheritance)
- [Nested Classes](#nested-classes)
- [static and final Keywords](#static-and-final-keywords)

---

## Classes and Objects

### Why Does This Matter?

Classes are the foundation of Java. Understanding how to design classes directly impacts code maintainability, testability, and the ability to work with frameworks like Spring Boot.

### Class Definition

A class is a blueprint for creating objects:

```java
public class Customer {
    // Fields (state)
    private String name;
    private String email;
    private int age;
    
    // Constructor
    public Customer(String name, String email, int age) {
        this.name = name;
        this.email = email;
        this.age = age;
    }
    
    // Methods (behavior)
    public void updateEmail(String newEmail) {
        this.email = newEmail;
    }
    
    public String getEmail() {
        return email;
    }
}
```

### Creating Objects

```java
Customer customer = new Customer("Alice", "alice@example.com", 30);

// 'customer' is a reference to the object on the heap
// Multiple references can point to the same object
Customer customerRef = customer;  // Both point to same object
```

### Object vs Instance

- **Class**: The blueprint (definition)
- **Object/Instance**: A concrete realization of the blueprint

```java
public class Car {
    // This is a class definition
}

Car myCar = new Car();      // This is an object/instance
Car yourCar = new Car();    // Another object/instance
```

You'll sometimes see the term **concrete class** — it just means "a class you can instantiate with `new`," as opposed to an `abstract class` (covered later) or an `interface`, neither of which can be instantiated directly. Every ordinary class you write, unless declared `abstract`, is a concrete class by default.

### `this` Keyword

`this` refers to the current object:

```java
public class Order {
    private String id;
    private double total;
    
    public Order(String id, double total) {
        this.id = id;      // 'this.id' is the field, 'id' is the parameter
        this.total = total;
    }
    
    public void addDiscount(double discountAmount) {
        this.total = this.total - discountAmount;  // 'this' not required but clear
    }
    
    public Order copy() {
        return new Order(this.id, this.total);  // 'this' to reference current object
    }
}
```

---

## Constructors

### Purpose

Constructors initialize the state of an object. They're called when you use `new`.

### No-Argument Constructor

```java
public class Product {
    private String name;
    private double price;
    
    // No-argument constructor
    public Product() {
        this.name = "Unknown";
        this.price = 0.0;
    }
}

Product product = new Product();
```

### Parameterized Constructor

```java
public class Product {
    private String name;
    private double price;
    
    // Constructor with parameters
    public Product(String name, double price) {
        this.name = name;
        this.price = price;
    }
}

Product product = new Product("Laptop", 999.99);
```

### Multiple Constructors (Overloading)

```java
public class Order {
    private String id;
    private List<OrderLine> lines;
    private OrderStatus status;
    
    // Constructor 1: ID only
    public Order(String id) {
        this.id = id;
        this.lines = new ArrayList<>();
        this.status = OrderStatus.PENDING;
    }
    
    // Constructor 2: ID and lines
    public Order(String id, List<OrderLine> lines) {
        this.id = id;
        this.lines = new ArrayList<>(lines);
        this.status = OrderStatus.PENDING;
    }
    
    // Constructor 3: Full initialization
    public Order(String id, List<OrderLine> lines, OrderStatus status) {
        this.id = id;
        this.lines = new ArrayList<>(lines);
        this.status = status;
    }
}
```

### Constructor Chaining with `this()`

Avoid duplication by calling another constructor:

```java
public class Order {
    private String id;
    private List<OrderLine> lines;
    private OrderStatus status;
    
    public Order(String id) {
        this(id, new ArrayList<>(), OrderStatus.PENDING);
    }
    
    public Order(String id, List<OrderLine> lines) {
        this(id, lines, OrderStatus.PENDING);
    }
    
    public Order(String id, List<OrderLine> lines, OrderStatus status) {
        this.id = id;
        this.lines = new ArrayList<>(lines);
        this.status = status;
    }
}
```

<div class="callout warning" markdown="1">
<div class="callout-title"><span>⚠️</span>this() and super() Must Be the First Statement</div>

A constructor may call `this(...)` (another constructor in the same class) or `super(...)` (the parent's constructor) — but **never both**, and whichever you use must be the very first statement:

```java
public Order(String id) {
    System.out.println("Creating order " + id);  // COMPILE ERROR
    this(id, new ArrayList<>(), OrderStatus.PENDING);  // Must be the first line
}
```

If you don't explicitly call either, the compiler silently inserts a no-argument `super()` call for you before your constructor body runs. This is why a subclass fails to compile if its parent has no no-argument constructor and the subclass doesn't explicitly call `super(...)` with matching arguments.
</div>

<div class="callout modern" markdown="1">
<div class="callout-title"><span>🚀</span>Modern Java: Records</div>

In Java 16+, use records for immutable data classes:

```java
public record Order(
    String id,
    List<OrderLine> lines,
    OrderStatus status
) {}
```

Records auto-generate constructor, fields, equals/hashCode, toString.
</div>

---

## Access Modifiers

### The Four Access Levels

| Modifier | Class | Package | Subclass | World |
|----------|-------|---------|----------|-------|
| `public` | Yes | Yes | Yes | Yes |
| `protected` | Yes | Yes | Yes | No |
| package-private | Yes | Yes | No | No |
| `private` | Yes | No | No | No |

### public

Accessible from anywhere:

```java
public class Order {
    public void process() { }  // Can call from any class
}
```

### private

Accessible only within the class:

```java
public class Order {
    private String customerId;  // Only Order can access
    
    private void calculateTax() { }  // Only Order can call
}
```

Prefer `private` by default. Expose only what's necessary through `public` methods.

### protected

Accessible within package and by subclasses:

```java
public class BaseService {
    protected void log(String message) { }
}

public class OrderService extends BaseService {
    public void process() {
        log("Processing order");  // OK – subclass can access
    }
}
```

### Package-private (default)

No modifier means package-private – accessible only within the same package:

```java
class DatabaseHelper {  // No modifier = package-private
    void executeQuery(String sql) { }
}

// Can only use from same package
```

<div class="callout concept" markdown="1">
<div class="callout-title"><span>💡</span>Top-Level Classes Can Only Be public or Package-Private</div>

The four access levels above apply to **members** (fields, methods, constructors, and nested classes). A **top-level class** (one directly in a `.java` file, not nested inside another class) can only be declared `public` or left package-private — `private` and `protected` are not legal on a top-level class:

```java
private class Helper { }    // COMPILE ERROR – not allowed on a top-level class
public class Helper { }     // OK
class Helper { }             // OK – package-private
```

A `public` top-level class must also match its filename exactly (`Helper.java` for `public class Helper`), and a single `.java` file may contain at most one `public` top-level class.
</div>

---

## Encapsulation

### The Principle

Hide internal details, expose only necessary behavior:

```java
public class BankAccount {
    // Private – cannot be accessed directly
    private double balance;
    
    // Public – controlled access through methods
    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }
    
    public void withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
        }
    }
    
    public double getBalance() {
        return balance;
    }
}

// User cannot do: account.balance = -1000;  (Compiler error)
// User must do: account.withdraw(1000);  (Business logic enforced)
```

### Getters and Setters

```java
public class Product {
    private String name;
    private double price;
    
    // Getter
    public String getName() {
        return name;
    }
    
    // Setter with validation
    public void setPrice(double price) {
        if (price >= 0) {
            this.price = price;
        }
    }
    
    public double getPrice() {
        return price;
    }
}
```

<div class="callout warning" markdown="1">
<div class="callout-title"><span>⚠️</span>Getters/Setters Pitfall</div>

Don't expose mutable fields through getters:

```java
// WRONG
private List<OrderLine> lines;
public List<OrderLine> getLines() {
    return lines;  // Caller can modify!
}

// CORRECT
public List<OrderLine> getLines() {
    return Collections.unmodifiableList(lines);
}

// Or return a copy
public List<OrderLine> getLines() {
    return new ArrayList<>(lines);
}
```
</div>

---

## Inheritance

### Extending Classes

```java
public class Animal {
    protected String name;
    
    public void speak() {
        System.out.println(name + " makes a sound");
    }
}

public class Dog extends Animal {
    public void speak() {
        System.out.println(name + " barks");
    }
}

// Usage
Dog dog = new Dog();
dog.name = "Buddy";
dog.speak();  // "Buddy barks"
```

### super Keyword

Access the parent class:

```java
public class Dog extends Animal {
    @Override
    public void speak() {
        super.speak();  // Call parent's method first
        System.out.println(name + " wags tail");
    }
}
```

### Method Overriding

```java
public class Animal {
    public void move() {
        System.out.println("Moving");
    }
}

public class Bird extends Animal {
    @Override
    public void move() {
        System.out.println("Flying");
    }
}
```

<div class="callout concept" markdown="1">
<div class="callout-title"><span>💡</span>Overloading vs. Overriding — Side by Side</div>

These two terms sound similar but describe opposite ideas, and mixing them up is one of the most common OOP confusions:

| | **Overloading** | **Overriding** |
|---|---|---|
| Where | Same class (or subclass adding new signatures) | Subclass redefining a parent's method |
| Signature | Must **differ** (different parameter list) | Must be **identical** (same name + parameter types) |
| Return type | Can differ | Must be same or a covariant subtype |
| Resolved | At **compile time** (based on the declared argument types) | At **runtime** (based on the actual object type) |
| Keyword | None required | `@Override` is optional but strongly recommended |

```java
public class Animal {
    public void move() { System.out.println("Moving"); }
}

public class Bird extends Animal {
    @Override
    public void move() { System.out.println("Flying"); }   // OVERRIDING – same signature, new behavior

    public void move(int meters) { System.out.println("Flying " + meters + "m"); }  // OVERLOADING – different signature
}
```

`@Override` isn't just documentation — the compiler verifies the signature actually matches a parent method. Without it, a typo like `move(int meter)` vs. an intended `move(int meters)` silently becomes a harmless overload instead of the override you meant, and the bug goes unnoticed until runtime.
</div>

### What NOT to Do: Inheritance for Code Reuse

```java
// WRONG – using inheritance just to reuse code
public class Button extends BaseClass {
    // Inherits logging, configuration, etc.
}

// CORRECT – composition
public class Button {
    private BaseClass base = new BaseClass();
    
    public void click() {
        base.log("Button clicked");
    }
}
```

Inheritance should represent an **IS-A** relationship. Use composition for **HAS-A** relationships.

---

## Interfaces

### Defining Interfaces

```java
public interface PaymentService {
    PaymentResult process(Payment payment);
    void refund(String transactionId);
}
```

### Implementing Interfaces

```java
public class StripePaymentService implements PaymentService {
    @Override
    public PaymentResult process(Payment payment) {
        // Stripe-specific implementation
        return new PaymentResult(true, payment.getId());
    }
    
    @Override
    public void refund(String transactionId) {
        // Refund logic
    }
}

public class PaypalPaymentService implements PaymentService {
    @Override
    public PaymentResult process(Payment payment) {
        // PayPal-specific implementation
        return new PaymentResult(true, payment.getId());
    }
    
    @Override
    public void refund(String transactionId) {
        // Refund logic
    }
}
```

### Interface Contract

An interface defines WHAT a class must do, not HOW:

```java
public interface OrderRepository {
    Order findById(String id);
    void save(Order order);
    List<Order> findAll();
}

// Multiple implementations can fulfill the same contract
public class DatabaseOrderRepository implements OrderRepository { }
public class FileOrderRepository implements OrderRepository { }
public class InMemoryOrderRepository implements OrderRepository { }
```

### Default Methods (Java 8+)

Interfaces can provide default implementations:

```java
public interface Repository<T> {
    void save(T entity);
    T findById(String id);
    
    // Default method
    default void delete(T entity) {
        System.out.println("Deleting: " + entity);
    }
}
```

### Static Methods in Interfaces

```java
public interface Logger {
    void log(String message);
    
    static Logger console() {
        return message -> System.out.println(message);
    }
}

Logger logger = Logger.console();
logger.log("Hello");
```

Static interface methods are **not inherited** by implementing classes — they must be called via the interface name (`Logger.console()`), never via an instance.

<div class="callout warning" markdown="1">
<div class="callout-title"><span>⚠️</span>The Diamond Problem With Default Methods</div>

If a class implements two interfaces that each declare the **same default method**, the compiler refuses to guess which one you meant — you get a compile error and must resolve it explicitly:

```java
interface Flyer {
    default String move() { return "Flying"; }
}
interface Swimmer {
    default String move() { return "Swimming"; }
}

// COMPILE ERROR: class Duck inherits unrelated defaults for move() from Flyer and Swimmer
class Duck implements Flyer, Swimmer {
    @Override
    public String move() {
        return Flyer.super.move() + " and " + Swimmer.super.move();  // Disambiguate explicitly
    }
}
```

`InterfaceName.super.methodName()` is the only way to call a specific interface's default implementation — plain `super.move()` doesn't work here because there's no single parent class, only sibling interfaces.
</div>

---

## Abstract Classes

### Purpose

Abstract classes provide partial implementation and a template for subclasses:

```java
public abstract class PaymentProcessor {
    private String merchantId;
    
    // Shared state and methods
    public PaymentProcessor(String merchantId) {
        this.merchantId = merchantId;
    }
    
    // Concrete method
    public final void logTransaction(String details) {
        System.out.println("[" + merchantId + "] " + details);
    }
    
    // Abstract method – subclass must implement
    public abstract PaymentResult process(Payment payment);
}

public class StripeProcessor extends PaymentProcessor {
    public StripeProcessor(String merchantId) {
        super(merchantId);
    }
    
    @Override
    public PaymentResult process(Payment payment) {
        // Stripe-specific implementation
        logTransaction("Processing via Stripe");
        return new PaymentResult(true, payment.getId());
    }
}
```

### Interface vs Abstract Class

| Aspect | Interface | Abstract Class |
|--------|-----------|----------------|
| Variables | constants only | any fields |
| Methods | abstract + default | abstract + concrete |
| Constructor | none | yes |
| Use case | contract | shared code + contract |

**Rule**: Use interfaces for contracts. Use abstract classes for shared code.

---

## Polymorphism

### Runtime Type Polymorphism

```java
PaymentService stripe = new StripePaymentService();
PaymentService paypal = new PaypalPaymentService();

// Both implement the same interface
// Which process() is called depends on the actual runtime type
stripe.process(payment1);  // Calls StripePaymentService.process()
paypal.process(payment2);  // Calls PaypalPaymentService.process()
```

### Method Overloading

```java
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
    
    public double add(double a, double b) {
        return a + b;
    }
    
    public int add(int a, int b, int c) {
        return a + b + c;
    }
}

Calculator calc = new Calculator();
calc.add(1, 2);           // First method
calc.add(1.5, 2.5);       // Second method
calc.add(1, 2, 3);        // Third method
```

---

## Composition vs Inheritance

### Composition Example

```java
public class Order {
    private Customer customer;  // HAS-A customer
    private List<OrderLine> lines;
    private PaymentService paymentService;
    
    public void process() {
        // Use paymentService to process payment
        paymentService.process(calculateTotal());
    }
}

// Order HAS-A PaymentService, doesn't inherit from it
```

### When to Use Each

**Inheritance (IS-A):**
- Dog IS-A Animal
- Checking IS-A Account
- Use when there's true specialization

**Composition (HAS-A):**
- Order HAS-A Customer
- Service HAS-A Repository
- More flexible, easier to test

**Prefer composition** in modern Java. Inheritance is rigid; composition is flexible.

<div class="callout concept" markdown="1">
<div class="callout-title"><span>💡</span>HAS-A Has Two Flavors: Aggregation vs. Composition</div>

"HAS-A" is often treated as one relationship, but there's an important distinction in how tightly the two objects' lifecycles are bound. See [Immutability & Object Relationships](../15-immutability-and-relationships/#association-aggregation-and-composition) for the full breakdown of association, aggregation, and composition — including why it matters for who is responsible for creating/destroying the related object.
</div>

---

## Nested Classes

Java lets you define a class inside another class. The most common form for utility/helper types is a **static nested class** — it behaves like a normal top-level class, just namespaced inside its enclosing class, and it does **not** hold an implicit reference to an enclosing instance:

```java
public class OrderProcessor {
    // Static nested class: doesn't need an OrderProcessor instance to exist
    public static class ValidationResult {
        private final boolean valid;
        private final String reason;

        public ValidationResult(boolean valid, String reason) {
            this.valid = valid;
            this.reason = reason;
        }

        public boolean isValid() { return valid; }
    }

    public ValidationResult validate(Order order) {
        if (order.lines().isEmpty()) {
            return new ValidationResult(false, "Order has no lines");
        }
        return new ValidationResult(true, null);
    }
}

// Referenced via OuterClass.NestedClass, and constructed without an OrderProcessor instance
OrderProcessor.ValidationResult result = new OrderProcessor.ValidationResult(true, null);
```

This differs from a **non-static (inner) class**, which *does* hold an implicit reference to its enclosing instance and requires one to be constructed (`outer.new Inner()`) — inner classes are less common in everyday backend code and are mostly used for tight coupling to a specific outer instance (e.g., a custom `Iterator` implementation returned from a collection class).

<div class="callout warning" markdown="1">
<div class="callout-title"><span>⚠️</span>Effectively Final Variables and Lambda Capture</div>

A lambda (or anonymous class) can only capture local variables that are **effectively final** — never reassigned after initialization, even if not explicitly marked `final`:

```java
int threshold = 100;
Predicate<Integer> isAboveThreshold = value -> value > threshold;  // OK – threshold never reassigned

int counter = 0;
Runnable badLambda = () -> {
    // counter++;  // COMPILE ERROR – counter would no longer be effectively final
};
```

This is required because the lambda may run later, possibly on another thread, after the enclosing method has already returned — the lambda captures a **snapshot of the value**, not a live reference to the variable, so the compiler forbids any code path where that snapshot could go stale.
</div>

---

## static and final Keywords

### static Fields

Belong to the class, not instances:

```java
public class Configuration {
    public static final int MAX_CONNECTIONS = 100;
    private static String appName = "MyApp";
    
    public static String getAppName() {
        return appName;
    }
}

System.out.println(Configuration.MAX_CONNECTIONS);  // Access via class
System.out.println(Configuration.getAppName());
```

### static Methods

```java
public class DateUtils {
    public static String format(LocalDate date) {
        return date.format(DateTimeFormatter.ISO_DATE);
    }
    
    public static LocalDate tomorrow() {
        return LocalDate.now().plusDays(1);
    }
}

// Call via class name
String formatted = DateUtils.format(LocalDate.now());
```

### final Keyword

Makes variables, methods, and classes immutable:

```java
public final class ImmutableValue {  // Cannot extend
    private final String value;      // Cannot change
    
    public ImmutableValue(String value) {
        this.value = value;
    }
    
    public final String getValue() {  // Cannot override
        return value;
    }
}
```

---

## Common Mistakes

### Mistake 1: Public Mutable Fields

```java
// WRONG
public class Account {
    public double balance;  // Anyone can modify!
}

// CORRECT
public class Account {
    private double balance;
    
    public double getBalance() {
        return balance;
    }
    
    public void withdraw(double amount) {
        if (amount <= balance) {
            balance -= amount;
        }
    }
}
```

### Mistake 2: Inheritance for Code Reuse

```java
// WRONG – dog is not a person
public class Dog extends Person {
    // Reusing Person's methods
}

// CORRECT – composition
public class Dog {
    private Person owner;  // Dog HAS-A owner
}
```

### Mistake 3: Not Calling super()

```java
public class Dog extends Animal {
    private String breed;
    
    public Dog(String name, String breed) {
        super(name);  // MUST call parent constructor
        this.breed = breed;
    }
}
```

---

## Summary

- **Classes and objects**: Classes are blueprints; objects are instances.
- **Constructors**: Initialize object state. Overload for flexibility.
- **Access modifiers**: Use `private` by default, expose only what's needed.
- **Encapsulation**: Hide internals, provide controlled access through methods.
- **Inheritance**: Represents IS-A relationship. Use for specialization.
- **Interfaces**: Define contracts. Allows multiple implementations.
- **Abstract classes**: Provide shared code and define template methods.
- **Polymorphism**: Same interface, different implementations.
- **Composition over inheritance**: More flexible and maintainable.
- **static**: Belongs to class, not instances.
- **final**: Prevents modification or overriding.

---

## Further Reading

- [Baeldung – Classes and Objects](https://www.baeldung.com/java-classes-objects){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Inheritance and Composition](https://www.baeldung.com/java-inheritance-composition){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Interfaces](https://www.baeldung.com/java-interfaces){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Abstract Classes](https://www.baeldung.com/java-abstract-class){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Concrete Class in Java](https://www.baeldung.com/java-concrete-class){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Access Modifiers](https://www.baeldung.com/java-access-modifiers){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – this Keyword](https://www.baeldung.com/java-this){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – super Keyword](https://www.baeldung.com/java-super){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – static and default Methods in Interfaces](https://www.baeldung.com/java-static-default-methods){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Method Overloading and Overriding](https://www.baeldung.com/java-method-overload-override){:target="_blank" rel="noopener noreferrer"}
- [Oracle Tutorial – Object-Oriented Programming Concepts](https://docs.oracle.com/javase/tutorial/java/concepts/index.html){:target="_blank" rel="noopener noreferrer"}

---

<div class="chapter-nav">
<a href="{{ '/docs/01-java-fundamentals' | relative_url }}" class="btn btn-secondary">← Previous: Java Fundamentals</a>
<div class="chapter-nav-spacer"></div>
<a href="{{ '/docs/14-object-copying-and-casting' | relative_url }}" class="btn">Next: Casting, instanceof & Copying →</a>
</div>