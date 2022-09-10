<script lang="ts">
import { defineComponent, ref, watch } from '@nuxtjs/composition-api';

interface Props {
  isLoading: boolean;
  isDisabled: boolean;
}

export default defineComponent({
  props: {
    isLoading: {
      type: Boolean,
      required: false,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props: Props, context) {
    const loadingProps = ref(props.isLoading);
    const disabledProps = ref(props.isDisabled);

    watch(
      () => props.isDisabled,
      (state, _prevState) => {
        disabledProps.value = state;
      }
    );

    watch(
      () => props.isLoading,
      (state, _prevState) => {
        loadingProps.value = state;
      }
    );

    const buttonHandler = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      context.emit('buttonHandler', e);
    };
    return {
      buttonHandler,
      loadingProps,
      disabledProps,
    };
  },
});
</script>

<template>
  <button
    class="btn"
    :disabled="disabledProps"
    @click="(event) => buttonHandler(event)"
  >
    <template v-if="loadingProps"> Loading ... </template>
    <template v-else>
      <slot></slot>
    </template>
  </button>
</template>

<style lang="scss" src="./button.scss"></style>
