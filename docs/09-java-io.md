---
layout: default
title: Java IO
subtitle: Reading, writing, streams, and file operations
type: docs
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
- **Serialization**: Convert objects to bytes
- **printf/format()**: Formatted output

---

## Further Reading

- [Baeldung – Java IO](https://www.baeldung.com/java-nio-2-file-api){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Reading Files](https://www.baeldung.com/reading-file-in-java){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Writing Files](https://www.baeldung.com/java-write-to-file){:target="_blank" rel="noopener noreferrer"}
- [Oracle NIO2 Tutorial](https://docs.oracle.com/javase/tutorial/nio/file/index.html){:target="_blank" rel="noopener noreferrer"}

---

<div class="chapter-nav">
<a href="{{ '/docs/08-exceptions' | relative_url }}" class="btn btn-secondary">← Previous: Exceptions</a>
<div class="chapter-nav-spacer"></div>
<a href="{{ '/docs/10-jvm-fundamentals' | relative_url }}" class="btn">Next: JVM Fundamentals →</a>
</div>
