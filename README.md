# Axxes Java Refresher

A comprehensive, professional-grade Java knowledge base for developers at Axxes.

## Overview

This is an **internal training resource** for Java developers working with modern Java, Spring Boot, and enterprise backend systems. It provides a structured refresher course based on foundational concepts from Baeldung's "Get Started with Java" series, significantly expanded with:

- **Deep technical explanations** – understand the *why*, not just the *how*
- **Modern Java 21 best practices** – records, sealed classes, pattern matching
- **Production-grade examples** – realistic code you'll encounter at Axxes
- **Common mistakes** – pitfalls developers face in production
- **Interview preparation** – 50+ technical questions with detailed answers
- **Practical exercises** – hands-on coding from basic to advanced

## Course Structure

The course is organized into **10 core learning modules** plus **exercises, interview questions, and references**.

```
1. Java Fundamentals
   ├─ JVM/JRE/JDK
   ├─ Compilation and execution
   ├─ Primitives and references
   └─ Control flow and loops

2. Object-Oriented Java
   ├─ Classes and objects
   ├─ Inheritance and polymorphism
   ├─ Interfaces and abstract classes
   └─ Design principles

3. Modern Java (17+)
   ├─ Records
   ├─ Sealed classes
   ├─ Pattern matching
   └─ Enums and Optional

4. equals() & hashCode()
   ├─ The contract
   ├─ HashMap behavior
   └─ Mutable key problems

5. Collections & Generics
   ├─ Lists, Sets, Maps
   ├─ Generic types
   └─ Type bounds and wildcards

6. Functional Java & Streams
   ├─ Functional interfaces
   ├─ Lambda expressions
   ├─ Stream API
   └─ Collectors and performance

7. Strings
   ├─ Immutability
   ├─ String pool
   ├─ Operations
   └─ StringBuilder

8. Exceptions
   ├─ Hierarchy
   ├─ Checked vs unchecked
   ├─ Try-with-resources
   └─ Custom exceptions

9. Java IO
   ├─ Reading and writing files
   ├─ Streams
   ├─ NIO2
   └─ Serialization

10. JVM Fundamentals
    ├─ Bytecode execution
    ├─ Stack vs heap
    ├─ Class loading
    └─ Garbage collection

11. Practical Exercises
    ├─ 6 exercises from basic to advanced
    ├─ Real-world scenarios
    └─ Solutions and explanations

12. Interview Questions
    ├─ 20+ technical questions
    ├─ Detailed answers
    └─ Key insights

13. References & Resources
    ├─ Baeldung articles
    ├─ Official documentation
    └─ Further reading
```

## Target Audience

- **Java developers** at Axxes with 1+ years experience
- **Consultants** working on backend systems and microservices
- **Anyone** preparing to work with Spring Boot and modern Java
- **Interview candidates** preparing for technical interviews

## How to Use This Course

### 1. **Sequential Learning**
Start with Java Fundamentals and progress sequentially. Each module builds on previous knowledge.

```
Read Chapter → Study Examples → Try Exercises → Review Interview Questions
```

### 2. **Deep Dives**
Jump to specific topics based on your needs:
- Understanding **equals()/hashCode()** → Chapter 4
- Working with **Collections** → Chapter 5
- Building with **Streams** → Chapter 6
- Preparing for **interviews** → Chapter 12

### 3. **Reference Material**
Use chapters as reference while coding:
- Forget string methods? → Chapter 7
- Exception handling patterns? → Chapter 8
- Stream operations? → Chapter 6

### 4. **Interview Preparation**
- Review Chapter 12 for technical questions
- Work through Chapter 11 exercises
- Read case study explanations

## Course Philosophy

This course follows the **"What → Why → How → When → Common Mistake"** pattern for each topic:

1. **What is it?** – Definition and basic concept
2. **Why does it exist?** – Problem it solves
3. **How does it work?** – Implementation details
4. **When should I use it?** – Practical recommendations  
5. **Common mistake** – What goes wrong in production

This builds understanding, not memorization.

## Java Version

- **Primary**: Java 21 LTS (latest long-term support)
- **Baseline**: Assumes Java 11+ knowledge
- **Compatibility**: Java 17+ features explained where relevant
- **Discussion**: Java 8 concepts presented as historical context where useful

## Visual Design

The course uses an Axxes-inspired design:
- **Dark theme** with black backgrounds
- **Orange accents** (#FF5200) for hierarchy and emphasis
- **Professional typography** for readability
- **Code blocks** with syntax highlighting
- **Callouts** for important concepts:
  - 💡 **Key Concept** – Important understanding
  - ⚠️ **Common Mistake** – What goes wrong
  - 🧠 **Interview Tip** – Technical interview knowledge
  - 🏗️ **Real-World** – Production patterns
  - 🚀 **Modern Java** – Java 17/21 approaches

## Technical Stack

This course is built with:
- **GitHub Pages** – Static site hosting
- **Jekyll** – Site generation
- **Markdown** – Content format
- **CSS** – Custom styling with Axxes branding
- **JavaScript** – Navigation and interactivity

Deploy to GitHub Pages by pushing to a repository.

## Getting Started

### Online
Visit the deployed site (if hosted) and navigate through chapters.

### Local Development
1. Clone the repository
2. Install Jekyll: `gem install jekyll bundler`
3. Run locally: `jekyll serve`
4. Open http://localhost:4000

## Content Quality

Every section includes:
- ✅ Clear explanations
- ✅ Practical code examples
- ✅ Common pitfalls highlighted
- ✅ Interview questions
- ✅ Links to official sources
- ✅ Modern Java practices

## Exercises and Solutions

Chapter 11 includes **6 practical exercises**:

| # | Topic | Difficulty | Time |
|---|-------|-----------|------|
| 1 | Customer class with equals/hashCode | 🟢 Basic | 15 min |
| 2 | Order processing with Streams | 🟡 Intermediate | 30 min |
| 3 | File reading with exception handling | 🟡 Intermediate | 30 min |
| 4 | Generic stack implementation | 🟡 Intermediate | 20 min |
| 5 | Payment system with polymorphism | 🔴 Advanced | 45 min |
| 6 | Bank account with lambdas | 🔴 Advanced | 45 min |

All exercises include:
- Problem statement
- Starter code
- Expected outcome
- Solution with explanation

## Interview Preparation

Chapter 12 covers **20+ technical questions** typically asked in Java interviews:

- Fundamental concepts (pass-by-value, ==vs equals)
- Collections (ArrayList vs LinkedList, HashMap internals)
- OOP (inheritance vs composition, interfaces vs abstract classes)
- Modern Java (records, sealed classes, pattern matching)
- Streams (lazy evaluation, when NOT to use)
- Performance (generics, garbage collection)
- Exceptions (checked vs unchecked)

Each answer includes:
- Direct answer
- Code examples
- Common pitfalls
- Production context

## References

This course synthesizes Baeldung's "Get Started with Java" series with:
- **50+ Baeldung articles** – practical tutorials
- **Oracle documentation** – official specifications
- **OpenJDK resources** – implementation details
- **Professional experience** – real-world patterns

See Chapter 13 for complete references and resource links.

## Contributing

This is an internal Axxes training resource. To suggest improvements:
1. Note the chapter and topic
2. Describe the improvement
3. Submit via internal channels

## License

Internal Axxes training material. Not for public distribution.

## Support

For questions or clarifications:
- Email: [training@axxes.com]
- Internal: Axxes training team

---

## Quick Navigation

**Start Here**: [Java Fundamentals](docs/01-java-fundamentals.md)

**Jump To**:
- [Collections & Generics](docs/05-collections-generics.md) – for data structure work
- [equals() & hashCode()](docs/04-equals-hashcode.md) – if you've had HashMap bugs
- [Functional Java & Streams](docs/06-functional-java.md) – for modern declarative code
- [Interview Questions](docs/12-interview-questions.md) – if preparing for technical interviews
- [Practical Exercises](docs/11-exercises.md) – to practice coding

---

**Last Updated**: September 2024  
**Java Version**: Java 21 LTS  
**Course Version**: 1.0

---

*A comprehensive Java refresher designed to make you a confident, capable Java developer at Axxes.*
