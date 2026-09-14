---
layout: default
title: Collections & Generics
subtitle: Lists, Sets, Maps, and type-safe data structures
type: docs
---

## Collections Hierarchy

### The Main Interfaces

```
Collection
├── List        (ordered, allows duplicates)
├── Set         (unordered, no duplicates)
└── Map         (key-value pairs)
```

### Common Implementations

| Interface | Implementation | Ordered | Synchronized | Use Case |
|-----------|----------------|---------|--------------|----------|
| List | ArrayList | Yes | No | Default choice |
| List | LinkedList | Yes | No | Frequent insertions |
| Set | HashSet | No | No | Unique values |
| Set | TreeSet | Yes (sorted) | No | Sorted unique values |
| Map | HashMap | No | No | Default choice |
| Map | LinkedHashMap | Yes | No | Insertion order preserved |
| Map | TreeMap | Yes (sorted) | No | Sorted by key |

---

## List

### ArrayList

```java
// Create
List<String> names = new ArrayList<>();
names.add("Alice");
names.add("Bob");
names.add("Charlie");

// Access
System.out.println(names.get(0));  // "Alice"
System.out.println(names.size());  // 3

// Modify
names.set(1, "Robert");
names.remove(0);

// Iterate
for (String name : names) {
    System.out.println(name);
}

// Stream
names.stream()
    .filter(n -> n.startsWith("A"))
    .forEach(System.out::println);
```

### LinkedList

```java
// Better for frequent insertions
List<String> list = new LinkedList<>();
list.add("A");
list.add("B");

// Insert at beginning – O(1) for LinkedList, O(n) for ArrayList
list.add(0, "Z");

// Remove – O(n) for both, but LinkedList better at start
list.remove(0);
```

### When to Use

- **ArrayList**: Default choice. Random access O(1), insertion O(n)
- **LinkedList**: Frequent insertions at start/middle

---

## Set

### HashSet

```java
Set<String> tags = new HashSet<>();
tags.add("java");
tags.add("spring");
tags.add("java");  // Duplicate – not added

System.out.println(tags.size());  // 2

// Unordered
for (String tag : tags) {
    System.out.println(tag);  // Order unpredictable
}

// Contains
System.out.println(tags.contains("java"));  // true
```

### TreeSet (Sorted)

```java
Set<String> tags = new TreeSet<>();
tags.add("zebra");
tags.add("apple");
tags.add("banana");

for (String tag : tags) {
    System.out.println(tag);  // apple, banana, zebra (sorted)
}

// Requires natural ordering or custom Comparator
Set<Integer> numbers = new TreeSet<>();
numbers.add(3);
numbers.add(1);
numbers.add(2);
// 1, 2, 3 (sorted)
```

### LinkedHashSet (Insertion Order)

```java
Set<String> tags = new LinkedHashSet<>();
tags.add("java");
tags.add("spring");
tags.add("maven");

for (String tag : tags) {
    System.out.println(tag);  // java, spring, maven (insertion order)
}
```

---

## Map

### HashMap

```java
Map<String, Integer> population = new HashMap<>();
population.put("Java", 85);
population.put("Python", 90);
population.put("Go", 40);

// Retrieve
System.out.println(population.get("Java"));  // 85

// Iterate
for (String language : population.keySet()) {
    System.out.println(language + ": " + population.get(language));
}

// Iterate entries (more efficient)
for (Map.Entry<String, Integer> entry : population.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}

// Iterate values
for (Integer count : population.values()) {
    System.out.println(count);
}

// Contains
System.out.println(population.containsKey("Python"));    // true
System.out.println(population.containsValue(85));        // true

// Remove
population.remove("Go");

// computeIfAbsent – useful pattern
population.computeIfAbsent("Rust", k -> 25);
```

### TreeMap (Sorted by Key)

```java
Map<String, Integer> sorted = new TreeMap<>();
sorted.put("zebra", 1);
sorted.put("apple", 3);
sorted.put("banana", 2);

for (String key : sorted.keySet()) {
    System.out.println(key);  // apple, banana, zebra (sorted)
}

// First and last
System.out.println(sorted.firstKey());  // "apple"
System.out.println(sorted.lastKey());   // "zebra"
```

### LinkedHashMap (Insertion Order)

```java
Map<String, String> linked = new LinkedHashMap<>();
linked.put("first", "A");
linked.put("second", "B");
linked.put("third", "C");

for (String key : linked.keySet()) {
    System.out.println(key);  // first, second, third (insertion order)
}
```

---

## Generics

### Generic Classes

```java
public class Box<T> {
    private T content;
    
    public void put(T item) {
        this.content = item;
    }
    
    public T get() {
        return content;
    }
}

// Usage
Box<String> stringBox = new Box<>();
stringBox.put("Hello");
String value = stringBox.get();  // No cast needed

Box<Integer> intBox = new Box<>();
intBox.put(42);
Integer number = intBox.get();
```

### Generic Methods

```java
public class Utils {
    public static <T> void printArray(T[] array) {
        for (T item : array) {
            System.out.println(item);
        }
    }
    
    public static <T> T getFirst(List<T> list) {
        return list.isEmpty() ? null : list.get(0);
    }
}

Utils.printArray(new String[]{"A", "B", "C"});
Utils.printArray(new Integer[]{1, 2, 3});
```

### Type Bounds

**Upper Bound – extends**

```java
// T must be Number or subclass
public <T extends Number> double sum(List<T> numbers) {
    double total = 0;
    for (T num : numbers) {
        total += num.doubleValue();
    }
    return total;
}

sum(List.of(1, 2, 3));           // OK
sum(List.of(1.5, 2.5));          // OK
sum(List.of("a", "b"));          // Compiler error
```

**Multiple Bounds**

```java
// T must be Serializable AND Comparable
public <T extends Comparable<T> & Serializable> void process(T item) {
    // ...
}
```

**Lower Bound – super**

```java
// T must be Number or superclass
public void addNumbers(List<? super Integer> list) {
    list.add(5);  // OK
}

List<Integer> intList = new ArrayList<>();
List<Number> numList = new ArrayList<>();

addNumbers(intList);   // OK
addNumbers(numList);   // OK
```

### Wildcards

**Unbounded Wildcard**

```java
// Works with any type
public void printList(List<?> list) {
    for (Object item : list) {
        System.out.println(item);
    }
}

List<String> strings = List.of("A", "B");
List<Integer> numbers = List.of(1, 2);

printList(strings);
printList(numbers);
```

**Upper Bound Wildcard**

```java
// Accept List of Number or subclasses
public void processNumbers(List<? extends Number> numbers) {
    for (Number num : numbers) {
        System.out.println(num);
    }
}

processNumbers(List.of(1, 2, 3));        // OK
processNumbers(List.of(1.5, 2.5));       // OK
processNumbers(List.of("a", "b"));       // Compiler error
```

---

## Diamond Operator

### Before Java 7

```java
Map<String, List<Integer>> map = 
    new HashMap<String, List<Integer>>();  // Verbose
```

### Java 7+ (Diamond Operator)

```java
Map<String, List<Integer>> map = 
    new HashMap<>();  // Type inferred from left side
```

---

## Comparable and Comparator

### Comparable (Natural Order)

```java
public class Product implements Comparable<Product> {
    private String name;
    private double price;
    
    @Override
    public int compareTo(Product other) {
        if (this.price < other.price) return -1;
        if (this.price > other.price) return 1;
        return 0;
        // Or: return Double.compare(this.price, other.price);
    }
}

List<Product> products = new ArrayList<>();
products.add(new Product("B", 20));
products.add(new Product("A", 10));

Collections.sort(products);  // Sorts by price (natural order)
```

### Comparator (Custom Order)

```java
List<String> names = List.of("charlie", "alice", "bob");

// Sort by length
List<String> byLength = names.stream()
    .sorted(Comparator.comparingInt(String::length))
    .toList();

// Sort by value
List<String> byValue = names.stream()
    .sorted()
    .toList();

// Custom comparator
List<Product> products = new ArrayList<>();
// Sort by name
products.sort(Comparator.comparing(Product::getName));

// Sort by price descending
products.sort(Comparator.comparingDouble(Product::getPrice).reversed());

// Multiple criteria
products.sort(
    Comparator.comparing(Product::getCategory)
        .thenComparingDouble(Product::getPrice)
);
```

---

## Immutable Collections

### Pre-Java 9

```java
List<String> list = Collections.unmodifiableList(
    new ArrayList<>(Arrays.asList("A", "B", "C"))
);
```

### Java 9+ (Preferred)

```java
List<String> list = List.of("A", "B", "C");  // Immutable
Set<String> set = Set.of("A", "B", "C");
Map<String, Integer> map = Map.of("A", 1, "B", 2);

// list.add("D");  // UnsupportedOperationException
```

---

## Common Mistakes

### Mistake 1: Comparing Strings Incorrectly

```java
// WRONG
if (name == "Alice") { }  // Reference equality!

// CORRECT
if (name.equals("Alice")) { }
if (name.contains("Ali")) { }
```

### Mistake 2: ConcurrentModificationException

```java
// WRONG
List<String> names = new ArrayList<>(List.of("A", "B"));
for (String name : names) {
    if (name.equals("B")) {
        names.remove(name);  // ConcurrentModificationException!
    }
}

// CORRECT
names.removeIf(name -> name.equals("B"));

// Or iterator
Iterator<String> it = names.iterator();
while (it.hasNext()) {
    if (it.next().equals("B")) {
        it.remove();  // Safe
    }
}
```

### Mistake 3: Modifying HashMap While Iterating

```java
// WRONG
Map<String, Integer> map = new HashMap<>(Map.of("A", 1, "B", 2));
for (String key : map.keySet()) {
    if (key.equals("B")) {
        map.remove(key);  // ConcurrentModificationException!
    }
}

// CORRECT
map.entrySet().removeIf(entry -> entry.getKey().equals("B"));
```

---

## Summary

- **ArrayList**: Default List choice (O(1) access, O(n) insertion)
- **LinkedList**: Better for frequent insertions at start/middle
- **HashSet**: Default Set choice (unordered, fast lookup)
- **TreeSet**: When you need sorted order
- **HashMap**: Default Map choice (O(1) lookup)
- **Generics**: Type-safe collections, avoid raw types
- **Wildcards**: `?` for unknown type, `? extends` for upper bound, `? super` for lower bound
- **Immutable**: Use List.of(), Set.of(), Map.of() in Java 9+

---

## Further Reading

- [Baeldung – ArrayList](https://www.baeldung.com/java-arraylist)
- [Baeldung – HashMap](https://www.baeldung.com/java-hashmap)
- [Baeldung – HashSet](https://www.baeldung.com/java-hashset)
- [Baeldung – Generics](https://www.baeldung.com/java-generics)
- [Baeldung – Collections API](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Collections.html)

---

<div class="chapter-nav">
<a href="/docs/04-equals-hashcode" class="btn btn-secondary">← Previous: equals() & hashCode()</a>
<div class="chapter-nav-spacer"></div>
<a href="/docs/06-functional-java" class="btn">Next: Functional Java & Streams →</a>
</div>
