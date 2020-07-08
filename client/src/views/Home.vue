<template>
  <div>
    <v-container>
      <v-row>
        <v-card v-for="card in cards" :key="card.id" width='350'>
          <v-card-title>
            {{ card.name }}
          </v-card-title>
          <v-card-subtitle>
            {{ card.id }}
          </v-card-subtitle>
          <v-card-text>
            <p class="font-weight-bold">Normal weight text.</p>
          </v-card-text>
        </v-card>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'Home',

  data () {
    return {
      cards: [
        {
          id: 'df5e7',
          name: 'S5 Test 10',

        }
      ]
    }
  }
}
</script>
