import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';

/**
 * Load all global components from the _globals directory.
 *
 * @see https://vuejs.org/v2/guide/components-registration.html#Automatic-Global-Registration-of-Base-Components
 */
export default function registerGlobalComponents(Vue) {
  const requireComponent = require.context(
    './', // load all files at the given location
    false, // whether or not to look in subfolders
    /[A-Z]\w+\.vue$/, // matching base component filenames
  );

  requireComponent.keys().forEach((fileName) => {
    const componentConfig = requireComponent(fileName);

    // get PascalCase name of component
    const componentName = upperFirst(camelCase(fileName.replace(/^\.\/(.*)\.\w+$/, '$1')));

    // register component globally
    Vue.component(
      componentName,
      // Look for the component options on `.default`, which will
      // exist if the component was exported with `export default`,
      // otherwise fall back to module's root.
      componentConfig.default || componentConfig,
    );
  });
}
