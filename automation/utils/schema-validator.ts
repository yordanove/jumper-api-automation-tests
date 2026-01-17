/**
 * JSON Schema validation utility using Ajv
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export interface ValidationResult {
  valid: boolean;
  errors: string | null;
}

/**
 * Validates data against a JSON schema
 * @param data - The data to validate
 * @param schema - The JSON schema to validate against
 * @returns ValidationResult with valid flag and error messages if any
 */
export function validateSchema(data: unknown, schema: object): ValidationResult {
  const validate = ajv.compile(schema);
  const valid = validate(data);

  return {
    valid,
    errors: valid ? null : ajv.errorsText(validate.errors),
  };
}

/**
 * Type guard for checking if response has expected structure
 */
export function hasProperty<T extends object, K extends string>(
  obj: T,
  key: K
): obj is T & Record<K, unknown> {
  return key in obj;
}
