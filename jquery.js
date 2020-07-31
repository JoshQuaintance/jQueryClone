/**
 * Just some setup
 */
// Error setups
// eslint-disable-next-line no-unused-vars
const Err = str => console.error(new Error(str));
// eslint-disable-next-line no-unused-vars
const TypeErr = str => console.error(new TypeError(str));
// eslint-disable-next-line no-unused-vars
const RefErr = str => console.error(new ReferenceError(str));
// eslint-disable-next-line no-unused-vars
const SynErr = str => console.error(new SyntaxError(str));

String.prototype.isValidHTML = function() {
  let hasTags = /<\/?[a-z]+\/?>/g.test(this);
  if (!hasTags) return false;
  let indexOfEnding = this.split('').indexOf('>');
  let tag = this.split('').slice(0, indexOfEnding).join('').split(' ').slice(0, 1) + '>';
  let elemName = tag.replace(/[</>]/g, ' ').trim();
  let createElem = document.createElement(elemName);
  if (createElem.constructor.name == 'HTMLUnknownElement') return false;
  return true;
};


/**
 * Will not return '<script>' tags.
 */
String.prototype.createElement = function() {
  // Checks if it has the < > brackets like HTML elements
  let hasTags = /<\/?[a-z]+\/?>/g.test(this);
  if (!hasTags) return;

  // Checks if it's a valid HTML
  if (!this.isValidHTML()) return TypeErr(`'${this}' is not a valid HTML tag`);

  // create a new DOMParser from the DOMParser Api
  let parser = new DOMParser();

  // Parse the given string to html element
  let parsedHtml = parser.parseFromString(this, 'text/html');
  
  // Selects the body from the virtual DOM
  let bodyElem = parsedHtml.querySelector('body');

  // Extract the child nodes from the body tag from the virtual DOM
  let extractElem = bodyElem.childNodes;

  // returns the element
  return extractElem;
};



/**
 * jQuery Function
 * @param {String | Function} argument 
 */
const $ = argument => {
  switch (typeof argument) {
  case 'function': 
    document.addEventListener('DOMContentLoaded', argument);
    break;

  case 'string':
    // eslint-disable-next-line no-case-declarations
    let element;
    // If the element creation is not broken
    // Treat it as a new element
    argument.isValidHTML();
    if (argument.isValidHTML()) {
      element = Array.prototype.slice.call(argument.createElement());
    } else { 
      // else treat it as a selector
      element = Array.prototype.slice.call(document.querySelectorAll(argument));
    }
      
    /**
       * CSS function for selected elements
       */
    element.css = (...cssArgs) => {
      // If the first argument is a string
      if (typeof cssArgs[0] === 'string') {
        const [ property, attribute ] = cssArgs;
        for (let el of element) {
          el.style[property] = attribute;
        }

        // If the first argument is an object
      } else if (typeof cssArgs[0] == 'object') {
        const cssProps = Object.entries(cssArgs[0]);
        cssProps.forEach(([property, attribute]) => {
          element.forEach(el => {
            el.style[property] = attribute;
          });
        });
      }
        
      return element;
    };

    /**
       * Appends the elements into the attached element
       * @param {Object | String} elements 
       */
    element.append = function(elements) {
      // if elements is an object 
      if (typeof elements == 'object') {
        this.forEach(target => {
          elements.forEach(elem => {
            target.append(elem);
          });
        });
        // If elements is a string
      } else if (typeof elements == 'string') {
        // For each element inside the array attached
        // append the given argument
        this.forEach(target => target.append(elements));
      }
    };

    // End of this case statement
    // Returns the element object array
    return element;
  }
};

/**
 * Takes a string parses it into HTML
 * Note: Will not return any <script> tag.
 * @param {String} element HTML string to parse
 */
$.parseHTML = function(element) {
  if (typeof element !== 'string') return TypeErr('Parameter needs to be a string.');

  // New DOMParser
  const parser = new DOMParser();
  
  // parses the string into html
  const parsedHtml = parser.parseFromString(element, 'text/html');
  
  // Get the body element
  const bodyElem = parsedHtml.querySelector('body');

  // Get the child nodes of the body elements
  const extractedElem = bodyElem.childNodes;

  // return it as an array
  return Array.prototype.slice.call(extractedElem);
};