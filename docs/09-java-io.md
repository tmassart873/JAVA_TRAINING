---
layout: default
title: Java IO
subtitle: Reading, writing, streams, and file operations
type: docs
quiz:
  - question: "Which modern package provides NIO2 file operations?"
    options: ["java.io", "java.nio.file", "java.util.file", "java.stream.io"]
    answer: 1
  - question: "Which class is commonly used to read input from the console?"
    options: ["Scanner", "FileWriter", "ObjectOutputStream", "BufferedImage"]
    answer: 0
  - question: "What's the key difference between byte streams and character streams?"
    options: ["Byte streams are always faster", "Character streams handle text encoding, byte streams handle raw bytes", "There is no difference", "Character streams cannot read files"]
    answer: 1
  - question: "What does the transient keyword do to a field?"
    options: ["Makes it thread-safe", "Excludes it from the default serialization process — it won't be written out or restored", "Makes it final", "Improves its performance"]
    answer: 1
  - question: "Why should classes implementing Serializable declare an explicit serialVersionUID?"
    options: ["It's purely cosmetic", "Without it, any change to the class can silently change the auto-computed UID, causing InvalidClassException when deserializing older data", "It's required by the compiler", "It encrypts the serialized data"]
    answer: 1
  - question: "Why is deserializing data from an untrusted source considered a security risk?"
    options: ["It isn't — deserialization is always safe", "readObject() can be exploited to instantiate arbitrary classes and trigger unintended code execution before any validation runs", "It only risks slow performance", "It can only corrupt the file, never the JVM"]
    answer: 1
---

## Reading User Input

### Console Input

```java
// Using Scanner (recommended)
Scanner scanner = new Scanner(System.in);

System.out.print("Enter your name: ");
String name = scanner.nextLine();

System.out.print("Enter your age: ");
int age = scanner.nextInt();

scanner.close();
```

### Scanner Parsing

```java
Scanner scanner = new Scanner(System.in);

String line = scanner.nextLine();     // Read full line
String token = scanner.next();         // Read next token (whitespace delimited)
int number = scanner.nextInt();        // Read integer
double decimal = scanner.nextDouble(); // Read double
boolean flag = scanner.nextBoolean();  // Read boolean
```

### Console: Reading Passwords Without Echo

`Scanner` echoes everything typed to the terminal — fine for names, wrong for passwords. `System.console()` provides `readPassword()`, which reads input without echoing it back:

```java
Console console = System.console();  // null when not run from an actual terminal (e.g. inside some IDEs)

if (console != null) {
    char[] password = console.readPassword("Enter password: ");  // Not echoed to the screen
    // Use the char[] directly; avoid converting to String if possible —
    // a String is immutable and may linger in memory until GC, whereas
    // you can explicitly overwrite a char[] with Arrays.fill(password, ' ') once done.
} else {
    System.out.println("No console available (e.g. running inside an IDE)");
}
```

---

## Reading Files

### Reading Entire File

```java
import java.nio.file.Files;
import java.nio.file.Paths;

// Read as String (simple)
String content = Files.readString(Paths.get("file.txt"));

// Read as List of lines
List<String> lines = Files.readAllLines(Paths.get("file.txt"));

for (String line : lines) {
    System.out.println(line);
}
```

### Reading File Line by Line

```java
// Try-with-resources (recommended)
try (BufferedReader reader = new BufferedReader(
        new FileReader("file.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
```

### Reading as Stream

```java
// Java 8+ streams
Files.lines(Paths.get("file.txt"))
    .filter(line -> line.length() > 0)  // Non-empty lines
    .map(String::toUpperCase)           // Convert to uppercase
    .forEach(System.out::println);
```

`BufferedReader` has an equivalent `lines()` method, useful when you already have a `Reader` open (e.g. wrapping `System.in`) rather than a `Path`:

```java
try (BufferedReader reader = new BufferedReader(new FileReader("file.txt"))) {
    long nonEmptyCount = reader.lines()
        .filter(line -> !line.isBlank())
        .count();
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
```

<div class="callout warning" markdown="1">
<div class="callout-title"><span>⚠️</span>Files.lines() Must Be Closed — It's Backed by a File Handle</div>

Unlike most streams, `Files.lines()` opens a file handle that stays open for the life of the stream — always use it inside try-with-resources (`try (Stream<String> lines = Files.lines(path))`), not as a bare expression, or you'll leak file handles.
</div>

---

## Writing Files

### Write String to File

```java
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;

// Write entire content
String content = "Hello, World!";
Files.writeString(Paths.get("output.txt"), content);

// Append mode (Java 11+)
Files.writeString(
    Paths.get("output.txt"),
    "New line\n",
    StandardOpenOption.APPEND
);
```

### Write Lines to File

```java
List<String> lines = List.of("Line 1", "Line 2", "Line 3");
Files.write(Paths.get("output.txt"), lines);
```

### Write with Writer

```java
try (FileWriter writer = new FileWriter("output.txt")) {
    writer.write("Hello, World!\n");
    writer.write("Second line\n");
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}

// Or with BufferedWriter (more efficient)
try (BufferedWriter writer = new BufferedWriter(
        new FileWriter("output.txt"))) {
    writer.write("Line 1\n");
    writer.write("Line 2\n");
    writer.flush();
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
```

### PrintWriter: Formatted Output to Any Destination

`PrintWriter` wraps another `Writer`/`OutputStream` and adds convenient `print`/`println`/`printf` methods — the same formatted-output API `System.out` provides, but usable with any destination (a file, a `StringWriter`, a network socket):

```java
try (PrintWriter writer = new PrintWriter(new FileWriter("report.txt"))) {
    writer.println("Report generated");
    writer.printf("Total: $%.2f%n", 1234.5);
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
```

---

## File Operations

### Check if File Exists

```java
Path path = Paths.get("file.txt");

if (Files.exists(path)) {
    System.out.println("File exists");
}

if (Files.notExists(path)) {
    System.out.println("File doesn't exist");
}
```

### Create Files

```java
Path path = Paths.get("newfile.txt");

// Create if doesn't exist
Files.createFile(path);

// Create with parent directories
Files.createDirectories(Paths.get("data/subfolder/file.txt"));
```

### Delete Files

```java
Path path = Paths.get("file.txt");

Files.delete(path);  // Throws if doesn't exist

Files.deleteIfExists(path);  // Doesn't throw if doesn't exist
```

### Copy and Move Files

```java
Path source = Paths.get("original.txt");
Path target = Paths.get("copy.txt");

Files.copy(source, target);                                    // Throws if target already exists
Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING); // Overwrites if it exists

Files.move(source, target, StandardCopyOption.REPLACE_EXISTING); // Rename/move; original is gone afterward
```

### File Properties

```java
Path path = Paths.get("file.txt");

System.out.println(Files.size(path));  // File size in bytes
System.out.println(Files.isRegularFile(path));  // Is regular file
System.out.println(Files.isDirectory(path));    // Is directory
System.out.println(Files.isReadable(path));     // Is readable
System.out.println(Files.isWritable(path));     // Is writable
```

### List Directory

```java
// List files in directory
try (Stream<Path> stream = Files.list(Paths.get("."))) {
    stream.forEach(System.out::println);
}

// Walk directory tree
Files.walk(Paths.get("."), 2)  // Max depth 2
    .filter(Files::isRegularFile)
    .forEach(System.out::println);
```

---

## Streams (IO)

### Reading Binary Data

```java
// Read bytes
try (InputStream input = new FileInputStream("image.png")) {
    byte[] buffer = new byte[1024];
    int bytesRead;
    while ((bytesRead = input.read(buffer)) != -1) {
        // Process bytesRead bytes from buffer
    }
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}

// Or use Files API
byte[] bytes = Files.readAllBytes(Paths.get("image.png"));
```

### Writing Binary Data

```java
try (OutputStream output = new FileOutputStream("output.dat")) {
    byte[] data = {1, 2, 3, 4, 5};
    output.write(data);
    output.flush();
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}

// Or use Files API
byte[] data = {1, 2, 3, 4, 5};
Files.write(Paths.get("output.dat"), data);
```

---

## NIO2 (Modern File Operations)

### Path and Files

```java
// Path (replaces File)
Path path = Paths.get("data/file.txt");
Path absolute = path.toAbsolutePath();
Path parent = path.getParent();

// Files (utility class)
if (Files.exists(path)) {
    System.out.println("Exists");
}

List<String> lines = Files.readAllLines(path);

// Modern approach (Java 11+)
String content = Files.readString(path);
Files.writeString(path, "New content");
```

---

## Serialization

### Serializable Interface

```java
public class Customer implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private String id;
    private String name;
    
    // Constructors, getters, setters...
}
```

### Why Declare serialVersionUID Explicitly

If you don't declare it, the JVM computes one automatically from the class's structure (fields, methods, etc.) at compile time. That auto-computed value is fragile: a seemingly harmless change — adding a method, reordering fields — can change it, and deserializing older data with a mismatched UID throws `InvalidClassException` ("local class incompatible"). Declaring it explicitly gives you control over exactly when compatibility should break versus be preserved.

### transient: Excluding Fields From Serialization

Fields marked `transient` are skipped entirely during serialization — not written out, and restored to their default value (`null`, `0`, `false`, etc.) on deserialization. Use it for fields that are derived, unserializable (like a `Thread` or a database connection), or sensitive:

```java
public class Session implements Serializable {
    private static final long serialVersionUID = 1L;

    private String sessionId;
    private transient String temporaryToken;  // Not persisted — regenerated or reset after deserialization
    private transient Connection dbConnection; // Connection objects can't be serialized at all

    // After deserialization, temporaryToken and dbConnection are both null,
    // regardless of what they held before serialization.
}
```

### Externalizable: Full Manual Control

`Externalizable` extends `Serializable` but hands you complete control over the byte format via two methods you implement yourself — `writeExternal(ObjectOutput)` and `readExternal(ObjectInput)` — instead of relying on the default reflection-based mechanism. It's rarely needed for everyday code, but useful when you need a custom, versionable, or more compact wire format:

```java
public class CompactPoint implements Externalizable {
    private int x, y;

    public CompactPoint() {}  // Externalizable REQUIRES a public no-arg constructor

    @Override
    public void writeExternal(ObjectOutput out) throws IOException {
        out.writeInt(x);
        out.writeInt(y);
    }

    @Override
    public void readExternal(ObjectInput in) throws IOException {
        x = in.readInt();
        y = in.readInt();
    }
}
```

### Writing Serialized Objects

```java
try (ObjectOutputStream oos = 
        new ObjectOutputStream(new FileOutputStream("customer.dat"))) {
    Customer customer = new Customer("123", "Alice");
    oos.writeObject(customer);
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
```

### Reading Serialized Objects

```java
try (ObjectInputStream ois = 
        new ObjectInputStream(new FileInputStream("customer.dat"))) {
    Customer customer = (Customer) ois.readObject();
    System.out.println(customer.getName());
} catch (IOException | ClassNotFoundException e) {
    System.out.println("Error: " + e.getMessage());
}
```

<div class="callout warning" markdown="1">
<div class="callout-title"><span>⚠️</span>Never Deserialize Untrusted Data</div>

`ObjectInputStream.readObject()` reconstructs objects by instantiating classes found on the classpath based purely on data in the stream — before any application-level validation gets a chance to run. A crafted malicious stream can trigger unintended constructors, `readObject()` overrides, or `finalize()` methods on classes already present in your dependencies, potentially leading to remote code execution ("Java deserialization gadget chains" is the well-known name for this class of vulnerability). Never call `readObject()` on data from an untrusted source (uploaded files, network input, unauthenticated clients) — prefer safer serialization formats (JSON, Protocol Buffers) for anything crossing a trust boundary, and if you must use Java serialization, validate the class allowlist with `ObjectInputFilter` (Java 9+).
</div>

---

## Formatting Output

### printf

```java
System.out.printf("Name: %s, Age: %d%n", "Alice", 30);
System.out.printf("Price: $%.2f%n", 19.999);  // $20.00
System.out.printf("Hex: %x%n", 255);          // ff

// Format specifiers
%s  – String
%d  – Integer
%f  – Float/Double
%x  – Hexadecimal
%b  – Boolean
%n  – Newline
```

### Format Specifier Details: Width, Precision, and Flags

Format specifiers support more than just the conversion character — width, precision, and flags give fine control over alignment and padding:

```java
System.out.printf("[%10s]%n", "hi");     // [        hi] — width 10, right-aligned (default)
System.out.printf("[%-10s]%n", "hi");    // [hi        ] — '-' flag: left-align
System.out.printf("[%05d]%n", 42);       // [00042]     — '0' flag: zero-pad numbers
System.out.printf("[%+d]%n", 42);        // [+42]       — '+' flag: always show sign
System.out.printf("[%,d]%n", 1234567);   // [1,234,567] — ',' flag: group digits with locale separator
System.out.printf("[%8.2f]%n", 3.14159); // [    3.14]  — width 8, precision 2 (2 digits after decimal)
System.out.printf("[%.3s]%n", "hello");  // [hel]       — precision on %s truncates the string
```

### System.err and PrintStream

`System.out` and `System.err` are both `PrintStream` instances — `System.err` is unbuffered and conventionally used for error/diagnostic output so it isn't silently delayed or reordered relative to `System.out` when both are redirected differently (e.g. `program 1>out.log 2>err.log`):

```java
System.out.println("Normal output");
System.err.println("Error output — goes to stderr, not stdout");
```

### Locale-Sensitive Formatting

Number and currency formatting can vary by locale (decimal separator, digit grouping) — pass an explicit `Locale` when the format must be consistent regardless of the running machine's default:

```java
System.out.printf(Locale.US, "%,.2f%n", 1234.5);     // 1,234.50
System.out.printf(Locale.GERMANY, "%,.2f%n", 1234.5); // 1.234,50 — different separators entirely

// String.format() accepts a Locale the same way
String formatted = String.format(Locale.US, "%,d", 1_000_000);
```

### String.format()

```java
String formatted = String.format("Hello, %s!", "World");
String price = String.format("$%.2f", 19.999);
```

---

## Common Mistakes

### Mistake 1: Not Closing Resources

```java
// WRONG
FileReader reader = new FileReader("file.txt");
String content = reader.readLine();
// reader never closed!

// CORRECT – use try-with-resources
try (FileReader reader = new FileReader("file.txt")) {
    String content = reader.readLine();
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
```

### Mistake 2: Mixing Old IO and NIO

```java
// Old style (still works but outdated)
FileReader reader = new FileReader("file.txt");

// Modern style (preferred)
String content = Files.readString(Paths.get("file.txt"));
```

### Mistake 3: Assuming File Exists

```java
// WRONG – throws exception if file doesn't exist
List<String> lines = Files.readAllLines(Paths.get("file.txt"));

// CORRECT – check first
Path path = Paths.get("file.txt");
if (Files.exists(path)) {
    List<String> lines = Files.readAllLines(path);
}
```

---

## Summary

- **Scanner**: User input from console
- **Files.readString()/writeString()**: Simple file I/O (Java 11+)
- **BufferedReader/Writer**: Efficient line-based I/O
- **Streams**: Binary data (InputStream/OutputStream)
- **NIO2**: Modern file operations with Path and Files
- **Try-with-resources**: Automatic resource cleanup
- **Serialization**: Convert objects to bytes; transient excludes fields; declare serialVersionUID explicitly; never deserialize untrusted data
- **printf/format()**: Formatted output, with width/precision/flags and Locale-sensitive variants

---

## Further Reading

- [Baeldung – Java IO](https://www.baeldung.com/java-nio-2-file-api){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Reading Files](https://www.baeldung.com/reading-file-in-java){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Writing Files](https://www.baeldung.com/java-write-to-file){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Introduction to Java Serialization](https://www.baeldung.com/java-serialization){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – The transient Keyword](https://www.baeldung.com/java-transient-keyword){:target="_blank" rel="noopener noreferrer"}
- [Oracle NIO2 Tutorial](https://docs.oracle.com/javase/tutorial/nio/file/index.html){:target="_blank" rel="noopener noreferrer"}

---

<div class="chapter-nav">
<a href="{{ '/docs/08-exceptions' | relative_url }}" class="btn btn-secondary">← Previous: Exceptions</a>
<div class="chapter-nav-spacer"></div>
<a href="{{ '/docs/10-jvm-fundamentals' | relative_url }}" class="btn">Next: JVM Fundamentals →</a>
</div>
