<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api';

export default defineComponent({
  setup() {
    return {};
  },
});
</script>

<template>
  <section class="packages">
    <div class="container">
      <div class="packages__row">
        <div class="packages__left">
          <img src="@/static/rocket.png" alt="rocket" />
        </div>
        <div class="packages__right white">
          <h2>My Packages</h2>
          <div class="slogan">
            Invest and launch the rocket to receive <span>15%</span> daily
            profit, <span>225%</span> in total, multiply your funds in just
            <span>15</span> days.
          </div>
          <CalcInvest />
        </div>
      </div>

      <Investments />
      <Card />
    </div>
  </section>
</template>
<style lang="scss" src="./index.scss" scoped />
