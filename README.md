# Pattern Finder
Pattern Finder is a program that is able to find the hidden pattern inside an integer sequence.

However, please note, Pattern Finder is **NOT** a regression tool. It only looks for patterns that are 100% accurate. Pattern Finder is **NOT** going to tell you the general trend of your data.

Also, the goal of this program is to find the *most reasonable* pattern instead of to find *any* pattern in the shortest time. The top most pattern should be the most reasonable one of all.

## How does it work
First, there is no magic in Pattern Finder. It attempts every single combination of known patterns. It is just DFS + BFS, a.k.a. brute force. Now you may ask, what is even DFS + BFS? How does DFS work with BFS? And most importantly, why?

Well, the problem with DFS / BFS alone is that the solution space is literally infinitely large. It is infinitely deep while infinitely wide. The actual searching algorithm used here works basically by increasing both depth and width at the same time.

In a higher abstraction level, the algorithm looks like this:

```
Step 1
A1




------------
Step 2
A1 - A2




------------
Step 3
A1 - A2
|
B1


------------
Step 3
A1 - A2 - A3
|
B1


------------
Step 4
A1 - A2 - A3
|
B1 - B2


------------
Step 5
A1 - A2 - A3
|
B1 - B2
|
C1
------------
...
```

I don't think I am the first person who came up with this searching algorithm but I have no idea what it is called, so I refer it as DFS + BFS since it is just the combination of both.

## Development status
I initially started writing this program in order to practice my skills in ES6 generators. (That is why it has so many generators.) For now, this program is able to find some basic patterns (such as [1, 2, 3] or [2, 4, 8, 16]). However, it still lacks a bunch of functionality such as identify prime number sequences or Fibonacci sequences. I will try my best to improve this program if I have time.

Also, if you have any questions or suggestions, you are more than welcome to post them on GitHub issues.
