---
layout: default
title: Arrays, Iterators & Conversions
subtitle: The Arrays utility class, ArrayList vs LinkedList internals, and Iterator mechanics
type: docs
quiz:
  - question: "What does Arrays.asList(array) actually return?"
    options: ["A fully independent, resizable ArrayList", "A fixed-size List backed directly by the original array — add()/remove() throw UnsupportedOperationException", "A copy of the array as a List", "A Set with duplicates removed"]
    answer: 1
  - question: "Why does ArrayList have O(1) random access but LinkedList does not?"
    options: ["ArrayList is backed by a contiguous array, so any index can be computed directly; LinkedList must walk node-by-node from the start or end", "LinkedList uses more memory per element", "ArrayList is synchronized", "There is no actual difference"]
    answer: 0
  - question: "What happens if you call list.add(x) directly on a list while iterating over it with a for-each loop?"
    options: ["It works fine, always", "It usually throws ConcurrentModificationException because the Iterator detects the list was structurally modified outside itself", "It silently skips the new element", "It throws NullPointerException"]
    answer: 1
  - question: "Which is the correct way to safely remove elements from a List while iterating?"
    options: ["Use a for-each loop and call list.remove() directly", "Use the Iterator's own remove() method, or Collection.removeIf()", "Always convert to an array first", "It's impossible in Java"]
    answer: 1
---

## Why This Matters

`Arrays`, `Iterator`, and the mechanics behind `List` implementations come up constantly — every for-each loop, every `ConcurrentModificationException`, every "why is `Arrays.asList()` throwing an exception on `add()`" moment traces back to the concepts in this lesson.

---

## Table of Contents
- [The Arrays Utility Class](#the-arrays-utility-class)
- [ArrayList vs. LinkedList Internals](#arraylist-vs-linkedlist-internals)
- [Iterable and Iterator](#iterable-and-iterator)
- [Fail-Fast vs. Fail-Safe Iteration](#fail-fast-vs-fail-safe-iteration)
- [Array ↔ List Conversions](#array-list-conversions)

---

## The Arrays Utility Class

`java.util.Arrays` provides static helper methods for working with arrays — operations that arrays themselves don't have as instance methods (unlike collections):

```java
int[] numbers = {5, 3, 1, 4, 2};

Arrays.sort(numbers);                          // In-place sort: [1, 2, 3, 4, 5]
int index = Arrays.binarySearch(numbers, 3);   // Requires a sorted array — undefined result otherwise

int[] copy = Arrays.copyOf(numbers, 3);        // [1, 2, 3] — truncates or pads with 0/null
int[] range = Arrays.copyOfRange(numbers, 1, 4);  // [2, 3, 4] — end index is exclusive

boolean equal = Arrays.equals(numbers, copy);  // Content equality, NOT numbers.equals(copy) (that's reference equality!)

Arrays.fill(numbers, 0);                       // Sets every element to 0

System.out.println(Arrays.toString(numbers));  // "[0, 0, 0, 0, 0]" — readable output

List<Integer> asList = Arrays.asList(1, 2, 3); // See the important caveat below

{% raw %}int[][] grid = {{1, 2}, {3, 4}};{% endraw %}
System.out.println(Arrays.deepToString(grid)); // "[[1, 2], [3, 4]]" — toString() alone shows garbage for nested arrays
```

<div class="callout warning" markdown="1">
<div class="callout-title"><span>⚠️</span>Arrays Don't Override equals() or toString()</div>

Arrays are objects, but they don't get a meaningful `equals()`/`toString()` — they inherit `Object`'s identity-based versions:

```java
int[] a = {1, 2, 3};
int[] b = {1, 2, 3};

System.out.println(a == b);          // false — different array objects
System.out.println(a.equals(b));     // false — Object.equals(), i.e. reference equality!
System.out.println(Arrays.equals(a, b));  // true — content comparison, this is what you want

System.out.println(a);               // Something like "[I@1b6d3586" — useless
System.out.println(Arrays.toString(a));  // "[1, 2, 3]" — what you actually want
```

</div>

---

## ArrayList vs. LinkedList Internals

Both implement `List`, but their internal data structures give them opposite performance profiles:

**`ArrayList`** is backed by a **contiguous, resizable array**. Getting element `i` is a direct array index computation — O(1). Inserting/removing in the middle requires shifting every subsequent element — O(n). When the backing array fills up, `ArrayList` allocates a new, larger array (typically 1.5x) and copies everything over.

**`LinkedList`** is a **doubly-linked list** of nodes, each holding a value and pointers to the previous/next node. Getting element `i` requires walking node-by-node from whichever end is closer — O(n). But inserting/removing at a **known position** (e.g., via an `Iterator`, or at the head/tail) is O(1), since it's just pointer rewiring with no shifting.

```java
List<Integer> arrayList = new ArrayList<>();
List<Integer> linkedList = new LinkedList<>();

arrayList.get(500);      // O(1) — direct array index
linkedList.get(500);     // O(n) — must walk 500 nodes from the start

linkedList.addFirst(0);  // O(1) — just relinks the head pointer
arrayList.add(0, 0);     // O(n) — shifts every existing element right by one
```

<div class="callout concept" markdown="1">
<div class="callout-title"><span>💡</span>In Practice, Default to ArrayList</div>

`ArrayList` wins for the vast majority of real workloads: better cache locality (contiguous memory), lower per-element memory overhead (no node/pointer overhead), and most code reads far more than it inserts in the middle. Reach for `LinkedList` only when you specifically need frequent insertions/removals at known positions (or you need `Deque` operations) and have measured that it actually matters — `ArrayDeque` is usually a better choice than `LinkedList` even for queue/stack use cases.
</div>

---

## Iterable and Iterator

Every class that supports the enhanced for-loop implements `Iterable<T>`, which requires exactly one method: `iterator()`, returning an `Iterator<T>`.

```java
public interface Iterable<T> {
    Iterator<T> iterator();
}

public interface Iterator<T> {
    boolean hasNext();
    T next();
    default void remove() { throw new UnsupportedOperationException(); }
}
```

The compiler translates `for (String name : names)` directly into this pattern:

```java
// This enhanced for-loop...
for (String name : names) {
    System.out.println(name);
}

// ...compiles to essentially this:
Iterator<String> it = names.iterator();
while (it.hasNext()) {
    String name = it.next();
    System.out.println(name);
}
```

### ListIterator: Bidirectional Iteration

`List` provides a richer `ListIterator`, which can move backward as well as forward, and supports safe in-place modification:

```java
List<String> names = new ArrayList<>(List.of("Alice", "Bob", "Charlie"));
ListIterator<String> it = names.listIterator();

while (it.hasNext()) {
    String name = it.next();
    if (name.equals("Bob")) {
        it.set("Robert");   // Safe in-place replacement — a plain Iterator can't do this
    }
}

while (it.hasPrevious()) {   // Walk back the other direction
    System.out.println(it.previous());
}
```

---

## Fail-Fast vs. Fail-Safe Iteration

Most `java.util` collections (`ArrayList`, `HashMap`, `HashSet`, etc.) are **fail-fast**: their iterators track a modification counter and throw `ConcurrentModificationException` as soon as they detect the underlying collection was structurally changed outside the iterator itself, rather than risk returning corrupted or inconsistent results.

```java
List<String> names = new ArrayList<>(List.of("Alice", "Bob", "Charlie"));

for (String name : names) {
    if (name.equals("Bob")) {
        names.remove(name);   // ConcurrentModificationException on the NEXT call to next()
    }
}
```

The fix is to mutate through the iterator itself, which knows how to keep its internal bookkeeping consistent:

```java
Iterator<String> it = names.iterator();
while (it.hasNext()) {
    if (it.next().equals("Bob")) {
        it.remove();   // Safe — the Iterator updates its own state
    }
}

// Or, more concisely, when you're just removing by a condition:
names.removeIf(name -> name.equals("Bob"));
```

**Fail-safe** collections (from `java.util.concurrent`, e.g. `CopyOnWriteArrayList`, `ConcurrentHashMap`) take a different approach: they iterate over a snapshot or otherwise tolerate concurrent modification without throwing, at the cost of iterators potentially not reflecting the very latest changes. These aren't covered in depth here, but are worth knowing about if you encounter multi-threaded collection access.

---

## Array ↔ List Conversions

### Array to List

```java
Integer[] boxedArray = {1, 2, 3};
List<Integer> fixedSizeList = Arrays.asList(boxedArray);  // FIXED-SIZE, backed by the array itself!

fixedSizeList.set(0, 99);          // OK — this actually mutates boxedArray[0] too!
System.out.println(boxedArray[0]); // 99

// fixedSizeList.add(4);           // UnsupportedOperationException — can't change size

List<Integer> trulyMutable = new ArrayList<>(Arrays.asList(boxedArray));  // Wrap it to get a real, resizable list

// Java 9+, immutable
List<Integer> immutable = List.of(1, 2, 3);
```

<div class="callout warning" markdown="1">
<div class="callout-title"><span>⚠️</span>Arrays.asList() Is Backed by the Array, Not a Copy</div>

This is one of the most common "gotcha" bugs with `Arrays.asList()`: the returned `List` is a thin wrapper over the *same* array — `set()` writes through to the array, and structural changes (`add`/`remove`) are rejected outright because the array's length can never change. Always wrap it in `new ArrayList<>(...)` if you need a normal, independent, resizable list.
</div>

### List to Array

```java
List<String> names = List.of("Alice", "Bob", "Charlie");

Object[] objectArray = names.toArray();               // Loses type information — rarely what you want
String[] stringArray = names.toArray(new String[0]);  // Correct, type-safe pattern — the sizing array is just a type hint
String[] typed = names.toArray(String[]::new);        // Java 11+, equivalent and slightly cleaner
```

Passing `new String[0]` (a zero-length array) is the conventional idiom — the JVM allocates a correctly-sized array internally; it does **not** mean "give me an empty array."

### Primitive Arrays Need Special Handling

Because generics don't work with primitives, converting between `int[]` and `List<Integer>` requires boxing:

```java
int[] primitives = {1, 2, 3};

// WRONG — Arrays.asList(primitives) treats the whole int[] as ONE element!
List<int[]> wrong = Arrays.asList(primitives);  // List of size 1, containing the array itself

// CORRECT — box first, via a stream
List<Integer> boxed = Arrays.stream(primitives).boxed().toList();

// Back to a primitive array
int[] backToPrimitive = boxed.stream().mapToInt(Integer::intValue).toArray();
```

---

## Common Mistakes

### Mistake 1: Comparing Arrays With ==  or .equals()

Use `Arrays.equals()` (or `Arrays.deepEquals()` for nested arrays) — plain `==`/`.equals()` compare object identity, not content.

### Mistake 2: Mutating a List Returned by Arrays.asList()'s Size

`fixedList.add(...)` / `fixedList.remove(...)` throw `UnsupportedOperationException` — only element replacement via `set()` is allowed, and it writes through to the backing array.

### Mistake 3: Structurally Modifying a Collection During a For-Each Loop

Use `Iterator.remove()`, `removeIf()`, or collect indices/elements to remove into a separate list first, rather than mutating the collection directly inside the loop body.

---

## Summary

- `Arrays` provides static helpers (`sort`, `binarySearch`, `copyOf`, `equals`, `toString`) that arrays themselves lack as instance methods.
- `ArrayList` (contiguous array, O(1) access) and `LinkedList` (linked nodes, O(1) insertion at known positions) have opposite performance trade-offs — default to `ArrayList`.
- The enhanced for-loop is compiler sugar over `Iterable.iterator()` and repeated `hasNext()`/`next()` calls.
- Fail-fast collections throw `ConcurrentModificationException` on structural changes made outside the active iterator — mutate through the iterator (or `removeIf`) instead.
- `Arrays.asList()` returns a fixed-size list backed directly by the array — it is not a copy, and `add`/`remove` are unsupported.

---

## Further Reading

- [Baeldung – Guide to the Java Arrays Class](https://www.baeldung.com/java-util-arrays){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – ArrayList vs. LinkedList](https://www.baeldung.com/java-arraylist-linkedlist){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Guide to the Iterator](https://www.baeldung.com/java-iterator){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Convert Array to List and List to Array](https://www.baeldung.com/java-array-list-conversions){:target="_blank" rel="noopener noreferrer"}

---

<div class="chapter-nav">
<a href="{{ '/docs/05-collections-generics' | relative_url }}" class="btn btn-secondary">← Previous: Collections & Generics</a>
<div class="chapter-nav-spacer"></div>
<a href="{{ '/docs/06-functional-java' | relative_url }}" class="btn">Next: Functional Java & Streams →</a>
</div>
