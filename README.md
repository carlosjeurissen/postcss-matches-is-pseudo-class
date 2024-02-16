# postcss-matches-is-pseudo-class
PostCSS plugin which converts :matches() pseudo classes into :is() and reverse.

By default:
```css
.foo:matches(:hover, :active) {
  text-decoration: underline;
}

.bar:is(:hover, :active) {
  text-decoration: underline;
}
```

becomes

```css
.foo:matches(:hover, :active) {
  text-decoration: underline;
}

.foo:is(:hover, :active) {
  text-decoration: underline;
}

.bar:matches(:hover, :active) {
  text-decoration: underline;
}

.bar:is(:hover, :active) {
  text-decoration: underline;
}
```
## options
### preserve
If `true` (default), both `:is()` and `:matches()` are kept/added
If `false`, renames `:matches()` to `:is()`
If `"matches"`, renames `:is()` to `:matches()`

## Usage

**Step 1:** Install plugin:

```sh
npm install --save-dev postcss postcss-matches-is-pseudo-class
```

**Step 2:** Check you project for existed PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

If you do not use PostCSS, add it according to [official docs]
and set this plugin in settings.

**Step 3:** Add the plugin to plugins list:

```diff
module.exports = {
  plugins: [
+   require('postcss-matches-is-pseudo-class')({ preserve: true }),
  ]
}
```
