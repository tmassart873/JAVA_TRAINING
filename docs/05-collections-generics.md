---
layout: default
title: Collections & Generics
subtitle: Lists, Sets, Maps, and type-safe data structures
type: docs
quiz:
  - question: "Which collection type does not allow duplicate elements?"
    options: ["List", "Set", "Map", "Queue"]
    answer: 1
  - question: "Which collection stores data as key-value pairs?"
    options: ["List", "Set", "Map", "Deque"]
    answer: 2
  - question: "What is the main benefit of the diamond operator (<>)?"
    options: ["It enables multiple inheritance", "It lets the compiler infer the generic type", "It removes the need for interfaces", "It boosts runtime performance"]
    answer: 1
  - question: "A HashMap resizes (doubles its bucket array) once it exceeds what fraction of capacity, by default?"
    options: ["0.5", "0.75", "0.9", "1.0 — only when completely full"]
    answer: 1
  - question: "Why can two Product objects with equal price but different name both end up as size 1 in a TreeSet, even though equals() considers them different?"
    options: ["This is a JVM bug", "TreeSet uses compareTo(), not equals(), to determine 'sameness' — if compareTo() only checks price, elements with equal price are treated as duplicates", "TreeSet always deduplicates by hashCode()", "TreeSet ignores the second element added"]
    answer: 1
  - question: "Due to type erasure, which of these is illegal in Java?"
    options: ["List<?> list", "if (obj instanceof List<?>)", "if (obj instanceof List<String>)", "List<String> list = new ArrayList<>()"]
    answer: 2
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

### How HashMap Actually Works Internally

`HashMap` achieves its average O(1) `get`/`put` using a **bucket array**: each key's `hashCode()` is used to compute which bucket it belongs to, and keys that land in the same bucket (a **collision**) are chained together and distinguished using `equals()` — this is the same mechanism covered in [equals() & hashCode()](../04-equals-hashcode/#how-hashmap-uses-equals-and-hashcode).

Two details explain HashMap's performance characteristics in practice:

- **Load factor (default 0.75)**: once the map is more than 75% full relative to its current bucket-array size, it automatically **resizes** — doubling the array and rehashing every entry into a new bucket. This keeps average lookup time roughly constant as the map grows, at the cost of an occasional expensive resize operation.
- **Treeification (Java 8+)**: if a single bucket accumulates too many colliding entries (8 or more, by default), Java converts that bucket's linked chain into a small red-black tree, so lookups within a badly-collided bucket degrade to O(log n) instead of O(n) — a defense against poor `hashCode()` implementations or hash-flooding attacks.

```
Simplified internal shape of a HashMap<String, Integer>:

buckets[0]: []
buckets[1]: [("Go", 40)]
buckets[2]: [("Java", 85) -> ("Rust", 25)]   // Collision: both hash to bucket 2, chained
buckets[3]: [("Python", 90)]
```

<div class="callout concept">
<div class="callout-title"><span>💡</span>HashSet Is Just a HashMap in Disguise</div>

`HashSet` is internally implemented as a `HashMap` where every element is stored as a **key**, mapped to a single shared dummy value. This is why `HashSet` has the exact same performance characteristics (average O(1), same load-factor/treeification behavior) and the same requirement that elements correctly implement `equals()`/`hashCode()`.
</div>

### Map Initialization Idioms

```java
// Small, fixed, immutable map (Java 9+) — cleanest for constants/config
Map<String, Integer> fixed = Map.of("A", 1, "B", 2, "C", 3);  // Max 10 pairs with Map.of(...)

// Larger fixed sets of entries
Map<String, Integer> larger = Map.ofEntries(
    Map.entry("A", 1),
    Map.entry("B", 2)
);

// Need a MUTABLE map that starts pre-populated
Map<String, Integer> mutable = new HashMap<>(Map.of("A", 1, "B", 2));  // Map.of(...) itself is immutable

// Building a map from a Stream
Map<String, Integer> fromStream = names.stream()
    .collect(Collectors.toMap(name -> name, String::length));
```

`Map.of(...)` returns an immutable map — calling `put`/`remove` on it throws `UnsupportedOperationException`. Wrap it in `new HashMap<>(...)` when you need a starting point you can still mutate.

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

### Type Erasure

Generic type information exists only at **compile time** — the compiler uses it to check your code, then erases it, replacing type parameters with `Object` (or their bound) in the compiled bytecode. This has real, observable consequences:

```java
List<String> strings = new ArrayList<>();
List<Integer> integers = new ArrayList<>();

System.out.println(strings.getClass() == integers.getClass());  // true! Both are just ArrayList at runtime

// You cannot do this — the generic type isn't available at runtime to check against:
// if (obj instanceof List<String>) { }   // COMPILE ERROR
if (obj instanceof List<?>) { }            // OK — unbounded wildcard is fine

// You cannot create an array of a generic type:
// T[] array = new T[10];   // COMPILE ERROR
```

This is why generics are described as **compile-time-only type safety**: the checks protect you while writing code, but the erased bytecode has no memory of what `T` was.

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

<div class="callout warning">
<div class="callout-title"><span>⚠️</span>compareTo() Should Be Consistent With equals()</div>

The `Comparable` contract strongly recommends (though doesn't strictly enforce at compile time) that `x.compareTo(y) == 0` should imply `x.equals(y) == true`. Violating this doesn't break `compareTo()` itself, but silently corrupts sorted collections like `TreeSet`/`TreeMap`, which use `compareTo()` — **not** `equals()` — to decide whether two elements are "the same":

```java
public class Product implements Comparable<Product> {
    private String name;
    private double price;

    @Override
    public int compareTo(Product other) {
        return Double.compare(this.price, other.price);  // Only compares price
    }
    // equals() compares name AND price (not shown)
}

Set<Product> products = new TreeSet<>();
products.add(new Product("Widget", 10.0));
products.add(new Product("Gadget", 10.0));  // Same price, different name/equals()

System.out.println(products.size());  // 1, not 2! TreeSet used compareTo()==0 to treat them as duplicates
```

If a class's natural ordering can't respect this rule (e.g., sorting by price alone while equality considers more fields), document it clearly and prefer an explicit `Comparator` instead of `Comparable` for that ordering.
</div>

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

### Built-In Comparator Factories

```java
List<String> names = new ArrayList<>(List.of("charlie", "alice", null, "bob"));

names.sort(Comparator.naturalOrder());               // Natural (alphabetical) order — throws NPE on the null
names.sort(Comparator.reverseOrder());               // Reverse of natural order — also throws NPE on null

names.sort(Comparator.nullsFirst(Comparator.naturalOrder()));  // nulls sort first, then natural order
names.sort(Comparator.nullsLast(Comparator.naturalOrder()));   // nulls sort last, then natural order
```

`nullsFirst`/`nullsLast` wrap another `Comparator` and handle `null` explicitly — without one of them, sorting a list that can contain `null` throws `NullPointerException` the moment two elements are compared where one is `null`.

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

- [Baeldung – ArrayList](https://www.baeldung.com/java-arraylist){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – HashMap](https://www.baeldung.com/java-hashmap){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – HashSet](https://www.baeldung.com/java-hashset){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Generics](https://www.baeldung.com/java-generics){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Comparator and Comparable](https://www.baeldung.com/java-comparator-comparable){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Map.of and Map.ofEntries](https://www.baeldung.com/java-9-immutable-collections){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Collections API](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Collections.html){:target="_blank" rel="noopener noreferrer"}

For a deep dive on `java.util.Arrays`, `ArrayList` vs. `LinkedList` internals, and how `Iterator`/`Iterable` actually work, see [Arrays, Iterators & Conversions](../17-arrays-iterators-and-conversions/).

---

<div class="chapter-nav">
<a href="{{ '/docs/04-equals-hashcode' | relative_url }}" class="btn btn-secondary">← Previous: equals() & hashCode()</a>
<div class="chapter-nav-spacer"></div>
<a href="{{ '/docs/17-arrays-iterators-and-conversions' | relative_url }}" class="btn">Next: Arrays, Iterators & Conversions →</a>
</div>
