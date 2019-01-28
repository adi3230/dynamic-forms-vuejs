<template>
  <json-schema-form
    class="schema-form"
    :model="formData"
    :schema="formSchema"
    :ui-schema="generatedUiSchema"
    :options="{
      ajv: {
        // configuration for the validation library goes here
      },
      allowInvalidModel: true,
      validate: true,
      validateOnLoad: true
    }"
    @change="onChange"
    @state-change="onStateChange"
    @validated="onValidityChange">
  </json-schema-form>
</template>

<script>
import VueFormJsonSchema from 'vue-form-json-schema';

export default {
  name: 'dynamicForm',
  components: {
    'json-schema-form': VueFormJsonSchema,
  },
  props: {
    formData: Object,
    formSchema: Object,
    uiSchema: Array,
    validationErrors: Array,
  },
  data() {
    return {
      errorCallbackList: {},
      formIsValid: true,
    };
  },
  computed: {
    generatedUiSchema() {
      return this.generateUiSchema(this.uiSchema);
    },
  },
  methods: {
    /**
     * Generates a valid UI Schema for the json schema form library.
     *
     * @param {object} inputSchema
     */
    generateUiSchema(inputSchema) {
      return inputSchema.map(field => ({
        component: field.component,
        model: field.key,
        fieldOptions: this.getFieldOptions(field),
      }));
    },
    /**
     * The field options are used to render components with Vue's render
     * function. The full API is described in the Vue documentation.
     *
     * @param {object} field DCP custom form field definition
     * @param {string} key set if custom key must be used (e.g. for nested objects)
     * @param {boolean} required set the field option required if !== undefined
     *
     * @see: https://vuejs.org/v2/guide/render-function.html#The-Data-Object-In-Depth
     */
    getFieldOptions(field, key, required) {
        console.log('key', key);
        console.log('field.key', field.key);
      const fieldOptions = {
        props: {
          defaultOption: field.defaultOption,
          disabled: field.disabled,

          // the form is reloaded when props are changing because
          // of a watcher in the schema form library. So to handle
          // errors, we have to register a callback, that triggers
          // the error within the form field.

          errorObserver: this.setErrorCallback(key || field.key),
          formatting: field.formatting,
          heading: field.heading,
          hint: field.hint,
          label: field.label,
          options: field.options,
          placeholder: field.placeholder,
        },
        on: ['input'],
      };

      // only set the required property if it is explicitly given
      if (required !== undefined) {
        fieldOptions.props.required = required;
      }

      return fieldOptions;
    },
    /**
     * The callback from the json schema form library that is triggered, when
     * changes in the form data have been made.
     *
     * @param {object} value
     */
    onChange(value) {
      console.debug('dynamicForm::onChange()', value.firstName);
      this.$parent.$emit('change', value);
    },
    /**
     * Every time the state of the form object is changed, this callback is
     * triggered. The state object contains all information on form validations
     * and modified fields and can be used to extract the validation errors.
     *
     * @param {object} state
     */
    onStateChange(state) {
      if (state.vfjsFieldsActiveModels) {
        state.vfjsFieldsActiveModels.forEach((fieldName) => {
          const fullDataPath = `.${fieldName}`;
          const dataPathSegments = fieldName.split('.');
          const parentDataPath = dataPathSegments.length > 1 ? `.${dataPathSegments[0]}` : '';
          const fieldKey = dataPathSegments[dataPathSegments.length - 1];

          const fieldError = state.vfjsErrors.filter((error) => {
            const fieldIsRequiredAndMissing = error.keyword === 'required'
              && error.dataPath === parentDataPath
              && error.params.missingProperty === fieldKey;
            const fieldDataIsInvalid = error.dataPath === fullDataPath;

            return fieldIsRequiredAndMissing || fieldDataIsInvalid;
          })[0];

          if (fieldError) {
            if (this.errorCallbackList[fieldName]) {
              // we only show the first error message to the user
              // instead of showing all errors at once
              this.errorCallbackList[fieldName](fieldError.message);
            }
          } else {
            const fieldHasBeenModified = !!state[fieldName];

            if (fieldHasBeenModified) {
              // reset error message
              this.errorCallbackList[fieldName]('');
            }
          }
        });
      }
    },
    onValidityChange(isValid) {
      if (this.formIsValid !== isValid) {
        console.debug('Form valididty changed', isValid);
        this.formIsValid = isValid;
      }
    },
    /**
     * Every field must register an error callback in its created lifecycle
     * hook to allow the form component to render error messages on its fields.
     *
     * @param {string} fieldName
     */
    setErrorCallback(fieldName) {
      const vm = this;
      return (callback) => {
        vm.errorCallbackList[fieldName] = callback;
      };
    },
  },
  watch: {
    /**
     * This watcher is triggered, when the validationErrors array is changed
     * from the parent component indicating that some backend validation errors
     * have been added.
     *
     * @param {array} newValidationErrors
     * @param {array} oldValidationErrors
     */
    validationErrors(newValidationErrors, oldValidationErrors) {
      console.log('newValidationErrors', newValidationErrors);
      console.log('oldValidationErrors', oldValidationErrors);
      if (newValidationErrors.length) {
        this.onValidityChange(false);
      }

      // reset old validation errors
      if (oldValidationErrors && oldValidationErrors.length) {
        oldValidationErrors.forEach((oldValidationError) => {
          if (
            !newValidationErrors.some(newValidationError => newValidationError.subject === oldValidationError.subject)
            && this.errorCallbackList[oldValidationError.subject]
          ) {
            this.errorCallbackList[oldValidationError.subject]('');
          }
        });
      }

      // set new validation errors
      newValidationErrors.forEach((newValidationError) => {
        if (this.errorCallbackList[newValidationError.subject]) {
          this.errorCallbackList[newValidationError.subject](newValidationError.message, true);
        }
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.schema-form{
    max-width: 50%;
}
</style>
