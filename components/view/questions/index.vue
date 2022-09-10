<template>
  <div class="questions white">
    <div class="questions__row row">
      <div
        v-for="(question, index) in questions"
        :key="index"
        class="questions__col"
      >
        <div class="questions__item">
          <div class="questions__name font-lg fw-500">
            <span>0{{ index + 1 }}. </span>{{ question.title }}
          </div>
          <div class="questions__description font-md">
            {{ question.description }}
          </div>
        </div>
      </div>
    </div>
    <img
      class="questions__img-bg"
      src="@/static/astronaut.png"
      alt="astronaut"
    />
  </div>
</template>
<script>
export default {
  data() {
    return {
      questions: [
        {
          title: 'How to participate in Rocket Science?',
          description: `To participate in RS, you need to connect to the site using Wallet Connect by selecting your wallet from the list. The site is running on the BSC network. In the My Packages section, enter the amount of your investment and click the Invest button, congratulations, you're on board!`,
        },
        {
          title: 'What is a ‘verified and audited smartcontract’?',
          description:
            'To provide the most transparency and trust, the Rocket Science smart contract was deployed & verified in the BSC network and passed a Certik security audit - the most trusted provider of blockchain and smart contract audits.',
        },
        {
          title: 'How much can I earn?',
          description:
            'By investing with RS you will earn 15% dividends daily. The duration of each package is 15 days, which will eventually allow you to earn a 225% profit, which includes your initial investment. Each of your packages has its own timer that will complete automatically after 15 days.',
        },
        {
          title: 'How often can I withdraw my profit?',
          description:
            'You can collect your available dividends at any time, there are no limits, however, always consider the BSC gas fee that will be deducted from your wallet with each request. All operations are conducted by a smart contract and cannot be canceled or changed.',
        },
        {
          title: 'How many packages can I open? Is there any limit?',
          description:
            'There is no limit on the number of active packages, this is implemented to allow investors to re-compound daily dividends, thereby increasing their final profit.',
        },
        {
          title:
            'Whats the idea behind this, and what’s the developers interest?',
          description:
            'With a reasonable use of the RS investment project, it can exist indefinitely, bringing constant profit to both small and large investors. The team behind this project will receive a 10% dev fee of all investments to provide the stable operation of the site, as well as conduct PR campaigns to ensure its maximum viability and sustainability.',
        },
      ],
    };
  },
};
</script>
<style scoped lang="scss" src="./index.scss"></style>
