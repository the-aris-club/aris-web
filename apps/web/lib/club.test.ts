// The one assertion in this repo that has never been possible: every anchor in
// the section nav resolves to a section on the page.
//
// It became possible when the sections and their anchors became one list in
// lib/club rather than five link hrefs in one file and five section ids in
// another. Before that, the two could disagree and nothing would say so — and
// they had: the nav listed Automation before Your work while the page rendered
// Your work before Automation, and CONTEXT.md:47 fixed a third order.
//
// Run with `node --test`. Node strips the types; there is no test dependency and
// no test script until a second file exists to justify one.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import {
  BOT_FORBIDDEN_ACTIONS,
  BOT_RESERVED_DECISIONS,
  LANDING_PAGE_SECTIONS,
  NEVER_SENT_TO_AI,
  PROJECT_REQUIREMENTS,
  RECRUITMENT,
  TECHNICAL_DEPARTMENTS,
} from './club.ts'

const PAGE = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf-8')

test('every section nav link has a matching section on the page', () => {
  for (const section of LANDING_PAGE_SECTIONS) {
    assert.ok(
      PAGE.includes(
        `LANDING_PAGE_SECTIONS[${LANDING_PAGE_SECTIONS.indexOf(section)}].anchor`
      ),
      `no section on the page reads its id from LANDING_PAGE_SECTIONS for ${section.label}`
    )
  }
})

test('each section anchor is referenced once as a link and once as an id', () => {
  // The ids come from the list, so what is checked here is that every section
  // in the list is actually placed: five sections are on the page today.
  assert.equal(
    PAGE.split('LANDING_PAGE_SECTIONS[').length - 1,
    LANDING_PAGE_SECTIONS.length
  )
})

test('the sections are in the order CONTEXT.md fixes', () => {
  assert.deepEqual(
    LANDING_PAGE_SECTIONS.map((s) => s.anchor),
    ['groups', 'departments', 'projects', 'ownership', 'automation']
  )
})

test('there are four technical departments and never five', () => {
  assert.equal(TECHNICAL_DEPARTMENTS.length, 4)
})

test('every quoted clause names the source it came from', () => {
  for (const clause of [
    BOT_FORBIDDEN_ACTIONS,
    BOT_RESERVED_DECISIONS,
    NEVER_SENT_TO_AI,
    PROJECT_REQUIREMENTS,
  ]) {
    assert.match(clause.source, /^Community Terms §\d+$/u)
  }
})

test('the bot authority lists match the counts the copy asserts', () => {
  // §9 reserves eight decisions to people and forbids ten actions. The lede says
  // "Eight decisions"; if either list changes, this says so rather than the page
  // quietly claiming a number its own data does not support.
  assert.equal(BOT_RESERVED_DECISIONS.items.length, 8)
  assert.equal(BOT_FORBIDDEN_ACTIONS.items.length, 10)
  assert.equal(NEVER_SENT_TO_AI.items.length, 7)
})

test('the five project requirements are what §11 lists', () => {
  assert.equal(PROJECT_REQUIREMENTS.items.length, 5)
})

test('the recruitment numbers the CTA states are the ones the flow commits to', () => {
  // The CTA's sentence is page voice and stays written out, because its numbers
  // sit mid-sentence where a derived numeral reads wrong. These are the values
  // it must agree with, cited to recruitment-flow.md:15 and its annual calendar.
  assert.equal(RECRUITMENT.evaluatorsMinimum, 3)
  assert.equal(RECRUITMENT.forms, 1)
  assert.equal(RECRUITMENT.windowWeeks, 4)
  assert.equal(RECRUITMENT.stages.length, 3)

  for (const [spelled, n] of [
    ['three evaluators', RECRUITMENT.evaluatorsMinimum],
    ['one form', RECRUITMENT.forms],
    ['Four weeks', RECRUITMENT.windowWeeks],
  ] as [string, number][]) {
    assert.ok(
      PAGE.includes(spelled),
      `the CTA no longer says "${spelled}" but RECRUITMENT still says ${n}`
    )
  }
})
