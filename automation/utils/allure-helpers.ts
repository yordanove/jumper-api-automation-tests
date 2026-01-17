/**
 * Allure reporting helpers for test annotations
 */

import * as allure from 'allure-js-commons';

export interface AllureLabels {
  epic?: string;
  feature?: string;
  story?: string;
  severity?: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';
}

/**
 * Add Allure labels to the current test
 */
export function addAllureLabels(options: AllureLabels): void {
  if (options.epic) allure.epic(options.epic);
  if (options.feature) allure.feature(options.feature);
  if (options.story) allure.story(options.story);
  if (options.severity) allure.severity(options.severity);
}

/**
 * Attach request and response data to Allure report
 */
export function attachRequestResponse(
  request: { method: string; url: string; body?: unknown },
  response: { status: number; body: unknown }
): void {
  allure.attachment('Request', JSON.stringify(request, null, 2), 'application/json');
  allure.attachment('Response', JSON.stringify(response, null, 2), 'application/json');
}

/**
 * Add a step to the Allure report
 */
export async function step<T>(name: string, fn: () => Promise<T>): Promise<T> {
  return allure.step(name, fn);
}

/**
 * Attach arbitrary data to the report
 */
export function attach(name: string, content: string, type: string = 'text/plain'): void {
  allure.attachment(name, content, type);
}
