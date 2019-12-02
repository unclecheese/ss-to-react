const escapeRegExp = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/**
 * Replace basic variables for use in a React component
 *
 * @param str
 * @returns {*}
 */
module.exports = (str) => {
    let template = str;

    /**
     * Basic variable match
     *
     * starts with a $
     * must contain word characters to avoid matching '$'
     * contains word characters and (,)
     * optionally starts with a {
     * optionally ends with a }
     * @type {RegExp}
     */
    const matches = template.match(/{?\$[a-z0-9.(,)]*}?/igm);
    if (!matches) {
      return template;
    }      
    for (let i = 0, l = matches.length; i < l; i += 1) {
        let val = matches[i];

        // add reference to component props
        val = val.replace('$', 'props.');

        // remove any curly braces
        val = val.replace(/{|}/g, '');

        // wrap all variables curly braces
        val = `{${val}}`;

        // escapse value before creating custom regex
        let escMatch = escapeRegExp(matches[i]);
    
        // replace any other instance
        template = template.replace(matches[i], val);
    }

    return template;
};
