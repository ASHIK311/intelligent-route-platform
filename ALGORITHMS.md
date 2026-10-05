# Routing Algorithms & Theoretical Specifications

## 1. Overview

The platform implements modular graph search algorithms with strict interface isolation:
- **A\* Algorithm**: Primary general-purpose search engine.
- **Dijkstra Algorithm**: Exact optimality baseline and verification engine.
- **Bidirectional Search**: Simultaneous frontier expansion for large metropolitan graphs.
- **Alternative Route Discovery**: Multi-profile exploration and penalty deflection.

---

## 2. Dynamic Cost Function Formulation

Unlike traditional shortest-path engines optimizing distance alone, the edge traversal cost $c(e)$ is evaluated dynamically:

$$c(e) = W_d \cdot D(e) + W_t \cdot T(e) + W_c \cdot C(e) + W_p \cdot \Delta_p(e) + W_r \cdot R(e) + W_u \cdot P_u(e)$$

Where:
- $D(e)$: Geographic segment distance in kilometers.
- $T(e)$: Current estimated travel time in minutes.
- $C(e)$: Monetary toll cost in USD.
- $\Delta_p(e)$: Predicted delay above free-flow base transit time: $\max(0, T_{\text{pred}}(e) - T_{\text{base}}(e))$.
- $R(e)$: Risk factor based on congestion volatility ($0 \le R \le 1$).
- $P_u(e)$: User preference penalty if segment diverges from preferred corridors or road types.

Weights are normalized such that:
$$\sum W_i = 1.0$$

---

## 3. Algorithm Implementations

### 3.1 A\* Search Algorithm
The evaluation function is:
$$f(n) = g(n) + h(n)$$
Where:
- $g(n)$ is the exact accumulated dynamic cost from origin to node $n$.
- $h(n)$ is the admissible geographic heuristic to destination $t$:
  $$h(n) = W_d \cdot \text{HaversineDistance}(n, t)$$

**Admissibility & Consistency:**
Because the minimum theoretical cost per kilometer across any edge cannot be less than $W_d \cdot \text{distance}$, and straight-line Haversine distance satisfies the triangle inequality:
$$h(u) \le c(u, v) + h(v)$$
$h(n)$ is guaranteed to be **admissible** and **monotone/consistent**, ensuring A\* always finds the optimal path without re-visiting closed nodes.

---

### 3.2 Dijkstra Baseline Algorithm
Dijkstra operates as a special case of A\* where $h(n) = 0$. It guarantees exact shortest-path solutions across non-negative dynamic weights and serves as the ground truth benchmark for verification.

---

### 3.3 Bidirectional Search
For long-distance or dense metropolitan graphs, Bidirectional Dijkstra searches forward from $s$ (using outgoing edges) and backward from $t$ (using incoming edges):
- Forward queue: $Q_F$, distances $d_F$
- Backward queue: $Q_B$, distances $d_B$
- Intersection threshold: Stops when $\min(Q_F) + \min(Q_B) \ge \mu$, where $\mu$ is the best complete path seen so far.
This reduces search space from $\mathcal{O}(b^d)$ to $\mathcal{O}(2 b^{d/2})$.

---

## 4. Empirical Benchmark Comparison

Benchmarked on a 400-node, 1,520-edge grid network:

| Algorithm | Execution Time | Nodes Explored | Path Cost | Optimality |
| :--- | :--- | :--- | :--- | :--- |
| **Dijkstra** | ~1.20 ms | 400 | 42.612 | 100% (Baseline) |
| **A\*** | ~0.82 ms | 400 | 42.612 | 100% (Optimal) |
| **Bidirectional** | ~0.63 ms | 379 | 42.612 | 100% (Optimal) |

*Results verified by `npm run benchmark`.*
