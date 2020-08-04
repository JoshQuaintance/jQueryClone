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

const arr = [];
const slice = arr.slice;

String.prototype.isValidHTML = function() {
  let hasTags = /<\/?.*\/?>/g.test(this);
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
  let hasTags = /<\/?.*\/?>/g.test(this);
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
const $ = function(argument) {
  /**
   * Takes a string parses it into HTML
   * Note: Will not return any <script> tag.
   * @param {String} element HTML string to parse
   */
  this.parseHTML = function(element) {
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

  return new $.fn.jQueryObj(argument);
};

/**
 * jQuery prototype properties
 */
$.fn = $.prototype = {
  jquery: '3.5.1',

  constructor: $,

  'length': 0,
  
  splice: Array.prototype.splice,

  toArray: function() {
    return slice.call(this, 'tes');
  },

  /**
   * Turns everything inside the object into a string
   */
  toString: function(){
    let ret = this || [];
    let originLen = ret.length;
    this.toArray().forEach(el => {
      [].push.call(ret, el.outerHTML);
    });
    ret.splice(0, originLen);
    return ret;
  },

  map: function(callback) {
    return this.toArray().map(callback);
  }, 

  forEach: function(callback) {
    return this.toArray().forEach(callback);
  }
};

/**
 * jQuery Object Constructor
 * @param {String | Object | $.fn.jQueryObj} argument 
 */
$.fn.jQueryObj = function(argument) {
  
  // If there is nothing passed in, just return
  // The jQuery object (which is 'this')
  if (!argument) return this;

  // If the argument is a string

  if (typeof argument == 'string') {
    if (argument.isValidHTML()) {
      const createdElem = argument.createElement();
      let ret = this || [];

      createdElem.forEach(elem => {
        arr.push.call(ret, elem);
      });
      return ret;
    } else {
      const getElem = document.querySelectorAll(argument);
      
      let ret = this || [];

      getElem.forEach(elem => {
        arr.push.call(ret, elem);
      });
      return ret;
    }
    
  } else if (typeof argument == 'function') {
    document.addEventListener('DOMContentLoaded', argument);
  }
};

const init = $.fn.jQueryObj.prototype = $.fn;

/**
 * CSS Function
 * @param  {...any} cssArgs 
 */
init.css = function(...cssArgs) {
  // Get the collection into an array
  const Collection = this.toArray();

  // If the args starts with a string
  if (typeof cssArgs[0] === 'string') {
    const [ property, attribute ] = cssArgs;
    Collection.forEach(elem => {
      elem.style[property] = attribute;
    });
  } else if (typeof cssArgs[0] == 'object') {
    const cssProps = Object.entries(cssArgs[0]);
    cssProps.forEach(([property, attribute]) => {
      Collection.forEach(el => {
        el.style[property] = attribute;
      });
    });
  }
  
  return this;
};

/**
 * Appends the elements into the attached element
 * @param {Object | String} elements
 */
init.append = function(elements) {
  const Collection = this.toArray();
  // if elements is an object 
  if (typeof elements == 'object') {
    Collection.forEach(target => elements.forEach(elem => target.append(elem)));
    // If elements is a string
  } else if (typeof elements == 'string') {
    // For each element inside the array attached
    // append the given argument
    Collection.forEach(target => target.append(elements));
  }
  return this;
};

/**
 * Prepends the elements into the attached element
 * @param {Object | String} elements
 */
init.prepend = function(elements) {
  // if elements is an object 
  if (typeof elements == 'object') {
    this.forEach(target => elements.forEach(elem => target.prepend(elem))
    );
    // If elements is a string
  }
  else if (typeof elements == 'string') {

    // For each element inside the array attached
    // prepend the given argument
    this.forEach(target => target.prepend(elements));
  }

  return this;
};

/**
 * Attaches an event listener on the element.
 * @param {Event} event event
 * @param {Function} callback function callback
 */
init.on = function(event, handler) {
  if (typeof event !== 'string') return TypeErr('Event have to be in string');

  this.forEach(elem => {
    elem.addEventListener(event, handler);
  });
  
  return this;
};

/**
 * Shortcuts for common events
 */
init.onclick = function(handler) {
  this.forEach(elem => {
    elem.addEventListener('click', handler);
  });
};

init.onhover = function(handlerIn, handlerOut) {
  this.forEach(elem => {
    elem.addEventListener('mouseover', handlerIn);
    elem.addEventListener('mouseout', handlerOut);
  });
};

/**
 * 
 * @param {Function | String} args 
 * @param {Boolean} concatenate 
 */
init.text = function(args) {
  if (args == undefined || args == null) {

    let text = '';
    this.forEach(elem => {
      text += elem.textContent;
    });

    return text;
  } else if (typeof args == 'function') {
    this.forEach((elem, index) => {
      let callbackRet = args(index, elem.textContent);

      elem.textContent = callbackRet;
    });

    return this;
  } else if (typeof args == 'string') {
    this.forEach(elem => {
      elem.textContent = args;
    });
    
    return this;
  }
};

window.$ = $;



