import report from "yurnalist";

/**
 * Raw output - use for script content, piped output, or complex formatted text
 * that should not have reporter formatting applied.
 */
export const raw = console.log.bind(console);

// Re-export yurnalist reporter for structured output
export { report };

/**
 * USAGE GUIDELINES:
 *
 * - report.success() - Operation completed successfully
 * - report.error()   - Operation failed or error occurred
 * - report.info()    - Informational messages
 * - report.warn()    - Warnings that don't stop execution
 * - raw()            - Unformatted output for piping or complex formatting
 */
