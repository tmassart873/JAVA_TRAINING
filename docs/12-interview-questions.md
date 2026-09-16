---
layout: default
title: Java Interview Questions
subtitle: 20 technical questions and detailed answers
type: docs
quiz:
  - question: "What's the best way to use this chapter before a technical interview?"
    options: ["Memorize answers word for word", "Read them once and move on", "Explain each answer in your own words until it's fluent", "Skip topics you already studied elsewhere"]
    answer: 2
  - question: "Which of these topics is covered alongside core Java concepts here?"
    options: ["Only syntax trivia", "Collections, Generics, Strings, Exceptions and functional programming", "Only database questions", "Only design patterns"]
    answer: 1
---

## Core Java Concepts

### Q1: Is Java pass-by-value or pass-by-reference?

**Answer**: Java is **strictly pass-by-value**. When you pass an object, you're passing a copy of the reference (the memory address), not the object itself. This has important implications.

```java
public void modifyObject(Customer customer) {
    customer.setName("Changed");  // Modifies the object (same heap location)
    customer = new Customer("New");  // Changes local copy of reference
}

Customer c = new Customer("Original");
modifyObject(c);
System.out.println(c.getName());  // "Changed" (modified in place)
                                  // But c still references the original object

// You can't do this in Java:
public void changeReference(Customer customer) {
    customer = new Customer("New");  // Only changes local copy of reference
}
// The original reference in the calling method is unchanged
```

---

### Q2: What's the difference between == and equals()?

**Answer**: 
- `==`: Compares **references** (memory addresses) - for primitives, compares values
- `equals()`: Compares **values** - should be overridden for custom comparison logic

```java
String a = new String("hello");
String b = new String("hello");

a == b;        // false – different objects in memory
a.equals(b);   // true – same content

Customer c1 = new Customer("123", "Alice");
Customer c2 = new Customer("123", "Alice");

c1 == c2;      // false – different objects (unless equals() overridden)
c1.equals(c2); // false – uses default Object.equals() (reference equality)
               // true – if equals() is properly overridden
```

---

### Q3: Why must hashCode() and equals() be consistent?

**Answer**: HashMap/HashSet use both to prevent duplicates and enable fast lookups.

```java
// WRONG
public class BadKey {
    @Override
    public boolean equals(Object obj) {
        return true;  // Everything is equal
    }
    
    @Override
    public int hashCode() {
        return 1;     // Everything hashes to same bucket
    }
}

// Result: HashMap becomes O(n) instead of O(1)
Map<BadKey, String> map = new HashMap<>();
for (int i = 0; i < 1000; i++) {
    map.put(new BadKey(), "value");  // All go to same bucket!
}
// Lookup becomes slow because of hash collisions
```

**Contract**: If `a.equals(b)`, then `a.hashCode() == b.hashCode()` must be true.

---

### Q4: Can you use mutable objects as HashMap keys?

**Answer**: Technically yes, but it's very dangerous.

```java
class MutableKey {
    private int value;
    public MutableKey(int value) { this.value = value; }
    public void setValue(int v) { this.value = v; }
    
    @Override
    public int hashCode() { return value; }
    @Override
    public boolean equals(Object o) {
        return this.value == ((MutableKey)o).value;
    }
}

Map<MutableKey, String> map = new HashMap<>();
MutableKey key = new MutableKey(5);
map.put(key, "value");

System.out.println(map.get(key));  // "value" – found!

key.setValue(10);  // Mutate the key!

System.out.println(map.get(key));  // null – can't find it!
// Why? Hash bucket changed but HashMap doesn't know to look in new bucket
```

**Solution**: Always use immutable keys (String, Integer, records, etc.)

---

## Collections

### Q5: ArrayList vs LinkedList – when to use each?

**Answer**:

| Operation | ArrayList | LinkedList |
|-----------|-----------|-----------|
| Access `get(i)` | O(1) | O(n) |
| Insert `add()` | O(n) | O(1) if at end |
| Insert at start | O(n) | O(1) |
| Remove at end | O(1) | O(1) |
| Remove at start | O(n) | O(1) |
| Memory | Less overhead | More overhead (pointers) |

**Use ArrayList** (default choice) unless you frequently insert/remove at the beginning.

```java
// CORRECT – ArrayList for iteration and random access
List<String> names = new ArrayList<>();
for (String name : names) {
    System.out.println(name);
}

// WRONG – LinkedList for iteration (wasteful)
List<String> names = new LinkedList<>();
for (String name : names) {  // O(n²) – each iteration walks the list
    System.out.println(name);
}
```

---

### Q6: HashSet vs HashMap?

**Answer**: 
- **HashSet<T>**: Set of unique values, implements Set interface
- **HashMap<K, V>**: Key-value pairs, implements Map interface

```java
// HashSet – only values
Set<String> tags = new HashSet<>();
tags.add("java");
tags.add("spring");
System.out.println(tags.contains("java"));  // true

// HashMap – key-value
Map<String, Integer> counts = new HashMap<>();
counts.put("java", 85);
counts.put("spring", 70);
System.out.println(counts.get("java"));  // 85
```

---

### Q7: When should I use TreeMap/TreeSet?

**Answer**: When you need **sorted order**.

```java
// HashMap – insertion order unpredictable
Map<String, Integer> map = new HashMap<>();
map.put("zebra", 1);
map.put("apple", 2);
map.put("banana", 3);
// Order: unpredictable

// TreeMap – sorted by key
Map<String, Integer> sorted = new TreeMap<>();
sorted.put("zebra", 1);
sorted.put("apple", 2);
sorted.put("banana", 3);
// Order: apple, banana, zebra (sorted)

// LinkedHashMap – insertion order preserved
Map<String, Integer> linked = new LinkedHashMap<>();
linked.put("zebra", 1);
linked.put("apple", 2);
linked.put("banana", 3);
// Order: zebra, apple, banana (insertion order)
```

---

## Generics

### Q8: What are wildcards in generics?

**Answer**: Wildcards allow flexible but type-safe generic programming.

```java
// Unbounded wildcard – unknown type
public void printList(List<?> list) {
    for (Object item : list) {
        System.out.println(item);
    }
}

// Upper bounded – must be subtype of Number
public void processNumbers(List<? extends Number> numbers) {
    // Can read
    for (Number num : numbers) { }
    // Can't add (except null) – type unknown
}

// Lower bounded – must be supertype of Integer
public void addIntegers(List<? super Integer> list) {
    list.add(5);  // Safe to add Integer
    // Can't read as Integer – type might be Number or Object
}
```

---

### Q9: What is the diamond operator?

**Answer**: Type inference that avoids verbosity.

```java
// Before Java 7 – verbose
Map<String, List<Integer>> map = new HashMap<String, List<Integer>>();

// Java 7+ – diamond operator infers type
Map<String, List<Integer>> map = new HashMap<>();

// Also works in variable declarations
var map = new HashMap<String, List<Integer>>();
```

---

## Strings

### Q10: Why is String immutable?

**Answer**: Multiple benefits:

1. **Thread safety**: Safe to share between threads without synchronization
2. **Caching**: JVM can intern strings (String pool)
3. **Security**: String contents can't be unexpectedly modified
4. **Hashing**: Hash code is stable for use in HashMap/HashSet

```java
// Thread-safe – multiple threads can share String without synchronization
String immutable = "hello";
new Thread(() -> System.out.println(immutable)).start();
new Thread(() -> System.out.println(immutable)).start();
// Safe – immutable can't be modified

// HashMap safe
Set<String> set = new HashSet<>();
String key = "java";
set.add(key);
// Can't modify key later, so hash code remains valid
```

---

### Q11: String concatenation with + vs StringBuilder

**Answer**: Use StringBuilder for repeated concatenation, not + in loops.

```java
// WRONG – creates many temporary strings
String result = "";
for (String item : items) {
    result += item + ", ";  // Creates new String each iteration
}

// CORRECT – StringBuilder reuses buffer
StringBuilder sb = new StringBuilder();
for (String item : items) {
    sb.append(item).append(", ");
}
String result = sb.toString();

// FINE – single concatenation
String result = a + b;  // Compiler optimizes this
```

---

## Exceptions

### Q12: Checked vs unchecked exceptions?

**Answer**:

| Aspect | Checked | Unchecked |
|--------|---------|-----------|
| Example | IOException, SQLException | NullPointerException, IllegalArgumentException |
| Must handle? | Yes (catch or throws) | No |
| For what? | External errors (files, DB) | Programming errors |
| Recovery? | Usually recoverable | Usually unrecoverable |

```java
// Checked – must handle
public void readFile(String path) throws IOException {
    Files.readString(Paths.get(path));
}

// Caller must catch
try {
    readFile("file.txt");
} catch (IOException e) {
    System.out.println("File error");
}

// Unchecked – no throws needed
public void process(int[] array, int index) {
    int value = array[index];  // ArrayIndexOutOfBoundsException – unchecked
}
```

---

### Q13: Should I create custom exceptions?

**Answer**: Yes, for domain-specific errors, but keep them lightweight.

```java
// Good – domain-specific, provides context
public class InsufficientFundsException extends Exception {
    private double shortfall;
    public InsufficientFundsException(double shortfall) {
        super("Insufficient funds: short by $" + shortfall);
        this.shortfall = shortfall;
    }
}

// Bad – redundant
public class ConnectionFailedException extends Exception {
    // Just use IOException
}

// Good – extends RuntimeException for validation
public class InvalidProductException extends RuntimeException {
    public InvalidProductException(String productCode) {
        super("Invalid product: " + productCode);
    }
}
```

---

## Functional Programming

### Q14: What is a functional interface?

**Answer**: An interface with exactly one abstract method. Can be implemented with a lambda.

```java
@FunctionalInterface
public interface Processor<T> {
    T process(T input);
}

// Implement with lambda
Processor<String> uppercase = s -> s.toUpperCase();
String result = uppercase.process("hello");  // "HELLO"

// Built-in functional interfaces
Consumer<String> printer = s -> System.out.println(s);  // Returns nothing
Supplier<LocalDateTime> now = () -> LocalDateTime.now();  // Returns value
Function<String, Integer> length = s -> s.length();  // Transform
Predicate<Integer> isEven = n -> n % 2 == 0;  // Test
```

---

### Q15: What is lazy evaluation in Streams?

**Answer**: Intermediate operations don't execute until a terminal operation.

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5);

Stream<Integer> stream = numbers.stream()
    .filter(n -> {
        System.out.println("Filtering " + n);
        return n > 2;
    })
    .map(n -> {
        System.out.println("Mapping " + n);
        return n * 2;
    });

// Nothing printed yet – stream not executed

System.out.println("Starting terminal operation");
List<Integer> result = stream.collect(Collectors.toList());
// Now "Filtering" and "Mapping" are printed
```

---

### Q16: When should you NOT use Streams?

**Answer**: Streams are great for data processing, but not always the best choice.

```java
// WRONG – Stream is overkill
List<String> items = Collections.emptyList();
List<String> result = items.stream()
    .collect(Collectors.toList());

// CORRECT – Just assign
List<String> result = items;

// WRONG – Deeply nested streams are hard to read
data.stream()
    .filter(...)
    .map(...)
    .flatMap(...)
    .filter(...)
    .map(...)
    .collect(Collectors.toList());

// CORRECT – Break into steps
Stream<Item> filtered = data.stream().filter(...);
Stream<Result> mapped = filtered.map(...);
List<Result> final = mapped.collect(Collectors.toList());

// WRONG – Side effects in map
numbers.stream()
    .map(n -> {
        results.add(n);  // Side effect!
        return n * 2;
    })
    .collect(Collectors.toList());

// CORRECT – Use forEach for side effects
numbers.stream()
    .peek(n -> results.add(n))
    .collect(Collectors.toList());
```

---

## OOP and Design

### Q17: Inheritance vs Composition?

**Answer**: Use inheritance for IS-A relationships, composition for HAS-A.

```java
// IS-A – Dog IS-A Animal (inheritance)
public class Dog extends Animal {
    public void bark() { }
}

// HAS-A – Car HAS-A Engine (composition)
public class Car {
    private Engine engine;
    public void start() {
        engine.start();
    }
}

// Prefer composition – it's more flexible
public class BadDesign extends BaseService {
    // Inherited everything from BaseService
}

public class GoodDesign {
    private BaseService service;  // Composed
    // More flexible to change
}
```

---

### Q18: Interface vs Abstract Class?

**Answer**:

| Aspect | Interface | Abstract Class |
|--------|-----------|----------------|
| Variables | Constants only | Any fields |
| Methods | Abstract + default | Abstract + concrete |
| Constructor | None | Yes |
| Use for | Contract | Code sharing + contract |

```java
// Interface – define contract
public interface Repository<T> {
    T findById(String id);
    void save(T entity);
}

// Abstract – provide shared code and contract
public abstract class BaseRepository<T> {
    protected Database db;
    
    public abstract T findById(String id);
    
    // Shared code
    protected void log(String message) {
        System.out.println(message);
    }
}
```

---

## Performance

### Q19: What is the difference between HashMap bucket and load factor?

**Answer**:
- **Bucket**: Slot in the internal array where entries are stored
- **Load factor**: Ratio of entries to bucket count. Default 0.75

When load factor exceeded, HashMap grows to avoid collisions.

```java
HashMap<String, String> map = new HashMap<>(16, 0.75f);
// 16 initial buckets
// When 12 entries added (75% of 16), grows to 32 buckets

// More entries than buckets = collisions = slower lookups
Map<Integer, String> bad = new HashMap<>(1);  // Only 1 bucket!
for (int i = 0; i < 1000; i++) {
    bad.put(i, "value");  // All go to same bucket, O(n) lookup!
}
```

---

## Modern Java

### Q20: What problem do Records solve?

**Answer**: Records eliminate boilerplate for immutable data classes.

```java
// Before – lots of boilerplate
public class Point {
    private final int x;
    private final int y;
    
    public Point(int x, int y) { this.x = x; this.y = y; }
    public int x() { return x; }
    public int y() { return y; }
    
    @Override
    public boolean equals(Object obj) { ... }
    @Override
    public int hashCode() { ... }
    @Override
    public String toString() { ... }
}

// After – concise record
public record Point(int x, int y) {}
// Constructor, getters, equals, hashCode, toString auto-generated
```

---

## Summary Table

| Topic | Key Concept | When/Why |
|-------|-----------|----------|
| Primitives vs Objects | Stack vs heap | Choose based on needs |
| equals/hashCode | Must override together | For collections and comparison |
| Collections | Choose data structure | ArrayList (default), HashSet (unique), HashMap (pairs) |
| Streams | Declarative processing | Transform collections functionally |
| Exceptions | Handle recoverable errors | Use checked for external, unchecked for logic |
| Generics | Type safety | Collections, frameworks |
| Strings | Immutable | Thread-safe, hashable |
| Records | Modern data carriers | Java 16+ for immutable objects |

---

## Further Reading

- [Baeldung Interview Questions](https://www.baeldung.com/java-interview-questions){:target="_blank" rel="noopener noreferrer"}
- [Oracle Java Documentation](https://docs.oracle.com/en/java/javase/21/){:target="_blank" rel="noopener noreferrer"}

---

<div class="chapter-nav">
<a href="{{ '/docs/11-exercises' | relative_url }}" class="btn btn-secondary">← Previous: Exercises</a>
<div class="chapter-nav-spacer"></div>
<a href="{{ '/docs/13-references' | relative_url }}" class="btn">Next: References →</a>
</div>
