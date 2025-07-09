/**
 * @fileoverview A concise collection of common TypeScript utility methods.
 */

interface Dictionary<T> {
  [key: string]: T;
}

const Utils = {
  /**
   * Checks if a value is null or undefined.
   * @param {T | null | undefined} value The value to check.
   * @returns {boolean} True if the value is null or undefined, false otherwise.
   */
  isNil<T>(value: T | null | undefined): value is null | undefined {
    return value === null || value === undefined;
  },

  /**
   * Checks if a string is empty, null, or undefined (after trimming whitespace).
   * @param {string | null | undefined} str The string to check.
   * @returns {boolean} True if the string is empty, null, or undefined, false otherwise.
   */
  isEmptyString(str: string | null | undefined): boolean {
    return Utils.isNil(str) || str.trim().length === 0;
  },

  /**
   * Checks if an array is empty, null, or undefined.
   * @param {Array<T> | null | undefined} arr The array to check.
   * @returns {boolean} True if the array is empty, null, or undefined, false otherwise.
   */
  isEmptyArray<T>(arr: Array<T> | null | undefined): boolean {
    return Utils.isNil(arr) || arr.length === 0;
  },

  /**
   * Checks if an object is empty (has no own enumerable properties), null, or undefined.
   * @param {object | null | undefined} obj The object to check.
   * @returns {boolean} True if the object is empty, null, or undefined, false otherwise.
   */
  isEmptyObject(obj: object | null | undefined): boolean {
    return Utils.isNil(obj) || Object.keys(obj).length === 0;
  },

  /**
   * Safely parses a JSON string.
   * @param {string} jsonString The JSON string to parse.
   * @param {T | null} [defaultValue=null] The default value to return if parsing fails.
   * @returns {T | null} The parsed JSON object/array, or the default value on error.
   */
  safeParseJSON<T>(
    jsonString: string,
    defaultValue: T | null = null
  ): T | null {
    try {
      return JSON.parse(jsonString) as T;
    } catch (e) {
      console.error('Error parsing JSON:', e);
      return defaultValue;
    }
  },

  /**
   * Gets a nested property from an object safely.
   * Prevents errors when accessing properties that might not exist.
   * @param {object | null | undefined} obj The object to query.
   * @param {string} path The dot-separated path to the property (e.g., 'user.address.street').
   * @param {T | undefined} [defaultValue] The default value to return if the path is not found.
   * @returns {T | undefined} The value at the specified path, or the default value if not found.
   */
  getNestedProperty<T>(
    obj: object | null | undefined,
    path: string,
    defaultValue?: T
  ): T | undefined {
    if (Utils.isNil(obj) || Utils.isEmptyString(path)) {
      return defaultValue;
    }

    const parts = path.split('.');
    let current: any = obj; // Use 'any' for intermediate steps where type might be unknown

    for (let i = 0; i < parts.length; i++) {
      if (
        Utils.isNil(current) ||
        !Object.prototype.hasOwnProperty.call(current, parts[i])
      ) {
        return defaultValue;
      }
      current = current[parts[i]];
    }
    return current as T;
  },

  /**
   * Debounces a function, so it's only called after a certain delay.
   * Useful for performance-sensitive events like window resizing, scrolling, or typing.
   * @param {Function} func The function to debounce.
   * @param {number} delay The debounce delay in milliseconds.
   * @returns {Function} The debounced function.
   */
  debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return function (this: any, ...args: Parameters<T>): void {
      const context = this;
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        func.apply(context, args);
        timeout = null; // Reset timeout
      }, delay);
    };
  },

  /**
   * Throttles a function, so it's called at most once within a given period.
   * Useful for performance-sensitive events like window resizing or scrolling.
   * @param {Function} func The function to throttle.
   * @param {number} limit The throttle limit in milliseconds.
   * @returns {Function} The throttled function.
   */
  throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;
    return function (this: any, ...args: Parameters<T>): void {
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  },

  /**
   * Copies text to the clipboard.
   * @param {string} text The text to copy.
   * @returns {Promise<void>} A promise that resolves if successful, rejects otherwise.
   */
  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Text copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy text:', err);
      throw err; // Re-throw to allow caller to handle
    }
  },

  /**
   * Gets a URL query parameter by name.
   * @param {string} name The name of the URL parameter.
   * @param {string} [url=window.location.href] The URL to parse.
   * @returns {string | null} The value of the parameter, or null if not found.
   */
  getUrlParameter(
    name: string,
    url: string = window.location.href
  ): string | null {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  },

  /**
   * Generates a UUID (Universally Unique Identifier).
   * This is a simple, non-cryptographically secure UUID.
   * @returns {string} A UUID string.
   */
  generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  },

  /**
   * Removes duplicate primitive elements from an array.
   * @param {Array<T>} arr The array to remove duplicates from.
   * @returns {Array<T>} A new array with unique elements.
   */
  uniqueArray<T>(arr: Array<T>): Array<T> {
    if (!Array.isArray(arr)) {
      return [];
    }
    return [...new Set(arr)];
  },

  /**
   * Simple deep clone for plain objects and arrays.
   * Does NOT handle Dates, RegExps, Functions, circular references, or class instances.
   * For full deep cloning, use a dedicated library.
   * @param {T} obj The object or array to clone.
   * @returns {T} The deep cloned object or array.
   */
  deepClone<T>(obj: T): T {
    if (Utils.isNil(obj) || typeof obj !== 'object') {
      return obj; // Primitive values, null, undefined
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => Utils.deepClone(item)) as T;
    }

    if (obj?.constructor === Object) {
      // Check if it's a plain object
      const clone: Dictionary<any> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          clone[key] = Utils.deepClone((obj as Dictionary<any>)[key]);
        }
      }
      return clone as T;
    }

    // For other types (Date, RegExp, Function, etc.), return the original reference
    return obj;
  },
};

export default Utils; // For ES Modules
// module.exports = Utils; // For CommonJS if used in Node.js

// --- Usage Examples (for demonstration, assuming you've exported/imported Utils) ---

// Type Checks
console.log('--- Type Checks ---');
console.log('isNil(null):', Utils.isNil(null)); // true
console.log('isEmptyString("  "):', Utils.isEmptyString('  ')); // true
console.log('isEmptyArray([]):', Utils.isEmptyArray([])); // true
console.log('isEmptyObject({}):', Utils.isEmptyObject({})); // true

// JSON Parsing
console.log('\n--- JSON Parsing ---');
const parsed = Utils.safeParseJSON<{ message: string }>('{"message":"Hello"}');
console.log('safeParseJSON:', parsed?.message); // "Hello"
const failedParse = Utils.safeParseJSON<object>('invalid json', {});
console.log('safeParseJSON (failed):', failedParse); // {} (and an error in console)

// Nested Property Access
console.log('\n--- Nested Property Access ---');
const userProfile = {
  personal: {
    name: 'Jane Doe',
    contact: {
      email: 'jane@example.com',
    },
  },
};
console.log(
  'getNestedProperty:',
  Utils.getNestedProperty(userProfile, 'personal.contact.email')
); // "jane@example.com"
console.log(
  'getNestedProperty (non-existent):',
  Utils.getNestedProperty(userProfile, 'personal.contact.phone', 'N/A')
); // "N/A"

// Debounce & Throttle (demonstration only, effects seen in browser/event loop)
console.log('\n--- Debounce & Throttle ---');
const debouncedSearch = Utils.debounce(
  (query: string) => console.log('Searching for:', query),
  300
);
// debouncedSearch('apple'); debouncedSearch('banana'); debouncedSearch('orange'); // Only 'Searching for: orange' after 300ms

const throttledScroll = Utils.throttle(() => console.log('Scrolled!'), 500);
// window.addEventListener('scroll', throttledScroll); // Logs 'Scrolled!' at most every 500ms

// Clipboard API (browser only)
// console.log('\n--- Clipboard API ---');
// Utils.copyToClipboard('This text will be copied!').then(() => {
//     console.log('Copy command successful.');
// }).catch(err => {
//     console.error('Copy command failed:', err);
// });

// URL Parameters
console.log('\n--- URL Parameters ---');
const currentUrl = 'http://example.com?id=123&name=TestUser&status=active';
console.log(
  'getUrlParameter("name"):',
  Utils.getUrlParameter('name', currentUrl)
); // "TestUser"
console.log(
  'getUrlParameter("token"):',
  Utils.getUrlParameter('token', currentUrl)
); // null

// UUID Generation
console.log('\n--- UUID Generation ---');
console.log('generateUUID():', Utils.generateUUID());

// Array Utilities
console.log('\n--- Array Utilities ---');
console.log(
  'uniqueArray([1, 2, 2, "a", "b", "a"]):',
  Utils.uniqueArray([1, 2, 2, 'a', 'b', 'a'])
); // [1, 2, "a", "b"]

// Deep Clone
console.log('\n--- Deep Clone ---');
const originalObj = { a: 1, b: { c: 2 }, d: [3, { e: 4 }] };
const clonedObj = Utils.deepClone(originalObj);
console.log('Original:', originalObj);
console.log('Cloned:', clonedObj);
clonedObj.b.c = 99; // Modify cloned object
clonedObj.d[0] = 100;
(clonedObj.d[1] as any).e = 500; // Type assertion for nested object in array
console.log('Original after clone modification:', originalObj); // Original remains unchanged
// Output will show originalObj.b.c as 2 and originalObj.d as [3, {e: 4}]
