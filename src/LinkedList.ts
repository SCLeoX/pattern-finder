interface ILinkedElement<T> {
  value: T;
  next: ILinkedElement<T> | undefined;
  prev: ILinkedElement<T> | undefined;
}
export class LinkedList<T> {
  public length: number = 0;
  public head: ILinkedElement<T> | undefined;
  public tail: ILinkedElement<T> | undefined;
  public append(value: T) {
    const element: ILinkedElement<T> = {
      value,
      next: undefined,
      prev: undefined,
    };
    if (this.head === undefined || this.tail === undefined) {
      this.head = element;
      this.tail = element;
    } else {
      this.tail.next = element;
      element.prev = this.tail;
      this.tail = element;
    }
    this.length++;
  }
  public *iterate(): Iterator<T> {
    let pointer = this.head;
    while (pointer !== undefined) {
      const op: null | undefined | T = yield pointer.value;
      if (op === null) {
        if (pointer.prev !== undefined) {
          pointer.prev.next = pointer.next;
        } else {
          this.head = pointer.next;
        }
        if (pointer.next !== undefined) {
          pointer.next.prev = pointer.prev;
        } else {
          this.tail = pointer.prev;
        }
        this.length--;
      } else if (op !== undefined) {
        pointer.value = op;
      }
      pointer = pointer.next;
    }
  }
}
