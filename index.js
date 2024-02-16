/* eslint-disable no-autofix/strict */

'use strict';

module.exports = function exports (options = {}) {
  const isMatchesRegex = /:(is|matches)\(/i;
  const isMatchesRegexGlobal = /:(is|matches)\(/gi;

  const {
    preserve = true,
  } = options;

  const replacementMatches = ':matches(';
  const replacementIs = ':is(';

  const replaceWithMatches = preserve === 'matches';
  const preserveBoth = preserve && !replaceWithMatches;

  function equalsPrevSelector (rule, prevRule) {
    if (!prevRule) return false;

    const prevSelector = prevRule.selector;
    const prevHasMatches = isMatchesRegex.test(prevSelector);
    if (!prevHasMatches) return false;

    const ruleString = rule.toString();
    const prevRuleString = prevRule.toString();

    if (ruleString === prevRuleString) return true;

    const canonicalString = ruleString.replace(isMatchesRegexGlobal, replacementIs);
    const prevCanonicalString = prevRuleString.replace(isMatchesRegexGlobal, replacementIs);
    return canonicalString === prevCanonicalString;
  }

  function handleRule (rule) {
    const selector = rule.selector;
    const hasMatches = isMatchesRegex.test(selector);
    if (!hasMatches) return;

    let prevRule = rule.prev();
    const isEqualToPrev = equalsPrevSelector(rule, prevRule);
    if (isEqualToPrev) {
      prevRule.remove();
    } else if (preserveBoth) {
      prevRule = rule.cloneBefore();
      prevRule.selector = selector.replace(isMatchesRegex, replacementMatches);
    }

    const replacement = replaceWithMatches ? replacementMatches : replacementIs;
    rule.selector = selector.replace(isMatchesRegex, replacement);
  }

  return {
    postcssPlugin: 'postcss-overflow-clip',

    Once: function Once (root) {
      root.walkRules(handleRule);
    },
  };
};

module.exports.postcss = true;
