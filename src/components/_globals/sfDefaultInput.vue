<template>
    <div class=""
         :class="{'is-invalid': dirty && !!error}">
        <label for="default" class="lead">{{label}}</label>
        <input type="text"
               class=""
               :disabled="disabled"
               :value="value"
               :placeholder="placeholder"
               @input="onInput" />
        <div>
          <p v-show="dirty && error">{{ error }}</p>
          <p v-if="hint">{{ hint }}</p>
        </div>
        error| {{error}}
  </div>
</template>

<script>


export default {
  name: 'sf-default-input',
  data() {
    return {
      dirty: false,
      error: '',
    };
  },
  model: {
    prop: 'value',
    event: 'input',
  },
  props: {
    disabled: Boolean,
    errorObserver: Function,
    hint: String,
    label: String,
    placeholder: String,
    required: Boolean,
    value: String,
  },
  created() {
    this.errorObserver((errorMessage, force) => {
      console.log('erroMessage', errorMessage);
      console.log('force', force)
      if (force) {
        this.dirty = true;
      }
      this.error = errorMessage;
    });
  },
  methods: {
    onInput(newValue) {
      console.debug('sfDefaultInput::onInput()', newValue);
      this.dirty = true;
      this.$emit('input', newValue);
    },
  },

};
</script>
