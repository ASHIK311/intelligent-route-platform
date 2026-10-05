/**
 * Min-Heap Priority Queue for Dijkstra and A* algorithms.
 */
export interface HeapItem<T> {
  element: T;
  priority: number;
}

export class MinPriorityQueue<T> {
  private heap: HeapItem<T>[] = [];

  public get size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public push(element: T, priority: number): void {
    const item: HeapItem<T> = { element, priority };
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  public pop(): T | undefined {
    if (this.isEmpty()) return undefined;
    const min = this.heap[0].element;
    const end = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.sinkDown(0);
    }
    return min;
  }

  public peek(): T | undefined {
    return this.heap.length > 0 ? this.heap[0].element : undefined;
  }

  public clear(): void {
    this.heap = [];
  }

  private bubbleUp(n: number): void {
    const element = this.heap[n];
    while (n > 0) {
      const parentN = Math.floor((n - 1) / 2);
      const parent = this.heap[parentN];
      if (element.priority >= parent.priority) break;
      this.heap[n] = parent;
      this.heap[parentN] = element;
      n = parentN;
    }
  }

  private sinkDown(n: number): void {
    const length = this.heap.length;
    const element = this.heap[n];

    while (true) {
      const child2N = (n + 1) * 2;
      const child1N = child2N - 1;
      let swap: number | null = null;
      let child1Priority = 0;

      if (child1N < length) {
        const child1 = this.heap[child1N];
        child1Priority = child1.priority;
        if (child1Priority < element.priority) {
          swap = child1N;
        }
      }

      if (child2N < length) {
        const child2 = this.heap[child2N];
        if (
          (swap === null && child2.priority < element.priority) ||
          (swap !== null && child2.priority < child1Priority)
        ) {
          swap = child2N;
        }
      }

      if (swap === null) break;
      this.heap[n] = this.heap[swap];
      this.heap[swap] = element;
      n = swap;
    }
  }
}
