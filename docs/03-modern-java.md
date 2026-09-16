---
layout: default
title: Modern Java (17+)
subtitle: Records, sealed classes, pattern matching, and Java 21 features
type: docs
quiz:
  - question: "What does a record automatically generate for you?"
    options: ["A database schema", "equals(), hashCode(), toString() and accessors", "Getters that can be overridden freely", "Nothing, it's just syntax sugar for interfaces"]
    answer: 1
  - question: "What do sealed classes let you restrict?"
    options: ["Which methods can be called", "Which classes may extend or implement them", "How many instances can be created", "Which packages can import them"]
    answer: 1
  - question: "What is Optional primarily used to avoid?"
    options: ["ClassCastException", "NullPointerException", "ArrayIndexOutOfBoundsException", "StackOverflowError"]
    answer: 1
  - question: "Why is it risky to rely on an enum's ordinal() for business logic?"
    options: ["ordinal() is deprecated", "Inserting a new constant in the middle of the enum silently shifts every ordinal after it", "ordinal() always returns 0", "Enums don't have an ordinal() method"]
    answer: 1
  - question: "What's the difference between Optional.of(value) and Optional.ofNullable(value)?"
    options: ["They behave identically", "Optional.of throws NullPointerException immediately if value is null; Optional.ofNullable safely wraps null into Optional.empty()", "Optional.of is for primitives only", "Optional.ofNullable is deprecated"]
    answer: 1
---

## Table of Contents
- [Records](#records)
- [Sealed Classes and Interfaces](#sealed-classes-and-interfaces)
- [Pattern Matching](#pattern-matching)
- [Enums](#enums)
- [Optional](#optional)
- [Switch Expressions](#switch-expressions)
- [Text Blocks](#text-blocks)

---

## Records

### The Problem Records Solve

Before Java 16, creating immutable data classes required lots of boilerplate:

```java
// Pre-Java 16
public class Customer {
    private final String id;
    private final String name;
    private final String email;
    
    public Customer(String id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
    
    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Customer customer = (Customer) o;
        return Objects.equals(id, customer.id) &&
               Objects.equals(name, customer.name) &&
               Objects.equals(email, customer.email);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id, name, email);
    }
    
    @Override
    public String toString() {
        return "Customer{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}
```

### Records Solution

```java
// Java 16+
public record Customer(
    String id,
    String name,
    String email
) {}
```

The record **automatically generates**:
- Constructor
- Getters (no `get` prefix)
- `equals()`, `hashCode()`, `toString()`

### Using Records

```java
var customer = new Customer("123", "Alice", "alice@example.com");

System.out.println(customer.id());      // Access fields as methods
System.out.println(customer.name());
System.out.println(customer.email());

System.out.println(customer);  // toString() automatically generated
// Output: Customer[id=123, name=Alice, email=alice@example.com]

// Records are immutable
// customer.id = "456";  // Compiler error
```

### Record Compact Constructors

Add validation:

```java
public record Order(
    String id,
    List<OrderLine> lines,
    double total
) {
    // Compact constructor
    public Order {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("ID required");
        }
        if (lines == null) {
            lines = new ArrayList<>();
        }
        if (total < 0) {
            throw new IllegalArgumentException("Total cannot be negative");
        }
    }
}
```

### When to Use Records

**Use records for:**
- Immutable data carriers (DTOs, domain objects)
- Simple value objects
- Tuples/return values
- Performance-critical code

**Don't use records for:**
- Complex objects with behavior
- Objects that need to evolve
- Mutable data holders

---

## Sealed Classes and Interfaces

### The Problem

You want to control which classes can extend yours:

```java
// Without sealed classes, anyone can extend
public class PaymentProcessor {
    // Lots of implementation
}

// Someone extends it incorrectly
public class MyCustomPaymentProcessor extends PaymentProcessor {
    // Broken implementation
}
```

### Sealed Classes Solution

```java
// Java 17+ – only specified classes can extend
public sealed class PaymentProcessor
    permits StripeProcessor, PaypalProcessor, SquareProcessor {
    
    protected void logTransaction(String details) {
        System.out.println(details);
    }
}

public final class StripeProcessor extends PaymentProcessor {
    // Implementation
}

public final class PaypalProcessor extends PaymentProcessor {
    // Implementation
}

public final class SquareProcessor extends PaymentProcessor {
    // Implementation
}

// Anyone else trying to extend gets compiler error
public class CustomProcessor extends PaymentProcessor { }  // ERROR
```

### Sealed Interfaces

```java
public sealed interface Shape
    permits Circle, Rectangle, Triangle {
    double area();
}

public record Circle(double radius) implements Shape {
    public double area() { return Math.PI * radius * radius; }
}

public record Rectangle(double width, double height) implements Shape {
    public double area() { return width * height; }
}

public record Triangle(double base, double height) implements Shape {
    public double area() { return base * height / 2; }
}
```

### Benefits

1. **Compiler safety** – exhaustiveness checking in switch expressions
2. **Documentation** – clear what can extend this
3. **Performance** – JVM can optimize knowing all subclasses
4. **Design intent** – makes your API boundaries clear

---

## Pattern Matching

### instanceof Pattern Matching

**Before Java 16:**

```java
Object obj = new Customer("123", "Alice", "alice@example.com");

if (obj instanceof Customer) {
    Customer customer = (Customer) obj;  // Redundant cast
    System.out.println(customer.name());
}
```

**Java 16+:**

```java
Object obj = new Customer("123", "Alice", "alice@example.com");

if (obj instanceof Customer customer) {  // Pattern matching
    System.out.println(customer.name());  // No cast needed
}
```

### Pattern Matching in Switch (Java 21)

```java
public String describe(Object obj) {
    return switch(obj) {
        case Customer customer -> "Customer: " + customer.name();
        case Order order -> "Order: " + order.id();
        case Product product -> "Product: " + product.name();
        default -> "Unknown";
    };
}
```

### Guard Conditions

```java
public String checkOrder(Object obj) {
    return switch(obj) {
        case Order order when order.total() > 1000 -> 
            "Large order";
        case Order order when order.total() < 100 -> 
            "Small order";
        case Order order -> 
            "Regular order";
        default -> "Not an order";
    };
}
```

---

## Enums

### Basic Enum

```java
public enum OrderStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    CANCELLED
}

OrderStatus status = OrderStatus.PENDING;

if (status == OrderStatus.COMPLETED) {
    System.out.println("Order finished");
}
```

### Enum with Fields and Methods

```java
public enum PaymentMethod {
    CREDIT_CARD("Credit Card"),
    DEBIT_CARD("Debit Card"),
    PAYPAL("PayPal"),
    BANK_TRANSFER("Bank Transfer");
    
    private final String displayName;
    
    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}

System.out.println(PaymentMethod.CREDIT_CARD.getDisplayName());  
// "Credit Card"
```

### Enum vs Static Constants

```java
// WRONG – using static constants
public class Status {
    public static final int PENDING = 1;
    public static final int COMPLETED = 2;
}

int status = 99;  // Invalid, but compiler doesn't catch it

// CORRECT – using enum
public enum Status {
    PENDING,
    COMPLETED
}

Status status = Status.INVALID;  // Compiler error
```

### Enums Are Full Classes

An `enum` in Java is a real class — it can implement interfaces, and every constant is a `public static final` instance created exactly once. This means enums get several useful built-in methods for free:

```java
public enum OrderStatus {
    PENDING, PROCESSING, COMPLETED, CANCELLED
}

OrderStatus status = OrderStatus.valueOf("PROCESSING");  // String -> enum, throws IllegalArgumentException if no match
System.out.println(status.name());     // "PROCESSING" — the exact declared identifier
System.out.println(status.ordinal());  // 1 — position in declaration order, starting at 0

for (OrderStatus s : OrderStatus.values()) {  // values() returns all constants, in declaration order
    System.out.println(s);
}
```

<div class="callout warning">
<div class="callout-title"><span>⚠️</span>Don't Rely on ordinal() for Business Logic</div>

`ordinal()` reflects declaration order, which is fragile — inserting a new constant in the middle silently shifts every ordinal after it. Never persist an ordinal to a database or use it for comparison logic; if you need an explicit numeric code, add your own field instead.
</div>

### Constant-Specific Method Bodies

Each enum constant can override a method with its own implementation, which is a clean alternative to a `switch` over the enum inside every method:

```java
public enum Operation {
    ADD {
        @Override
        public int apply(int a, int b) { return a + b; }
    },
    SUBTRACT {
        @Override
        public int apply(int a, int b) { return a - b; }
    };

    public abstract int apply(int a, int b);
}

System.out.println(Operation.ADD.apply(3, 4));       // 7
System.out.println(Operation.SUBTRACT.apply(3, 4));  // -1
```

### Implementing Interfaces

```java
public interface Describable {
    String describe();
}

public enum PaymentMethod implements Describable {
    CREDIT_CARD, PAYPAL;

    @Override
    public String describe() {
        return "Payment via " + name();
    }
}
```

### The Enum Singleton Pattern

Because the JVM guarantees each enum constant is instantiated exactly once — even under reflection or serialization, which can break other singleton implementations — a single-constant enum is a robust way to write a singleton:

```java
public enum ConfigurationManager {
    INSTANCE;

    private final Map<String, String> settings = new HashMap<>();

    public String get(String key) { return settings.get(key); }
}

ConfigurationManager.INSTANCE.get("api.url");
```

### EnumMap and EnumSet

For maps/sets keyed by enum constants, `EnumMap`/`EnumSet` are more memory-efficient than `HashMap`/`HashSet` (backed by an array indexed by ordinal) and iterate in declaration order:

```java
Map<OrderStatus, Integer> countsByStatus = new EnumMap<>(OrderStatus.class);
countsByStatus.put(OrderStatus.COMPLETED, 42);

Set<OrderStatus> activeStatuses = EnumSet.of(OrderStatus.PENDING, OrderStatus.PROCESSING);
```

---

## Optional

### The Problem

`null` is the "billion-dollar mistake". It causes `NullPointerException`:

```java
Customer customer = getCustomer(123);
System.out.println(customer.getName());  // NPE if customer is null
```

### Optional Solution

```java
Optional<Customer> customer = getCustomer(123);

// Check if present
if (customer.isPresent()) {
    System.out.println(customer.get().getName());
}

// Cleaner – using ifPresent
customer.ifPresent(c -> System.out.println(c.getName()));

// Or ifPresentOrElse
customer.ifPresentOrElse(
    c -> System.out.println(c.getName()),
    () -> System.out.println("Not found")
);
```

### Common Optional Methods

```java
Optional<String> name = Optional.of("Alice");

// get() – throws if empty
String value = name.get();

// orElse – default value
String value = name.orElse("Unknown");

// orElseGet – compute default
String value = name.orElseGet(() -> "Unknown");

// orElseThrow – throw exception if empty
String value = name.orElseThrow();

// map – transform
Optional<Integer> length = name.map(String::length);

// filter – conditional
Optional<String> validName = name.filter(n -> n.length() > 3);

// flatMap – chain optionals
Optional<Order> order = customerId
    .flatMap(id -> getCustomer(id))
    .flatMap(c -> getOrder(c));
```

### Optional.of vs. Optional.ofNullable

Picking the wrong factory method turns `Optional` from a safety net into a source of surprise NPEs:

```java
Optional<String> a = Optional.of("value");     // Throws NullPointerException immediately if the argument is null
Optional<String> b = Optional.ofNullable(maybeNullValue);  // Wraps null safely into Optional.empty()
Optional<String> c = Optional.empty();          // Explicitly empty, no value at all
```

Use `Optional.of(...)` only when you can prove the value is never null at that point — it's a deliberate fail-fast assertion. Use `Optional.ofNullable(...)` when the value genuinely might be null (e.g., wrapping the result of a legacy API).

### isPresent()/get() Is Just null-Checking in Disguise

```java
// WRONG – this defeats the entire purpose of Optional; it's the exact same NPE risk as a null check
if (customer.isPresent()) {
    System.out.println(customer.get().getName());
}

// CORRECT – let Optional express the control flow for you
customer.map(Customer::getName).ifPresentOrElse(
    System.out::println,
    () -> System.out.println("Not found")
);
```

### isEmpty() (Java 11+)

The inverse check, for when the "not present" branch reads more naturally first:

```java
if (customer.isEmpty()) {
    throw new CustomerNotFoundException(id);
}
```

### or() and stream()

```java
// or() – fall back to a different Optional-producing supplier, lazily
Optional<Customer> customer = findInCache(id).or(() -> findInDatabase(id));

// stream() – bridges Optional into the Streams API; empty Optional becomes an empty Stream
List<Customer> found = ids.stream()
    .map(this::findCustomer)     // Stream<Optional<Customer>>
    .flatMap(Optional::stream)   // Stream<Customer>, empties silently dropped
    .toList();
```

### When NOT to Use Optional

<div class="callout warning">
<div class="callout-title"><span>⚠️</span>Optional Misuse</div>

```java
// WRONG – using Optional as a method parameter
public void processCustomer(Optional<Customer> customer) { }

// CORRECT – use in return types
public Optional<Customer> getCustomer(String id) { }

// WRONG – storing Optional in fields
private Optional<String> name;

// CORRECT – use Optional only for return types and local variables

// WRONG – Optional for a collection type
public Optional<List<Order>> getOrders() { }

// CORRECT – an empty collection already means "nothing found"; no Optional needed
public List<Order> getOrders() { }  // Return List.of() instead of null

// WRONG – using Optional in method arguments to fake "optional parameters"
public Invoice createInvoice(Optional<String> notes) { }

// CORRECT – use method overloading, or accept a plain nullable String with a documented default
public Invoice createInvoice(String notes) { }
```

`Optional` was designed specifically as a **return type** to make "this might not have a value" explicit and force callers to handle it. Using it anywhere else (parameters, fields, collections) adds serialization/boxing overhead and boilerplate without the corresponding benefit.
</div>

---

## Switch Expressions

### Traditional Switch Statement

```java
int day = 2;
String dayName;

switch (day) {
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

### Switch Expression (Java 14+)

```java
int day = 2;
String dayName = switch (day) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    case 3 -> "Wednesday";
    default -> "Unknown";
};
```

### Multiple Values

```java
String time = switch (hour) {
    case 6, 7, 8, 9 -> "Morning";
    case 12 -> "Noon";
    case 18, 19, 20, 21, 22 -> "Evening";
    default -> "Other";
};
```

---

## Text Blocks

### Traditional String Concatenation

```java
String json = "{\n" +
    "  \"id\": \"123\",\n" +
    "  \"name\": \"Alice\",\n" +
    "  \"email\": \"alice@example.com\"\n" +
}";
```

### Text Blocks (Java 15+)

```java
String json = """
    {
      "id": "123",
      "name": "Alice",
      "email": "alice@example.com"
    }
    """;
```

### With String Interpolation (Java 21 preview)

```java
String id = "123";
String name = "Alice";

String json = """
    {
      "id": "\{id}",
      "name": "\{name}"
    }
    """;
```

---

## Summary

- **Records**: Immutable data classes with auto-generated methods (Java 16+)
- **Sealed classes**: Control which classes can extend yours (Java 17+)
- **Pattern matching**: Cleaner instanceof and switch (Java 16+/21+)
- **Enums**: Type-safe constants with behavior
- **Optional**: Better than null for optional values
- **Switch expressions**: Cleaner, more expressive switch (Java 14+)
- **Text blocks**: Multi-line strings without concatenation (Java 15+)

---

## Further Reading

- [Baeldung – Records](https://www.baeldung.com/java-record-keyword){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Sealed Classes](https://www.baeldung.com/java-sealed-classes-interfaces){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Enums](https://www.baeldung.com/a-guide-to-java-enums){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Guide to Java Enums (Advanced)](https://www.baeldung.com/java-enum-values){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Optional](https://www.baeldung.com/java-optional){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Guide to Java 8 Optional](https://www.baeldung.com/java-optional-guide){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Switch Pattern Matching](https://www.baeldung.com/java-switch-pattern-matching){:target="_blank" rel="noopener noreferrer"}
- [Oracle – Pattern Matching](https://docs.oracle.com/en/java/javase/21/language/pattern-matching.html){:target="_blank" rel="noopener noreferrer"}

---

<div class="chapter-nav">
<a href="{{ '/docs/15-immutability-and-relationships' | relative_url }}" class="btn btn-secondary">← Previous: Immutability & Object Relationships</a>
<div class="chapter-nav-spacer"></div>
<a href="{{ '/docs/04-equals-hashcode' | relative_url }}" class="btn">Next: equals() & hashCode() →</a>
</div>
