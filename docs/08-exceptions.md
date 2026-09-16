---
layout: default
title: Exceptions
subtitle: Exception hierarchy, handling, and best practices
type: docs
quiz:
  - question: "Checked exceptions must be handled how?"
    options: ["They can be silently ignored", "Declared with throws or caught with try-catch", "Only caught in the main method", "They cannot be caught at all"]
    answer: 1
  - question: "What must a class implement to be used in try-with-resources?"
    options: ["Serializable", "AutoCloseable", "Comparable", "Runnable"]
    answer: 1
  - question: "Is RuntimeException checked or unchecked?"
    options: ["Checked", "Unchecked", "Neither, it's abstract", "It depends on the JVM version"]
    answer: 1
  - question: "What's the difference between 'throw' and 'throws' in Java?"
    options: ["They are identical and interchangeable", "'throw' actually raises an exception instance at a specific point in code; 'throws' is a method-signature declaration listing checked exceptions the method might propagate", "'throws' is only for unchecked exceptions", "'throw' is used only in interfaces"]
    answer: 1
  - question: "If resources A, B, and C are declared in that order in a try-with-resources statement, in what order are they closed?"
    options: ["A, then B, then C (declaration order)", "C, then B, then A (reverse of declaration order)", "Random order", "Only the last one is closed"]
    answer: 1
  - question: "If both the try block body and a resource's close() method throw exceptions, what happens to the close() exception?"
    options: ["It replaces the original exception entirely and the original is lost", "It's added as a 'suppressed' exception on the original, retrievable via getSuppressed()", "It's silently discarded", "It causes a StackOverflowError"]
    answer: 1
---

## Exception Hierarchy

### Throwable

Everything that can be thrown inherits from `Throwable`:

```
Throwable
├── Error (serious problems, don't catch)
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── VirtualMachineError
└── Exception (recoverable problems)
    ├── Checked Exception (must handle)
    │   ├── IOException
    │   ├── SQLException
    │   └── Custom exceptions
    └── Unchecked Exception (RuntimeException)
        ├── NullPointerException
        ├── IllegalArgumentException
        ├── ArrayIndexOutOfBoundsException
        └── Custom RuntimeExceptions
```

### Key Distinction

**Checked Exceptions**
- Must be caught or declared in method signature
- Use for recoverable errors
- Examples: IOException, SQLException

**Unchecked Exceptions (RuntimeExceptions)**
- Can be thrown without declaration
- Use for programming errors
- Examples: NullPointerException, IllegalArgumentException

**Errors**
- Don't catch these
- Indicate serious JVM problems
- Examples: OutOfMemoryError, StackOverflowError

---

## throw vs. throws

These two keywords look similar but do completely different jobs, and mixing them up is a common source of confusion for anyone new to Java's exception syntax.

```java
// 'throws' — a method SIGNATURE declaration: "calling me might propagate these checked exceptions"
public void readConfig(String path) throws IOException {
    // 'throw' — actually RAISES a specific exception instance, right here, right now
    if (path == null) {
        throw new IllegalArgumentException("path cannot be null");
    }
    Files.readString(Path.of(path));  // May propagate an IOException — declared via 'throws' above
}
```

| | `throw` | `throws` |
|---|---|---|
| What it does | Raises an actual exception instance at a specific statement | Declares, in a method signature, which checked exceptions may propagate out of it |
| Where it appears | Inside a method/constructor body | After the parameter list, in the method signature |
| Cardinality | One exception instance per `throw` statement | Can list multiple exception types, comma-separated |
| Required for unchecked exceptions? | Yes — you still write `throw new ...` | No — `throws` is only mandatory for checked exceptions |

---

## Try-Catch

### Basic Structure

```java
try {
    // Code that might throw exception
    int result = 10 / 0;
} catch (ArithmeticException e) {
    // Handle specific exception
    System.out.println("Cannot divide by zero: " + e.getMessage());
} catch (Exception e) {
    // Catch-all (but avoid this in production)
    System.out.println("Unexpected error: " + e.getMessage());
} finally {
    // Always executes, whether exception or not
    System.out.println("Cleanup");
}
```

### Multiple Catch Blocks

```java
try {
    // Code that might throw different exceptions
    File file = new File("data.txt");
    FileReader reader = new FileReader(file);
} catch (FileNotFoundException e) {
    System.out.println("File not found: " + e.getMessage());
} catch (IOException e) {
    System.out.println("IO error: " + e.getMessage());
} catch (Exception e) {
    System.out.println("Unexpected error: " + e.getMessage());
}
```

### Multi-Catch (Java 7+)

```java
try {
    // Code that might throw multiple exceptions
} catch (FileNotFoundException | SQLException e) {
    // Handle multiple exception types
    System.out.println("Error: " + e.getMessage());
}
```

---

## Try-With-Resources

### The Problem

Resources must be explicitly closed:

```java
// WRONG – resource might not close if exception occurs
FileReader reader = new FileReader("file.txt");
String content = reader.readLine();
reader.close();  // Might not execute if exception above

// CORRECT – explicit try-finally
FileReader reader = null;
try {
    reader = new FileReader("file.txt");
    String content = reader.readLine();
} finally {
    if (reader != null) {
        reader.close();
    }
}
```

### Try-With-Resources Solution (Java 7+)

```java
// Automatically closes resource
try (FileReader reader = new FileReader("file.txt")) {
    String content = reader.readLine();
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
// reader is automatically closed
```

### Multiple Resources

```java
try (
    FileReader reader = new FileReader("file.txt");
    BufferedReader buffered = new BufferedReader(reader)
) {
    String line;
    while ((line = buffered.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
// Both reader and buffered are automatically closed
```

<div class="callout concept" markdown="1">
<div class="callout-title"><span>💡</span>Resources Close in Reverse Declaration Order</div>

With multiple resources declared in one `try (...)`, they are closed in the **reverse** of the order they were declared — the last-opened resource is closed first, mirroring how you'd normally want to tear things down (close the wrapper before the thing it wraps):

```java
try (
    var a = new ResourceA();  // Opened 1st
    var b = new ResourceB();  // Opened 2nd
    var c = new ResourceC()   // Opened 3rd
) {
    // use a, b, c
}
// Closed in order: c, then b, then a
```

</div>

### Suppressed Exceptions

What happens if the try block body throws **and** a resource's `close()` also throws? The original exception (from the body) is the one propagated — the `close()` exception isn't lost, it's attached as a **suppressed exception**:

```java
public class NoisyResource implements AutoCloseable {
    @Override
    public void close() {
        throw new RuntimeException("Failed during close");
    }
}

try (NoisyResource r = new NoisyResource()) {
    throw new IllegalStateException("Failed during body");
} catch (Exception e) {
    System.out.println(e.getMessage());               // "Failed during body" — the primary exception
    for (Throwable suppressed : e.getSuppressed()) {
        System.out.println("Suppressed: " + suppressed.getMessage());  // "Failed during close"
    }
}
```

Without try-with-resources, the equivalent hand-written `try/finally` would have the `close()` exception in `finally` silently **replace** the original one from the body — losing the real root cause. This is one of the concrete, easy-to-miss reasons try-with-resources is strictly better than manual `finally`-based cleanup.

### Custom AutoCloseable

```java
public class DatabaseConnection implements AutoCloseable {
    public void connect() {
        System.out.println("Connected");
    }
    
    @Override
    public void close() throws Exception {
        System.out.println("Closing connection");
    }
}

// Usage
try (DatabaseConnection conn = new DatabaseConnection()) {
    conn.connect();
} catch (Exception e) {
    System.out.println("Error: " + e.getMessage());
}
// close() called automatically
```

---

## Checked vs Unchecked

### Checked Exceptions

Must be caught or declared:

```java
public void readFile(String filename) throws IOException {
    FileReader reader = new FileReader(filename);
    // Must either catch IOException or declare throws
}

// Caller must handle
try {
    readFile("data.txt");
} catch (IOException e) {
    System.out.println("Cannot read file");
}
```

### Unchecked Exceptions

Can be thrown without declaration:

```java
public void processData(int[] data, int index) {
    // No throws declaration needed for ArrayIndexOutOfBoundsException
    int value = data[index];
}

// Caller doesn't need to catch
processData(new int[]{1, 2, 3}, 0);  // OK

// But should validate
public void processDataSafe(int[] data, int index) {
    if (index < 0 || index >= data.length) {
        throw new IllegalArgumentException("Invalid index");
    }
    int value = data[index];
}
```

### When to Use Each

**Checked Exceptions**
- External resource errors (file not found, network down)
- Expected failures that caller might recover from

**Unchecked Exceptions**
- Programming errors (null pointer, invalid argument)
- Unexpected state that shouldn't happen

---

## Custom Exceptions

### Creating Custom Checked Exception

```java
public class InsufficientFundsException extends Exception {
    private double shortfall;
    
    public InsufficientFundsException(double shortfall) {
        super("Insufficient funds. Short by $" + shortfall);
        this.shortfall = shortfall;
    }
    
    public double getShortfall() {
        return shortfall;
    }
}

// Usage
public void withdraw(BankAccount account, double amount) throws InsufficientFundsException {
    if (amount > account.getBalance()) {
        throw new InsufficientFundsException(amount - account.getBalance());
    }
    account.deduct(amount);
}

// Caller must catch
try {
    account.withdraw(account, 1000);
} catch (InsufficientFundsException e) {
    System.out.println("Cannot withdraw: " + e.getMessage());
    System.out.println("Short by: $" + e.getShortfall());
}
```

### Creating Custom Unchecked Exception

```java
public class InvalidProductException extends RuntimeException {
    private String productCode;
    
    public InvalidProductException(String productCode) {
        super("Invalid product code: " + productCode);
        this.productCode = productCode;
    }
    
    public String getProductCode() {
        return productCode;
    }
}

// Usage
public Product getProduct(String code) {
    if (code == null || code.isEmpty()) {
        throw new InvalidProductException(code);
    }
    // Find product
    return findProductByCode(code);
}
```

---

## Exception Chaining

### Preserving Stack Trace

```java
try {
    // Database operation
    executeQuery(sql);
} catch (SQLException e) {
    // WRONG – loses original exception
    throw new RuntimeException("Database error");
}

// CORRECT – chain exceptions
try {
    executeQuery(sql);
} catch (SQLException e) {
    throw new RuntimeException("Database error", e);
}

// Caller can see root cause
catch (RuntimeException e) {
    e.getCause();  // Original SQLException
}
```

When an exception is thrown with a cause, the printed stack trace shows both, connected by a `Caused by:` line — this is the JVM walking the cause chain for you:

```
Exception in thread "main" java.lang.RuntimeException: Database error
	at com.example.App.run(App.java:15)
	at com.example.App.main(App.java:8)
Caused by: java.sql.SQLException: Connection refused
	at com.example.App.executeQuery(App.java:22)
	... 1 more
```

### Walking the Full Cause Chain Manually

For deeply nested wrapping (an exception wrapping an exception wrapping an exception), you can walk the chain yourself with repeated `getCause()` calls until it returns `null`:

```java
Throwable current = topLevelException;
while (current != null) {
    System.out.println(current.getClass().getSimpleName() + ": " + current.getMessage());
    current = current.getCause();
}
// Prints every exception in the chain, from outermost wrapper down to the original root cause
```

### Using initCause()

```java
try {
    someRiskyOperation();
} catch (Exception e) {
    RuntimeException wrapped = new RuntimeException("Operation failed");
    wrapped.initCause(e);
    throw wrapped;
}
```

---

## Common Mistakes

### Mistake 1: Catching Too Broad

```java
// WRONG
try {
    // Multiple operations
} catch (Exception e) {
    System.out.println("Error");
    // Can't distinguish between different failures
}

// CORRECT
try {
    // Operation 1
} catch (FileNotFoundException e) {
    System.out.println("File not found");
} catch (IOException e) {
    System.out.println("IO error");
}
```

### Mistake 2: Swallowing Exceptions

```java
// WRONG
try {
    readFile("data.txt");
} catch (IOException e) {
    // Silently ignores error!
}

// CORRECT
try {
    readFile("data.txt");
} catch (IOException e) {
    logger.error("Failed to read file", e);
    // Either log, rethrow, or handle properly
}
```

### Mistake 3: Using Exceptions for Control Flow

```java
// WRONG
try {
    int index = 0;
    while (true) {
        System.out.println(array[index++]);
    }
} catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("Done");
}

// CORRECT
for (int i = 0; i < array.length; i++) {
    System.out.println(array[i]);
}
```

### Mistake 4: Rethrowing Without Context

```java
// WRONG
try {
    operation();
} catch (Exception e) {
    throw e;  // No added context
}

// CORRECT – add context
try {
    operation();
} catch (Exception e) {
    throw new RuntimeException("Operation failed for user: " + userId, e);
}
```

---

## Best Practices

1. **Catch specific exceptions** – not Exception
2. **Always log exceptions** – with full stack trace
3. **Preserve cause chain** – use new Exception(..., cause)
4. **Don't use exceptions for control flow** – use conditionals
5. **Close resources** – use try-with-resources
6. **Fail fast** – validate inputs, throw early
7. **Provide context** – meaningful error messages

---

## Summary

- **Checked exceptions**: Must catch or declare (IOException, SQLException)
- **Unchecked exceptions**: RuntimeException and subclasses (NullPointerException)
- **Try-with-resources**: Automatically closes resources (Java 7+)
- **Custom exceptions**: Extend Exception or RuntimeException
- **Exception chaining**: Preserve original exception with cause; walk the full chain with repeated getCause()
- **throw vs. throws**: throw raises one instance; throws declares what a method signature might propagate
- **Multi-resource try-with-resources**: closes in reverse declaration order; close()-time failures become suppressed exceptions, not silently-replacing ones
- **Avoid**: Catching Exception broadly, swallowing exceptions, using for control flow

---

## Further Reading

- [Baeldung – Exceptions](https://www.baeldung.com/java-exceptions){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Try-With-Resources](https://www.baeldung.com/java-try-with-resources){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Custom Exceptions](https://www.baeldung.com/java-new-custom-exception){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – throw vs. throws](https://www.baeldung.com/java-throw-throws){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Exception Chaining in Java](https://www.baeldung.com/java-chained-exceptions){:target="_blank" rel="noopener noreferrer"}
- [Oracle Exceptions Tutorial](https://docs.oracle.com/javase/tutorial/essential/exceptions/index.html){:target="_blank" rel="noopener noreferrer"}

---

<div class="chapter-nav">
<a href="{{ '/docs/07-strings' | relative_url }}" class="btn btn-secondary">← Previous: Strings</a>
<div class="chapter-nav-spacer"></div>
<a href="{{ '/docs/09-java-io' | relative_url }}" class="btn">Next: Java IO →</a>
</div>
