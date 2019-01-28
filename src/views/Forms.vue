<template>
    <div>
        <pre>Dynamic Forms using vue-form-json-schema plugin</pre>
        <dynamic-form :form-data="formData"
                      :form-schema="formSchema"
                      :ui-schema="uiSchema"
                      :validation-errors="validationErrors"
                      @change="updateFormData"></dynamic-form>

    </div>
</template>

<script>
import DynamicForm from '@/components/dynamicForm.vue';

export default {
  name: 'forms',
  components: {
    DynamicForm,
  },
  data() {
    return {
      formData: {
        firstName: 'Prefilled',
      },
      formSchema: {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            minLength: 3,
          },
        },
        required: ['firstName'],
      },
      uiSchema: [
        {
          component: 'sf-default-input',
          disabled: false,
          hint: 'Name should be minimum 3 char',
          key: 'firstName',
          label: 'First Name',
          placeholder: 'First Name',
          testId: 'test-input-id',
        },
      ],
      validationErrors: [],
    };
  },
  methods: {
    updateFormData(value) {
      // we have to manually handle the updated form data since there
      // is no two-way data binding set into place. The most trivial
      // handling would be to just update the original formData object.
      // In other scenarios we might want to trigger a store action
      // that updates the data at a central place.

      this.$set(this, 'formData', value);
    },
  },
};
</script>
