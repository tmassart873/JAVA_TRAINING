---
layout: default
title: equals() & hashCode()
subtitle: Understanding the object contract and HashMap/HashSet behavior
type: docs
---

## Why This Matters

Getting `equals()` and `hashCode()` wrong causes subtle, hard-to-debug production bugs. This section is critical for:
- Building reliable collections (HashMap, HashSet)
- Comparing objects correctly
- Preventing security vulnerabilities
- Writing robust equality logic

---

## == vs equals()

### The Difference

`==` checks **reference equality** (same object in memory).
`equals()` checks **value equality** (same logical value).

```java
String a = new String("hello");
String b = new String("hello");

System.out.println(a == b);           // false – different objects
System.out.println(a.equals(b));      // true – same content

Customer c1 = new Customer("123", "Alice");
Customer c2 = new Customer("123", "Alice");

System.out.println(c1 == c2);         // false – different objects
System.out.println(c1.equals(c2));    // false – equals() not overridden
```

### Default equals() Implementation

If you don't override `equals()`, it uses reference equality:

```java
// Default Object.equals()
public boolean equals(Object obj) {
    return this == obj;  // Reference equality
}
```

---

## The equals() Contract

When you override `equals()`, you must respect the contract:

### 1. Reflexive

```java
customer.equals(customer) == true;
```

### 2. Symmetric

```java
if (a.equals(b)) {
    b.equals(a) == true;
}
```

### 3. Transitive

```java
if (a.equals(b) && b.equals(c)) {
    a.equals(c) == true;
}
```

### 4. Consistent

```java
// Multiple calls return the same result
customer.equals(other) == customer.equals(other);
```

### 5. Null Safe

```java
customer.equals(null) == false;  // Never throw NPE
```

---

## Implementing equals()

### Poor Implementation (Violates Contract)

```java
public class Customer {
    private String id;
    private String name;
    
    // WRONG – violates contract
    @Override
    public boolean equals(Object obj) {
        if (obj == null) return false;
        Customer other = (Customer) obj;  // Can throw CCE
        return this.id.equals(other.id);  // Ignores name
    }
}
```

### Correct Implementation

```java
public class Customer {
    private String id;
    private String name;
    private String email;
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;                    // Reflexive shortcut
        if (obj == null) return false;                   // Null safe
        if (!(obj instanceof Customer)) return false;    // Type check
        
        Customer other = (Customer) obj;
        return Objects.equals(this.id, other.id) &&
               Objects.equals(this.name, other.name) &&
               Objects.equals(this.email, other.email);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id, name, email);  // See next section
    }
}
```

### Using Records (Auto-Generated)

```java
public record Customer(String id, String name, String email) {}

// equals(), hashCode(), toString() auto-generated correctly!
```

---

## The hashCode() Contract

### What is hashCode()?

A hash code is an integer that represents an object's content. It's used by HashMap and HashSet for fast lookups.

### The Contract

1. **Consistency with equals()**:
   If `a.equals(b)`, then `a.hashCode() == b.hashCode()`

2. **Not the converse**:
   If `a.hashCode() == b.hashCode()`, objects might not be equal (hash collision)

3. **Consistency during object lifetime**:
   Multiple calls on unchanged object must return the same hash code

```java
// CORRECT
public class Customer {
    private String id;
    private String name;
    private String email;
    
    @Override
    public boolean equals(Object obj) {
        // ... equality logic using id, name, email
    }
    
    @Override
    public int hashCode() {
        // Use the SAME fields as equals()
        return Objects.hash(id, name, email);
    }
}

// WRONG
public class Customer {
    private String id;
    private String name;
    
    @Override
    public boolean equals(Object obj) {
        return Objects.equals(this.id, other.id) &&
               Objects.equals(this.name, other.name);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);  // WRONG – uses fewer fields than equals()!
    }
}
```

---

## How HashMap Uses equals() and hashCode()

### The Problem: Linear Search is Slow

```java
List<Customer> customers = new ArrayList<>();
// Adding thousands of customers...

// Linear search – O(n)
Customer found = customers.stream()
    .filter(c -> c.equals(lookup))
    .findFirst()
    .orElse(null);
```

### The HashMap Solution

```java
Map<Customer, String> customerToOrder = new HashMap<>();

// Add
customerToOrder.put(key, "ORDER-123");

// Retrieve – O(1) average
String order = customerToOrder.get(key);
```

### How It Works Internally

```
HashMap internally:
1. Compute hash code: hashCode() % buckets
2. Go to that bucket (fast)
3. Compare within bucket using equals()

key.hashCode() = 42
buckets[42 % table.length] = [
    (key1, value1),
    (key2, value2),
    ...
]

If key equals key1? Use value1
If key equals key2? Use value2
...
```

### Visual Example

```
HashMap with 4 buckets:

bucket[0]: [Customer("A"), Customer("E")]
bucket[1]: [Customer("F")]
bucket[2]: []
bucket[3]: [Customer("B"), Customer("G"), Customer("K")]

To find Customer("E"):
1. hash("E") % 4 = 0
2. Go to bucket[0]
3. Compare with bucket[0]'s entries using equals()
4. Found!
```

---

## The Mutable Key Problem

### The Bug

```java
public class MutableKey {
    private int id;
    
    public MutableKey(int id) { this.id = id; }
    
    public void setId(int id) { this.id = id; }
    
    @Override
    public int hashCode() { return id; }
    
    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof MutableKey)) return false;
        return this.id == ((MutableKey) obj).id;
    }
}

// The problem:
Map<MutableKey, String> map = new HashMap<>();
MutableKey key = new MutableKey(1);
map.put(key, "value");

System.out.println(map.get(key));  // "value" – found it

key.setId(2);  // Mutate the key!

System.out.println(map.get(key));  // null – can't find it!
// Why? Hash bucket changed, but HashMap doesn't know
```

### Why This Happens

```
Step 1: Put
  key.hashCode() = 1
  Stored in bucket[1]

Step 2: Mutate key
  key.setId(2);
  key.hashCode() = 2

Step 3: Get
  key.hashCode() = 2
  Look in bucket[2]
  Not found! (It's still in bucket[1])
```

### Solution: Immutable Keys

```java
// CORRECT – immutable key
public record MutableKey(int id) {}  // Immutable!

// Or manually:
public final class ImmutableKey {
    private final int id;
    
    public ImmutableKey(int id) { this.id = id; }
    
    @Override
    public int hashCode() { return id; }
    
    @Override
    public boolean equals(Object obj) {
        return (obj instanceof ImmutableKey) &&
               this.id == ((ImmutableKey) obj).id;
    }
}
```

---

## HashSet Behavior

### How HashSet Uses equals() and hashCode()

```java
Set<Customer> customers = new HashSet<>();

Customer c1 = new Customer("123", "Alice", "alice@example.com");
customers.add(c1);

Customer c2 = new Customer("123", "Alice", "alice@example.com");
System.out.println(customers.contains(c2));  // true if equals() is correct

// Without equals() override, would be false
```

### Preventing Duplicates

```java
record Order(String id) {}

Set<Order> orders = new HashSet<>();
orders.add(new Order("123"));
orders.add(new Order("456"));
orders.add(new Order("123"));  // Duplicate – not added

System.out.println(orders.size());  // 2 – duplicate prevented
```

---

## Common Mistakes

### Mistake 1: Comparing All Fields in equals()

```java
// WRONG – compares transient fields
public class User {
    private String username;
    private String password;
    private LocalDateTime lastLogin;
    
    @Override
    public boolean equals(Object obj) {
        // Don't compare lastLogin – it changes!
        return Objects.equals(this.username, other.username) &&
               Objects.equals(this.password, other.password) &&
               Objects.equals(this.lastLogin, other.lastLogin);
    }
}

// CORRECT – compare only identity/business key fields
public class User {
    @Override
    public boolean equals(Object obj) {
        return Objects.equals(this.username, other.username);
    }
}
```

### Mistake 2: Using float/double in hashCode()

```java
// WRONG
public class Product {
    private String sku;
    private double price;
    
    @Override
    public int hashCode() {
        return Objects.hash(sku, price);  // Floating point precision!
    }
}

// price 19.99999 and 20.00 hash differently even if equal

// CORRECT
@Override
public int hashCode() {
    return Objects.hash(sku);  // Only hash stable fields
}
```

### Mistake 3: Not Implementing hashCode() When Overriding equals()

```java
// WRONG
public class Customer {
    @Override
    public boolean equals(Object obj) {
        // equals() overridden
    }
    // NO hashCode() override!
}

// HashMap breaks!
Set<Customer> set = new HashSet<>();
Customer c1 = new Customer("123", "Alice");
set.add(c1);
set.add(c1);  // Same object added twice!
System.out.println(set.size());  // 2 instead of 1
```

---

## Performance Notes

### Bad Hash Function

```java
// WRONG – poor distribution
@Override
public int hashCode() {
    return 1;  // All objects hash to same bucket!
}
```

This causes O(n) lookup time, defeating HashMap's purpose.

### Good Hash Function

```java
// CORRECT – good distribution
@Override
public int hashCode() {
    return Objects.hash(id, name, email);
}
```

---

## Interview Questions

**Q: Why must equals() and hashCode() be overridden together?**
A: Because HashMap/HashSet depend on both. If you override equals() but not hashCode(), equal objects might hash to different buckets.

**Q: Why can mutable objects be HashMap keys?**
A: They can be, but it's dangerous. Mutating a key changes its hash code, breaking HashMap's bucket-finding logic.

**Q: What happens if two objects have the same hash code?**
A: Hash collision. HashMap stores them in the same bucket and uses equals() to distinguish them.

---

## Summary

- `==` checks reference equality; `equals()` checks value equality
- Always override `equals()` AND `hashCode()` together
- equals() contract: reflexive, symmetric, transitive, consistent, null-safe
- hashCode() must use same fields as equals()
- Prefer immutable keys for HashMap/HashSet
- Use Objects.equals() and Objects.hash() to avoid null issues
- Records auto-generate correct equals/hashCode

---

## Further Reading

- [Baeldung – equals() and hashCode()](https://www.baeldung.com/java-equals-hashcode-contracts){:target="_blank" rel="noopener noreferrer"}
- [Baeldung – Comparing Objects](https://www.baeldung.com/java-comparing-objects){:target="_blank" rel="noopener noreferrer"}
- [Oracle – Object.equals()](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#equals(java.lang.Object)){:target="_blank" rel="noopener noreferrer"}

---

<div class="chapter-nav">
<a href="{{ '/docs/03-modern-java' | relative_url }}" class="btn btn-secondary">← Previous: Modern Java</a>
<div class="chapter-nav-spacer"></div>
<a href="{{ '/docs/05-collections-generics' | relative_url }}" class="btn">Next: Collections & Generics →</a>
</div>
