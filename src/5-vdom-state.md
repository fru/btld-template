// Extract the following: 3-state.md

```typescript src
function mutateState(path: Path, state: unknown, value: unknown) {
  // mutate + freeze
  // TODO
}

function extractKey(path: Path) {
  // TODO
}

function cloneFrozen(object, options: { deep: boolean } = {}) {
  // TODO
}
```

```typescript src
export type VdomStateListener = (after: any, before: any) => void;

class VContainer {
  _state: { [key: string]: unknown } = {};
  _listener: { [key: string]: VdomStateListener[] } = {};

  listen(path: Path, do: VdomStateListener) {
    // TODO
  }

  setState(path: Path, value: unknown) {
    // TODO
  }

  getState(path: Path) {
    // TODO
  }
}
```
