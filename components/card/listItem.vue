<script lang="ts">
import { computed, defineComponent, ref, watch } from '@nuxtjs/composition-api';
import { getFormatDate } from '~/utils/index';

export default defineComponent({
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const dataProps = ref(props.data);

    watch(
      () => props.data,
      (state, _prevState) => {
        dataProps.value = state;
      }
    );

    const formatValueDate = computed(() =>
      dataProps.value?.key
        ? getFormatDate(new Date(dataProps.value.value), `dd.LL.yyyy`)
        : dataProps.value.value
    );

    const formatValueTime = computed(() =>
      dataProps.value?.key
        ? getFormatDate(new Date(dataProps.value.value), `HH:mm:ss`)
        : dataProps.value.value
    );

    return {
      formatValueDate,
      formatValueTime,
      dataProps,
    };
  },
});
</script>

<template>
  <div class="card-data-list__wrapper" :data-key="dataProps.key">
    <div class="card-data-list__name">{{ dataProps.name }}:</div>
    <div class="card-data-list__data">
      <template v-if="dataProps.key === 'timestamp'">
        <div class="card-data-list__value card-data-list__value--timestamp">
          <span>{{ formatValueDate }}</span>
          <span>{{ formatValueTime }}</span>
        </div>
      </template>
      <template v-else-if="dataProps.сoin">
        <div class="card-data-list__value">
          <span>{{ dataProps.value }} BNB</span>
          <span class="card-data-list__logo">
            <SvgIcon name="bnb-logo" />
          </span>
        </div>
      </template>
      <template v-else>
        <div class="card-data-list__value">
          <span>{{ dataProps.value }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" src="./index.scss" scoped></style>
