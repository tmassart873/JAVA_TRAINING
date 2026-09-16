---
layout: default
title: Functional Java & Streams
subtitle: Lambda expressions, functional interfaces, and Stream API
type: docs
quiz:
  - question: "How many abstract methods does a functional interface have?"
    options: ["Zero", "Exactly one", "Two or more", "As many as needed"]
    answer: 1
  - question: "When do intermediate stream operations like map() and filter() actually run?"
    options: ["Immediately when called", "Only when a terminal operation is invoked", "At compile time", "Never, they are just declarations"]
    answer: 1
  - question: "What happens if you try to reuse a stream after a terminal operation has consumed it?"
    options: ["It resets automatically", "It throws an IllegalStateException", "It silently returns an empty stream", "It runs twice as fast"]
    answer: 1
  - question: "What does predicate1.negate() return?"
    options: ["A new Predicate that is true whenever the original is false, and vice versa", "A compile error — Predicate has no negate() method", "The boolean opposite of a single test() call", "A predicate that always returns false"]
    answer: 0
  - question: "Why prefer IntStream.range(0, list.size()).sum() style primitive streams over Stream<Integer> for numeric work?"
    options: ["They avoid boxing/unboxing overhead by working with primitive int values directly", "There is no difference at all", "Stream<Integer> cannot be summed", "Primitive streams support more collectors"]
    answer: 0
  - question: "What's the key functional difference between a lambda used as a callback and a named method reference used the same way?"
    options: ["Method references can't be stored in variables", "None — they're both just implementations of the same functional interface handed to another piece of code to invoke later", "Lambdas run synchronously, method references always run asynchronously", "Callbacks only work with Runnable"]
    answer: 1
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

### The Full Catalog

The four interfaces above cover most everyday cases, but `java.util.function` has variants for every arity and shape you'll actually need — reaching for the right one (instead of always writing your own) makes signatures self-documenting to anyone who knows the package:

```java
// UnaryOperator<T> – a Function<T, T> where input and output are the same type
UnaryOperator<String> shout = s -> s.toUpperCase();
System.out.println(shout.apply("hi"));  // "HI"

// BinaryOperator<T> – a BiFunction<T, T, T> where all three types match
BinaryOperator<Integer> multiply = (a, b) -> a * b;
System.out.println(multiply.apply(3, 4));  // 12

// BiConsumer<T, U> – takes two inputs, returns nothing
BiConsumer<String, Integer> logPair = (name, count) ->
    System.out.println(name + ": " + count);
logPair.accept("apples", 5);

// BiPredicate<T, U> – two inputs, returns boolean
BiPredicate<String, Integer> isLongerThan = (s, n) -> s.length() > n;
System.out.println(isLongerThan.test("hello", 3));  // true

// Runnable – no input, no output (not in java.util.function, but fully functional)
Runnable task = () -> System.out.println("Task executed");

// Callable<V> – no input, returns a value, can throw a checked exception (java.util.concurrent)
Callable<Integer> computation = () -> 42;
```

<div class="callout concept">
<div class="callout-title"><span>💡</span>Runnable vs. Supplier vs. Callable</div>

These three look similar but solve different problems: `Runnable.run()` takes nothing and returns nothing (fire-and-forget, and the classic type for passing work to a `Thread`); `Supplier<T>.get()` takes nothing but returns a value; `Callable<V>.call()` also returns a value but — unlike both of the others — is allowed to throw a checked exception, which is exactly why `ExecutorService` submission methods are built around it instead of `Supplier`.
</div>

### Composing Functional Interfaces

Several built-in interfaces provide default methods for combining instances without writing a new lambda from scratch:

```java
// Function: andThen (run after) and compose (run before)
Function<Integer, Integer> timesTwo = n -> n * 2;
Function<Integer, Integer> plusThree = n -> n + 3;

Function<Integer, Integer> combined = timesTwo.andThen(plusThree);
System.out.println(combined.apply(5));  // (5*2)=10, then (10+3)=13

Function<Integer, Integer> reversed = timesTwo.compose(plusThree);
System.out.println(reversed.apply(5));  // (5+3)=8, then (8*2)=16

// Predicate: and, or, negate
Predicate<Integer> isPositive = n -> n > 0;
Predicate<Integer> isEven = n -> n % 2 == 0;

Predicate<Integer> positiveAndEven = isPositive.and(isEven);
Predicate<Integer> positiveOrEven = isPositive.or(isEven);
Predicate<Integer> isNegative = isPositive.negate();

System.out.println(positiveAndEven.test(4));   // true
System.out.println(isNegative.test(-3));       // true

// Consumer: andThen (run both in sequence, on the same input)
Consumer<String> print = System.out::println;
Consumer<String> log = s -> System.out.println("LOG: " + s);
Consumer<String> both = print.andThen(log);
both.accept("event");  // prints "event", then "LOG: event"
```

<div class="callout warning">
<div class="callout-title"><span>⚠️</span>andThen() Order Differs Between Function and Consumer</div>

For `Function`, `f.andThen(g)` means "apply `f`, feed its **result** into `g`." For `Consumer`, `c1.andThen(c2)` means "run `c1`, then run `c2`, both on the **same original input**" — there's no result to pass along since `Consumer` returns nothing. Don't assume the two behave identically just because the method name matches.
</div>

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

## Callback Functions

A "callback" isn't a separate Java language feature — it's a design pattern that functional interfaces make convenient: you pass a piece of behavior into a method, and that method invokes it later, often after some asynchronous or conditional work completes.

```java
public class FileDownloader {
    public void download(String url, Consumer<String> onSuccess, Consumer<Throwable> onFailure) {
        try {
            String content = fetchContent(url);   // Imagine real I/O here
            onSuccess.accept(content);              // Invoke the "success" callback
        } catch (Exception e) {
            onFailure.accept(e);                    // Invoke the "failure" callback
        }
    }

    private String fetchContent(String url) { return "data from " + url; }
}

FileDownloader downloader = new FileDownloader();
downloader.download(
    "https://example.com/data",
    result -> System.out.println("Got: " + result),      // onSuccess callback
    error -> System.err.println("Failed: " + error.getMessage())  // onFailure callback
);
```

Before Java 8, this pattern required an anonymous inner class implementing a single-method interface (the classic `new Runnable() { public void run() { ... } }` idiom) — lambdas are simply a much more concise way to supply the same "behavior as data" that callbacks have always relied on.

<div class="callout concept">
<div class="callout-title"><span>💡</span>Functional Programming Principles, Briefly</div>

Java isn't a purely functional language, but lambdas and streams borrow several ideas worth naming:

- **First-class and higher-order functions** — functions (or here, objects implementing functional interfaces) can be passed as arguments and returned from other methods, just like any other value. `Function::andThen` returning a new `Function` is a higher-order function in action.
- **Pure functions** — a function whose output depends only on its input, with no observable side effects (no mutating shared state, no I/O). `n -> n * 2` is pure; `n -> { counter++; return n * 2; }` is not.
- **Referential transparency** — a pure function call can be replaced by its result without changing program behavior. This is exactly why side effects inside `map()`/`filter()` are discouraged (see Common Mistakes below): stream pipelines are designed assuming the lambdas you pass in behave like pure functions.

You don't need to write "functional-style" Java everywhere, but understanding these ideas explains *why* the Streams API is designed the way it is.
</div>

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

### Primitive Streams: IntStream, LongStream, DoubleStream

`Stream<Integer>` boxes every element, which wastes memory and CPU for pure numeric work. The primitive stream specializations avoid that entirely by working with `int`/`long`/`double` directly:

```java
IntStream.range(0, 5).forEach(System.out::println);       // 0,1,2,3,4 (end exclusive)
IntStream.rangeClosed(1, 5).forEach(System.out::println); // 1,2,3,4,5 (end inclusive)

int total = IntStream.rangeClosed(1, 100).sum();           // Built-in sum() — no reduce() needed
OptionalDouble avg = IntStream.of(1, 2, 3, 4).average();
IntSummaryStatistics stats = IntStream.rangeClosed(1, 10).summaryStatistics();
System.out.println(stats.getMax() + " " + stats.getMin() + " " + stats.getAverage());

// Converting between a regular Stream and a primitive stream
List<String> words = List.of("a", "bb", "ccc");
int totalLength = words.stream().mapToInt(String::length).sum();  // Stream<String> -> IntStream

IntStream ints = IntStream.of(1, 2, 3);
List<Integer> boxed = ints.boxed().toList();  // IntStream -> Stream<Integer>, when you need boxed objects (e.g. for a List)
```

### Short-Circuiting Operations

Some operations don't need to process the entire stream to produce a result — they stop as soon as the answer is known, which matters a lot for large or infinite streams:

```java
// anyMatch/allMatch/noneMatch stop at the first element that decides the answer
boolean found = Stream.iterate(1, n -> n + 1)   // Infinite stream!
    .anyMatch(n -> n == 5);                      // Stops after checking 1,2,3,4,5 — doesn't run forever

// findFirst/findAny stop at the first match
Optional<Integer> first = Stream.iterate(1, n -> n + 1)
    .filter(n -> n % 7 == 0)
    .findFirst();                                // Stops as soon as it finds 7

// limit() truncates, letting an infinite stream terminate
List<Integer> firstFive = Stream.iterate(1, n -> n + 1)
    .limit(5)
    .toList();
```

Without at least one short-circuiting operation (`limit`, `anyMatch`, `findFirst`, etc.), calling a terminal operation on an infinite stream (`Stream.generate`/`Stream.iterate` without a bound) never completes.

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

### Downstream Collectors: Combining groupingBy() With More Than a List

`groupingBy()` accepts an optional second argument — a **downstream collector** — that controls what happens to each group's elements, instead of just dumping them into a `List`:

```java
List<String> names = List.of("alice", "bob", "charlie", "anna", "ben");

// Count how many names fall into each length group, instead of collecting them
Map<Integer, Long> countByLength = names.stream()
    .collect(Collectors.groupingBy(String::length, Collectors.counting()));

// Sum/average a numeric property per group
record Employee(String department, double salary) {}
List<Employee> employees = List.of(
    new Employee("Eng", 90_000), new Employee("Eng", 95_000), new Employee("Sales", 60_000)
);

Map<String, Double> totalSalaryByDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::department, Collectors.summingDouble(Employee::salary)));

Map<String, Double> avgSalaryByDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::department, Collectors.averagingDouble(Employee::salary)));

// Find the highest earner per department
Map<String, Optional<Employee>> topEarnerByDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::department,
        Collectors.maxBy(Comparator.comparingDouble(Employee::salary))));

// toMap with a merge function — required when keys can collide
Map<Integer, String> firstNameOfEachLength = names.stream()
    .collect(Collectors.toMap(String::length, n -> n, (existing, incoming) -> existing));
    // Without the merge function (3rd arg), a duplicate key throws IllegalStateException

// collectingAndThen – post-process the collector's result (e.g. make it unmodifiable)
List<String> immutableUpper = names.stream()
    .map(String::toUpperCase)
    .collect(Collectors.collectingAndThen(Collectors.toList(), Collections::unmodifiableList));

// teeing (Java 12+) – run TWO collectors over the same stream and combine their results
record MinMax(int min, int max) {}
MinMax range = Stream.of(5, 3, 9, 1, 7)
    .collect(Collectors.teeing(
        Collectors.minBy(Integer::compareTo),
        Collectors.maxBy(Integer::compareTo),
        (min, max) -> new MinMax(min.get(), max.get())
    ));
```

<div class="callout warning">
<div class="callout-title"><span>⚠️</span>toMap() Without a Merge Function Throws on Duplicate Keys</div>

```java
List<String> names = List.of("alice", "anna", "bob");

// Throws IllegalStateException: "alice" and "anna" both map to key 'a' (first letter)
Map<Character, String> byFirstLetter = names.stream()
    .collect(Collectors.toMap(n -> n.charAt(0), n -> n));

// Fixed — a merge function tells toMap what to do on collision
Map<Character, String> fixed = names.stream()
    .collect(Collectors.toMap(n -> n.charAt(0), n -> n, (a, b) -> a + "/" + b));
```
</div>

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

- [Baeldung – Streams](https://www.baeldung.com/java-8-streams){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Collectors](https://www.baeldung.com/java-collectors){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Functional Interfaces](https://www.baeldung.com/java-8-functional-interfaces){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Callbacks in Java](https://www.baeldung.com/java-callback-functions){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Introduction to Functional Programming in Java](https://www.baeldung.com/java-functional-programming){:target="_blank" rel="noopener noreferrer"}
- [Oracle Stream API Tutorial](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Stream.html){:target="_blank" rel="noopener noreferrer"}

---

<div class="chapter-nav">
<a href="{{ '/docs/17-arrays-iterators-and-conversions' | relative_url }}" class="btn btn-secondary">← Previous: Arrays, Iterators & Conversions</a>
<div class="chapter-nav-spacer"></div>
<a href="{{ '/docs/07-strings' | relative_url }}" class="btn">Next: Strings →</a>
</div>
