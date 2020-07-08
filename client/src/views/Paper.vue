<template>
  <div>
    <v-container>
      <ungraded-uploader></ungraded-uploader>
      <paper-creator></paper-creator>
    </v-container>
  </div>
</template>

<script>
  import UngradedUploader from './../components/UngradedUploader'
  import PaperCreator from './../components/PaperCreator'
  export default {
    components: {
      'ungraded-uploader': UngradedUploader,
      'paper-creator': PaperCreator
    },
    data () {
      return {

      }
    },
  }

</script>