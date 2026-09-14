---
layout: default
title: Practical Exercises
subtitle: Hands-on coding exercises from basic to advanced
type: docs
---

## Exercise 1: Customer Management System 🟢 Basic

### Objective
Create a `Customer` class with proper equals() and hashCode() implementation.

### Problem Statement
You need to build a simple customer management system. Create a `Customer` class that:
- Has fields: id (String), name (String), email (String)
- Implements proper equals() and hashCode() based on id only
- Can be used in HashSet to prevent duplicate customer IDs

### Starter Code

```java
public class Customer {
    private String id;
    private String name;
    private String email;
    
    public Customer(String id, String name, String email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
    
    // TODO: implement equals() and hashCode()
    
    @Override
    public String toString() {
        return "Customer{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}
```

### Expected Outcome

```java
Customer c1 = new Customer("123", "Alice", "alice@example.com");
Customer c2 = new Customer("123", "Alice", "different@example.com");
Customer c3 = new Customer("456", "Bob", "bob@example.com");

Set<Customer> customers = new HashSet<>();
customers.add(c1);
customers.add(c2);  // Duplicate ID, should not be added
customers.add(c3);

System.out.println(customers.size());  // 2
System.out.println(c1.equals(c2));     // true (same ID)
```

### Solution

```java
@Override
public boolean equals(Object obj) {
    if (this == obj) return true;
    if (!(obj instanceof Customer)) return false;
    Customer other = (Customer) obj;
    return Objects.equals(this.id, other.id);
}

@Override
public int hashCode() {
    return Objects.hash(id);
}
```

### Explanation
- Compare only by `id` since customers are identified by ID
- HashSet uses both hashCode() and equals() to prevent duplicates
- The equals/hashCode contract is maintained (same id = same hash and equal)

---

## Exercise 2: Order Processing with Streams 🟡 Intermediate

### Objective
Use Streams to process orders and calculate statistics.

### Problem Statement

```java
public record Order(String id, String customerId, double amount, OrderStatus status) {}

enum OrderStatus { PENDING, PROCESSING, COMPLETED, CANCELLED }
```

Given a list of orders, implement methods to:
1. Filter completed orders with amount > 100
2. Group orders by customer ID
3. Calculate total revenue from completed orders
4. Find customers with no completed orders

### Starter Code

```java
List<Order> orders = List.of(
    new Order("O1", "C1", 150, OrderStatus.COMPLETED),
    new Order("O2", "C1", 50, OrderStatus.PENDING),
    new Order("O3", "C2", 200, OrderStatus.COMPLETED),
    new Order("O4", "C3", 300, OrderStatus.COMPLETED),
    new Order("O5", "C3", 100, OrderStatus.CANCELLED),
    new Order("O6", "C1", 250, OrderStatus.COMPLETED)
);

// TODO: Implement the methods
```

### Solution

```java
// Filter completed orders > 100
List<Order> filtered = orders.stream()
    .filter(o -> o.status() == OrderStatus.COMPLETED && o.amount() > 100)
    .collect(Collectors.toList());

// Group by customer
Map<String, List<Order>> byCustomer = orders.stream()
    .collect(Collectors.groupingBy(Order::customerId));

// Total revenue
double totalRevenue = orders.stream()
    .filter(o -> o.status() == OrderStatus.COMPLETED)
    .mapToDouble(Order::amount)
    .sum();

// Customers with no completed orders
Set<String> allCustomers = orders.stream()
    .map(Order::customerId)
    .collect(Collectors.toSet());

Set<String> completedCustomers = orders.stream()
    .filter(o -> o.status() == OrderStatus.COMPLETED)
    .map(Order::customerId)
    .collect(Collectors.toSet());

Set<String> noCompleted = allCustomers.stream()
    .filter(c -> !completedCustomers.contains(c))
    .collect(Collectors.toSet());
```

---

## Exercise 3: Exception Handling and Resource Management 🟡 Intermediate

### Objective
Implement robust file reading with proper exception handling.

### Problem Statement
Create a method that:
1. Reads a CSV file line by line
2. Parses each line (format: "id,name,amount")
3. Creates `Product` objects
4. Returns list of products
5. Handles missing file, invalid format, and parse errors gracefully

### Solution

```java
public record Product(String id, String name, double amount) {}

public List<Product> readProductsFromCSV(String filename) {
    List<Product> products = new ArrayList<>();
    
    try (BufferedReader reader = new BufferedReader(new FileReader(filename))) {
        String line;
        int lineNumber = 0;
        
        while ((line = reader.readLine()) != null) {
            lineNumber++;
            
            try {
                if (line.trim().isEmpty()) {
                    continue;  // Skip empty lines
                }
                
                String[] parts = line.split(",");
                if (parts.length != 3) {
                    System.err.println("Line " + lineNumber + ": Invalid format. Expected 3 fields, got " + parts.length);
                    continue;
                }
                
                String id = parts[0].trim();
                String name = parts[1].trim();
                double amount = Double.parseDouble(parts[2].trim());
                
                products.add(new Product(id, name, amount));
                
            } catch (NumberFormatException e) {
                System.err.println("Line " + lineNumber + ": Invalid amount format: " + e.getMessage());
            } catch (Exception e) {
                System.err.println("Line " + lineNumber + ": Error parsing line: " + e.getMessage());
            }
        }
        
    } catch (FileNotFoundException e) {
        System.err.println("File not found: " + filename);
    } catch (IOException e) {
        System.err.println("Error reading file: " + e.getMessage());
    }
    
    return products;
}
```

---

## Exercise 4: Generic Collection Implementation 🟡 Intermediate

### Objective
Create a generic stack implementation.

### Problem Statement
Implement a generic `Stack<T>` class with:
- `push(T item)` – add to top
- `pop()` – remove and return from top
- `peek()` – return top without removing
- `isEmpty()` – check if empty
- `size()` – return number of elements

### Solution

```java
public class Stack<T> {
    private List<T> items = new ArrayList<>();
    
    public void push(T item) {
        items.add(item);
    }
    
    public T pop() {
        if (isEmpty()) {
            throw new IllegalStateException("Stack is empty");
        }
        return items.remove(items.size() - 1);
    }
    
    public T peek() {
        if (isEmpty()) {
            throw new IllegalStateException("Stack is empty");
        }
        return items.get(items.size() - 1);
    }
    
    public boolean isEmpty() {
        return items.isEmpty();
    }
    
    public int size() {
        return items.size();
    }
}

// Usage
Stack<String> stack = new Stack<>();
stack.push("A");
stack.push("B");
System.out.println(stack.pop());  // "B"
System.out.println(stack.peek()); // "A"
```

---

## Exercise 5: Payment Processing with Polymorphism 🔴 Advanced

### Objective
Implement a payment processing system using polymorphism and sealed classes.

### Problem Statement
Create:
1. A sealed `PaymentService` interface or abstract class
2. Multiple payment implementations (Credit Card, PayPal, Bank Transfer)
3. A `PaymentProcessor` that accepts any PaymentService
4. Each implementation should validate and process payments differently

### Solution

```java
public sealed interface PaymentService permits 
    CreditCardPaymentService, PayPalPaymentService, BankTransferService {
    PaymentResult process(Payment payment);
    void refund(String transactionId);
}

public record Payment(String id, double amount, String description) {}

public record PaymentResult(boolean success, String transactionId, String message) {}

public final class CreditCardPaymentService implements PaymentService {
    @Override
    public PaymentResult process(Payment payment) {
        if (payment.amount() <= 0) {
            return new PaymentResult(false, "", "Invalid amount");
        }
        String transactionId = "CC-" + UUID.randomUUID();
        return new PaymentResult(true, transactionId, "Credit card processed");
    }
    
    @Override
    public void refund(String transactionId) {
        System.out.println("Refunding to credit card: " + transactionId);
    }
}

public final class PayPalPaymentService implements PaymentService {
    @Override
    public PaymentResult process(Payment payment) {
        if (payment.amount() < 0.50) {
            return new PaymentResult(false, "", "Minimum amount is $0.50");
        }
        String transactionId = "PP-" + UUID.randomUUID();
        return new PaymentResult(true, transactionId, "PayPal processed");
    }
    
    @Override
    public void refund(String transactionId) {
        System.out.println("Refunding via PayPal: " + transactionId);
    }
}

public final class BankTransferService implements PaymentService {
    @Override
    public PaymentResult process(Payment payment) {
        if (payment.amount() < 100) {
            return new PaymentResult(false, "", "Bank transfer minimum is $100");
        }
        String transactionId = "BT-" + UUID.randomUUID();
        return new PaymentResult(true, transactionId, "Bank transfer initiated");
    }
    
    @Override
    public void refund(String transactionId) {
        System.out.println("Refunding bank transfer: " + transactionId);
    }
}

public class PaymentProcessor {
    private PaymentService service;
    
    public PaymentProcessor(PaymentService service) {
        this.service = service;
    }
    
    public PaymentResult processPayment(Payment payment) {
        return service.process(payment);
    }
}

// Usage
Payment payment = new Payment("P1", 50, "Order 123");

PaymentService creditCard = new CreditCardPaymentService();
PaymentResult result = creditCard.process(payment);
System.out.println(result);

PaymentService paypal = new PayPalPaymentService();
result = paypal.process(payment);
System.out.println(result);
```

---

## Exercise 6: Custom Exception and Lambda Functions 🔴 Advanced

### Objective
Create custom exceptions and use functional interfaces for validation.

### Problem Statement
Implement:
1. Custom `InsufficientBalanceException` exception
2. A `Validator<T>` functional interface
3. BankAccount class with deposit/withdraw using validators
4. Test with multiple validators

### Solution

```java
public class InsufficientBalanceException extends Exception {
    private double shortfall;
    
    public InsufficientBalanceException(double shortfall) {
        super("Insufficient balance. Short by: $" + shortfall);
        this.shortfall = shortfall;
    }
    
    public double getShortfall() {
        return shortfall;
    }
}

@FunctionalInterface
public interface Validator<T> {
    boolean validate(T value) throws Exception;
}

public class BankAccount {
    private String accountNumber;
    private double balance;
    
    public BankAccount(String accountNumber, double initialBalance) {
        this.accountNumber = accountNumber;
        this.balance = initialBalance;
    }
    
    public void withdraw(double amount, Validator<Double> validator) throws InsufficientBalanceException {
        try {
            if (!validator.validate(amount)) {
                throw new IllegalArgumentException("Validation failed");
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Validation error: " + e.getMessage());
        }
        
        if (amount > balance) {
            throw new InsufficientBalanceException(amount - balance);
        }
        
        balance -= amount;
    }
    
    public double getBalance() {
        return balance;
    }
}

// Usage
BankAccount account = new BankAccount("ACC123", 500);

// Validator: amount must be positive
Validator<Double> positiveValidator = amount -> amount > 0;

// Validator: amount must be < 100
Validator<Double> limitValidator = amount -> amount < 100;

// Validator: multiple conditions
Validator<Double> complexValidator = amount -> 
    amount > 0 && amount < 500;

try {
    account.withdraw(50, positiveValidator);
    System.out.println("Withdrawn successfully. Balance: " + account.getBalance());
} catch (Exception e) {
    System.out.println("Error: " + e.getMessage());
}
```

---

## Summary of Exercises

| # | Topic | Difficulty | Skills |
|---|-------|-----------|--------|
| 1 | Customer class | 🟢 Basic | equals/hashCode, HashSet |
| 2 | Order streams | 🟡 Intermediate | Streams, Collectors, grouping |
| 3 | File reading | 🟡 Intermediate | Exception handling, try-with-resources |
| 4 | Generic stack | 🟡 Intermediate | Generics, Collections |
| 5 | Payment system | 🔴 Advanced | Sealed classes, polymorphism |
| 6 | Bank account | 🔴 Advanced | Custom exceptions, lambdas |

---

<div class="chapter-nav">
<a href="/docs/10-jvm-fundamentals" class="btn btn-secondary">← Previous: JVM Fundamentals</a>
<div class="chapter-nav-spacer"></div>
<a href="/docs/12-interview-questions" class="btn">Next: Interview Questions →</a>
</div>
