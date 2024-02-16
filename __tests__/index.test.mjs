import {
  expect,
  test,
} from 'vitest';

import postcss from 'postcss';

import plugin from './index.js';

function runPlugin (input, opts = {}) {
  return postcss([plugin(opts)]).process(input, { from: undefined });
}

async function run (input, expectedOutput, opts) {
  const result = await runPlugin(input, opts);
  expect(result.css).toEqual(expectedOutput);
  expect(result.warnings()).toHaveLength(0);
}

test('fix block order', async () => {
  await run(
    'a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) } a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) } a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    { preserve: true },
  );
});

test('adds :is() when :matches() is found', async () => {
  await run(
    'a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }\na:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    { preserve: true },
  );
});

test('adds :matches() when :is() is found', async () => {
  await run(
    'a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }\na:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    { preserve: true },
  );
  await run(
    'a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }\na:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    { preserve: 'some truthy value' },
  );
  await run(
    'a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }\na:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    {},
  );
});

test('replace :matches() with :is()', async () => {
  await run(
    'a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    { preserve: false },
  );

  await run(
    'a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    { preserve: false },
  );

  await run(
    'a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    { preserve: false },
  );
});

test('replace :is() with :matches()', async () => {
  await run(
    'a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    {
      preserve: 'matches',
    },
  );
  await run(
    'a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    {
      preserve: 'matches',
    },
  );
});

test('prevent duplicating blocks', async () => {
  await run(
    'a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) } a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    {
      preserve: 'matches',
    },
  );
  await run(
    'a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) } a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    {
      preserve: 'matches',
    },
  );
  await run(
    'a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) } a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    {
      preserve: 'matches',
    },
  );
  await run(
    'a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) } a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    {
      preserve: false,
    },
  );
  await run(
    'a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) } a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    {
      preserve: false,
    },
  );
});

test('fix block order', async () => {
  await run(
    'a:is(:hover, :active) { background: red } a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'a:matches(:hover, :active) { background: red } a:is(:hover, :active) { background: red } a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) } a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    {
      preserve: true,
    },
  );
  await run(
    'a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) } a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) } a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    {
      preserve: true,
    },
  );
  await run(
    'div {color: red} a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) } a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) } a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) } a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    'div {color: red} a:matches(:hover, :active) { background: rgb(0, 0, 0, 0.1) } a:is(:hover, :active) { background: rgb(0, 0, 0, 0.1) }',
    {
      preserve: true,
    },
  );
});
