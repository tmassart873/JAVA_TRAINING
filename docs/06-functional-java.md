---
layout: default
title: Functional Java & Streams
subtitle: Lambda expressions, functional interfaces, and Stream API
type: docs
---

## Functional Interfaces

### Definition

A functional interface has exactly one abstract method:

```java
@FunctionalInterface
public interface Processor<T> {
    T process(T input);
}

@FunctionalInterface
public interface Consumer<T> {
    void consume(T input);
}

@FunctionalInterface
public interface Validator<T> {
    boolean validate(T input);
}
```

The `@FunctionalInterface` annotation is optional but recommended.

### Built-in Functional Interfaces

```java
// Consumer – takes input, returns nothing
Consumer<String> printer = s -> System.out.println(s);
printer.accept("Hello");

// Supplier – returns a value
Supplier<LocalDateTime> now = () -> LocalDateTime.now();
LocalDateTime time = now.get();

// Function – transforms input to output
Function<String, Integer> length = s -> s.length();
System.out.println(length.apply("hello"));  // 5

// Predicate – returns boolean
Predicate<Integer> isPositive = n -> n > 0;
System.out.println(isPositive.test(5));  // true

// BiFunction – two inputs
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
System.out.println(add.apply(2, 3));  // 5
```

---

## Lambda Expressions

### Syntax

```java
// No parameters
Runnable runnable = () -> System.out.println("Running");

// One parameter (parentheses optional)
Predicate<Integer> isEven = n -> n % 2 == 0;
Function<String, Integer> length = s -> s.length();

// Multiple parameters
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;

// Block body
Consumer<String> process = message -> {
    System.out.println("Processing: " + message);
    // Multiple statements
};
```

### Method References

```java
// Static method reference
Function<String, Integer> parseInt = Integer::parseInt;
System.out.println(parseInt.apply("123"));

// Instance method reference
List<String> names = List.of("alice", "bob");
names.forEach(System.out::println);

// Constructor reference
Supplier<ArrayList> listSupplier = ArrayList::new;
ArrayList<String> list = listSupplier.get();

// Instance method on parameter
Function<String, Integer> length = String::length;
System.out.println(length.apply("hello"));  // 5
```

---

## Stream API

### Creating Streams

```java
// From collection
List<String> names = List.of("alice", "bob", "charlie");
Stream<String> stream = names.stream();

// From values
Stream<Integer> numbers = Stream.of(1, 2, 3, 4, 5);

// From array
int[] array = {1, 2, 3, 4, 5};
IntStream intStream = Arrays.stream(array);

// Generate stream
Stream<String> generated = Stream.generate(() -> "value").limit(5);

// Iterate stream
Stream<Integer> sequence = Stream.iterate(0, n -> n + 1).limit(10);
```

### Terminal Operations (Produce Results)

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5);

// forEach – side effects
numbers.stream().forEach(System.out::println);

// collect – gather results
List<Integer> evens = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());

// reduce – combine values
int sum = numbers.stream().reduce(0, Integer::sum);

// count – count elements
long count = numbers.stream().count();

// findFirst – first matching
Optional<Integer> first = numbers.stream()
    .filter(n -> n > 2)
    .findFirst();

// anyMatch, allMatch, noneMatch
boolean hasEven = numbers.stream().anyMatch(n -> n % 2 == 0);
boolean allPositive = numbers.stream().allMatch(n -> n > 0);
boolean noNegative = numbers.stream().noneMatch(n -> n < 0);

// min, max
Optional<Integer> max = numbers.stream().max(Integer::compareTo);
```

### Intermediate Operations (Transform Stream)

```java
List<String> names = List.of("alice", "bob", "charlie", "david");

// filter – keep elements matching predicate
names.stream()
    .filter(n -> n.length() > 3)
    .forEach(System.out::println);  // bob, charlie, david

// map – transform each element
List<Integer> lengths = names.stream()
    .map(String::length)
    .collect(Collectors.toList());  // [5, 3, 7, 5]

// flatMap – map and flatten
List<List<Integer>> lists = List.of(
    List.of(1, 2),
    List.of(3, 4),
    List.of(5)
);
List<Integer> flattened = lists.stream()
    .flatMap(List::stream)
    .collect(Collectors.toList());  // [1, 2, 3, 4, 5]

// distinct – remove duplicates
List<Integer> unique = List.of(1, 2, 2, 3, 3, 3).stream()
    .distinct()
    .collect(Collectors.toList());  // [1, 2, 3]

// sorted – order elements
names.stream()
    .sorted()
    .forEach(System.out::println);

// limit – keep first n
List<String> first3 = names.stream()
    .limit(3)
    .collect(Collectors.toList());

// skip – skip first n
List<String> skip2 = names.stream()
    .skip(2)
    .collect(Collectors.toList());
```

### Common Collectors

```java
List<String> names = List.of("alice", "bob", "charlie");

// toList – collect to List
List<String> list = names.stream().collect(Collectors.toList());

// toSet – collect to Set
Set<String> set = names.stream().collect(Collectors.toSet());

// toMap – collect to Map
Map<String, Integer> nameToLength = names.stream()
    .collect(Collectors.toMap(
        Function.identity(),  // key: the name itself
        String::length        // value: the length
    ));

// groupingBy – group by criterion
Map<Integer, List<String>> byLength = names.stream()
    .collect(Collectors.groupingBy(String::length));
// {3: [bob], 5: [alice], 7: [charlie]}

// partitioningBy – split into true/false groups
Map<Boolean, List<String>> evenLength = names.stream()
    .collect(Collectors.partitioningBy(n -> n.length() % 2 == 0));

// joining – concatenate strings
String joined = names.stream().collect(Collectors.joining(", "));
// "alice, bob, charlie"

// mapping – transform while collecting
List<Integer> lengths = names.stream()
    .collect(Collectors.mapping(String::length, Collectors.toList()));
```

---

## Practical Examples

### Filtering and Transforming

```java
public record Order(String id, double total, OrderStatus status) {}

List<Order> orders = List.of(
    new Order("1", 100, OrderStatus.COMPLETED),
    new Order("2", 250, OrderStatus.PENDING),
    new Order("3", 75, OrderStatus.COMPLETED)
);

// Get completed orders with total > 50
List<Order> completed = orders.stream()
    .filter(o -> o.status() == OrderStatus.COMPLETED)
    .filter(o -> o.total() > 50)
    .collect(Collectors.toList());

// Get total of pending orders
double pendingTotal = orders.stream()
    .filter(o -> o.status() == OrderStatus.PENDING)
    .mapToDouble(Order::total)
    .sum();

// Group orders by status
Map<OrderStatus, List<Order>> byStatus = orders.stream()
    .collect(Collectors.groupingBy(Order::status));
```

### Chaining Operations

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// Complex transformation
int result = numbers.stream()
    .filter(n -> n % 2 == 0)         // Keep even: 2, 4, 6, 8, 10
    .map(n -> n * n)                 // Square: 4, 16, 36, 64, 100
    .filter(n -> n > 20)              // Keep > 20: 36, 64, 100
    .reduce(0, Integer::sum);         // Sum: 200
```

---

## Common Mistakes

### Mistake 1: Modifying Original Collection in Stream

```java
// WRONG
List<String> names = new ArrayList<>(List.of("alice", "bob"));
names.stream()
    .filter(n -> n.length() > 3)
    .forEach(names::remove);  // Modifying while iterating!

// CORRECT
List<String> result = names.stream()
    .filter(n -> n.length() > 3)
    .collect(Collectors.toList());
```

### Mistake 2: Side Effects in map()

```java
// WRONG – side effects in intermediate operations
List<Integer> doubled = numbers.stream()
    .map(n -> {
        System.out.println(n);  // Side effect!
        return n * 2;
    })
    .collect(Collectors.toList());

// CORRECT – side effects in forEach
numbers.forEach(System.out::println);
List<Integer> doubled = numbers.stream()
    .map(n -> n * 2)
    .collect(Collectors.toList());
```

### Mistake 3: Using Parallel Streams Without Care

```java
// WRONG – parallel without understanding
List<Integer> nums = List.of(1, 2, 3, 4, 5);
int sum = nums.parallelStream()  // Overkill for small list
    .reduce(0, Integer::sum);

// CORRECT – parallel for large collections only
List<Integer> largeList = new ArrayList<>();
int sum = largeList.parallelStream()
    .reduce(0, Integer::sum);
```

---

## Performance Notes

### Lazy Evaluation

Streams don't execute until a terminal operation:

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5);

Stream<Integer> stream = numbers.stream()
    .filter(n -> {
        System.out.println("Filtering " + n);
        return n % 2 == 0;
    })
    .map(n -> {
        System.out.println("Mapping " + n);
        return n * 2;
    });

// Nothing printed yet – stream not executed

System.out.println("Starting terminal operation");
List<Integer> result = stream.collect(Collectors.toList());
```

### Stream Reuse

Streams are one-time use:

```java
Stream<Integer> stream = List.of(1, 2, 3).stream();
stream.forEach(System.out::println);
stream.count();  // IllegalStateException – stream already consumed
```

---

## Summary

- **Functional interfaces**: Single abstract method, can be implemented with lambdas
- **Lambdas**: Concise syntax for implementing functional interfaces
- **Method references**: Even more concise alternative to lambdas
- **Streams**: Declarative, composable transformations on collections
- **Terminal operations**: Produce results (collect, forEach, reduce, etc.)
- **Intermediate operations**: Transform stream (map, filter, distinct, etc.)
- **Collectors**: Gather stream results (toList, groupingBy, joining, etc.)
- **Lazy evaluation**: Stream operations don't execute until terminal operation
- **One-time use**: Streams can't be reused after terminal operation

---

## Further Reading

- [Baeldung – Streams](https://www.baeldung.com/java-8-streams)
- [Baeldung – Collectors](https://www.baeldung.com/java-collectors)
- [Baeldung – Functional Interfaces](https://www.baeldung.com/java-8-functional-interfaces)
- [Oracle Stream API Tutorial](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Stream.html)

---

<div class="chapter-nav">
<a href="/docs/05-collections-generics" class="btn btn-secondary">← Previous: Collections & Generics</a>
<div class="chapter-nav-spacer"></div>
<a href="/docs/07-strings" class="btn">Next: Strings →</a>
</div>
