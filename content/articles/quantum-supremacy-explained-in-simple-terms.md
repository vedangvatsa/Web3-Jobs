---


title: "Quantum Supremacy Explained in Simple Terms"
image: "https://picsum.photos/seed/quantum-supremacy/1200/630"
description: "A simple explanation of what quantum supremacy (or quantum advantage) means, why it's a big deal, and what it doesn't mean for the future of computing."
category: "Educational"
data-ai-hint: "quantum circuit"

---



Quantum supremacy, a term that is now often replaced by the less confrontational "quantum advantage," represents a critical milestone in the field of [quantum computing](/what-is-quantum-computing-for-beginners). It's the moment when a quantum computer successfully performs a specific computational task that is practically impossible for even the most powerful classical supercomputer to solve in a reasonable amount of time.

It's not about a quantum computer being better at everything. It doesn't mean your laptop is obsolete or that quantum computers are ready to solve all the world's problems. Think of it as a "Hello, World!" moment for a new era of computing. It's a demonstration of potential, a proof of concept that these machines can, in fact, tap into the power of quantum mechanics to outperform our best classical machines on at least one, very specific and carefully chosen problem.

The problem itself doesn't even have to be useful. The whole point is just to prove that it can be done. It's like the Wright brothers' first flight. Their first plane wasn't a practical mode of transportation. It only flew for 12 seconds and didn't go very far. But it proved that powered flight was possible, opening the door for all the aviation technology that followed. Quantum supremacy is the Wright brothers' flight for quantum computers.

### The Landmark 2019 Experiment by Google

The term gained widespread attention in 2019 when Google published a paper in the journal *Nature* claiming to have achieved quantum supremacy. Their team, using a 53-qubit quantum processor named "Sycamore," performed a highly specific task.

**The Task**: The task was essentially to sample the output of a random quantum circuit. Imagine sending a pulse of energy through a complex maze of quantum gates. Because of quantum effects like superposition and interference, the output is a complex probability distribution of different bitstrings. The task for the quantum computer was to run this experiment and produce a set of samples from that output distribution.

**The Result**: Google's Sycamore processor was able to perform this task in about 200 seconds. They estimated that it would take the world's most powerful classical supercomputer at the time, IBM's Summit, approximately 10,000 years to perform the same task.

**The Controversy**: This claim was not without controversy. IBM, a major competitor in the quantum computing space, published a rebuttal suggesting that with a different classical algorithm and by using the supercomputer's massive hard drive storage, the task could be completed in 2.5 days, not 10,000 years. While this is still significantly longer than 200 seconds, it sparked a debate about where exactly the line for "supremacy" should be drawn.

Regardless of the exact numbers, the experiment was a landmark achievement that demonstrated a quantum computer performing a task far beyond the practical reach of a classical machine.

### Why is this So Hard for a Classical Computer?

Simulating a quantum system on a classical computer is incredibly difficult because the number of possibilities grows exponentially with the number of qubits.

A classical bit is either a 0 or a 1. So, to describe a system of 53 bits, you just need 53 numbers.

A qubit, however, can be in a superposition of 0 and 1. To fully describe the state of a 53-qubit system, you need to keep track of the probability amplitude for every single possible outcome. The number of possible outcomes is 2 to the power of 53 (2^53), which is a number over 9 quadrillion. To simulate the quantum computer, a classical computer would need to store and perform mathematical operations on a vector with over 9 quadrillion complex numbers. This is what makes the problem exponentially hard and why even a small increase in the number of qubits makes the simulation vastly more difficult.

### What Quantum Supremacy Is Not

It's just as important to understand what quantum supremacy does not mean.

*   **It does not mean quantum computers are generally useful yet.** The problem Google solved was specifically designed to be easy for a quantum computer and hard for a classical one. It has no known practical application.
*   **It does not mean quantum computers are better at all tasks.** Your laptop will always be better at browsing the internet, sending emails, or playing video games.
*   **It does not mean quantum computers are error-free.** The quantum computers we have today are very "noisy" and prone to errors. A major part of the research field is dedicated to developing quantum error correction to make them more reliable.

### From Supremacy to Advantage

Because the term "supremacy" can sound aggressive and be misinterpreted as meaning quantum computers are superior in every way, many researchers now prefer the term "quantum advantage." This term is used to describe the point where a quantum computer can solve a real-world, commercially relevant problem significantly faster or more efficiently than the best known classical computer.

Achieving quantum advantage is the next major goal for the field. This would involve using a quantum computer to do something useful, like discovering a new drug, designing a more efficient battery material, or optimizing a complex financial model. We are not there yet, but the achievement of quantum supremacy was a critical stepping stone on that path.

### Frequently Asked Questions

**1. Has anyone other than Google claimed quantum supremacy?**
Yes. In 2020, a team of researchers from the University of Science and Technology of China claimed to have achieved quantum supremacy using a different type of quantum computer based on photons (particles of light). Their task, called boson sampling, was also a highly specific problem with no immediate practical use.

**2. Why is the problem they solved so useless?**
The point was not to solve a useful problem. The point was to pick a computational problem that perfectly maps to the natural strengths of a quantum processor, one that would highlight the exponential difference in how quantum and classical machines handle complexity. It was a scientific demonstration, not a commercial product.

**3. When will quantum computers actually be useful?**
This is the billion-dollar question. Predictions vary widely, but most experts believe we are still 5 to 10 years away from seeing quantum computers solve commercially relevant problems that are beyond the reach of classical machines. This era is often referred to as the era of "Noisy Intermediate-Scale Quantum" (NISQ) computers, where the machines are powerful enough to be interesting but are still too small and error-prone for many of the most exciting applications.

**4. What does this mean for encryption?**
The demonstration of quantum supremacy does not mean that encryption is broken today. The Sycamore chip is not capable of running Shor's algorithm, the quantum algorithm that can break modern cryptography. However, it is a wake-up call. It proves that quantum computation is advancing rapidly, and it highlights the urgency of transitioning to new forms of "post-quantum cryptography" that are resistant to attacks from both classical and quantum computers.
