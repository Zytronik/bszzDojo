/**
 * `@pandacss/eslint-plugin` for Oxlint, with a fresh `context` per file.
 *
 * The plugin caches each file's Panda imports in a WeakMap keyed by `context`. ESLint creates a
 * context per file, but Oxlint reuses one object, so every file got the imports of the first file
 * linted: when that one didn't import from `styled-system`, the Panda rules silently skipped all
 * the others. A Proxy per `create()` call is a new key each time; its reads still go to the real
 * context, with Oxlint's own object as `this`.
 */
import panda from '@pandacss/eslint-plugin';

/** @param {object} context */
function perFile(context) {
  return new Proxy(context, {
    get(target, property) {
      const value = Reflect.get(target, property, target);
      const own = Object.getOwnPropertyDescriptor(target, property);
      // A frozen own property must come back as it is (a Proxy invariant); those are plain
      // functions like `report` anyway. Methods from the prototype need their real `this`.
      if (own && !own.configurable && !own.writable) return value;
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

export default {
  meta: panda.meta,
  rules: Object.fromEntries(
    Object.entries(panda.rules).map(([name, rule]) => [
      name,
      { ...rule, create: (context) => rule.create(perFile(context)) },
    ]),
  ),
};
