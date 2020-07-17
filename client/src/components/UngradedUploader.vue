<template>
  <div class="file-upload">
    <v-card outlined class="pa-3">
      <v-card-title>
        Import Paper for Grading
      </v-card-title>
      <v-form v-model="valid">
        <v-row no-gutters>
          <v-file-input outlined v-model="paper" accept=".pdf" type="file" label="PDF Input"></v-file-input>
        </v-row>
        <v-row no-gutters class="pl-5 pt-5">
          <v-btn
            @click="uploadPaper"
            class="ml-3"
            :disabled="!this.paper || !valid"
          >
            Import Paper
          </v-btn>
        </v-row>
        <v-row no-gutters class="pl-5 pt-5">
          <v-card class="ml-3" outlined v-if="responseData">
            <v-card-subtitle>
              {{responseData.paperInfo.paperId}}
            </v-card-subtitle>
            <v-card-subtitle v-for="candidates in responseData.paperInfo.candidates" :key="candidates" class="pt-1 pb-1">
              {{candidates}}
            </v-card-subtitle>
          </v-card>
        </v-row>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data () {
    return {
      paper: null,
      rules: {
        required: value => !!value || 'Required',
        counter2: value => value.length == 2 || 'Exactly 2 characters',
        counter4: value => value.length == 4 || 'Exactly 4 characters',
        numerical: value => !isNaN(value) || 'Only numbers'
      },
      valid: false,

      responseData: null
    }
  },
  methods: {
    uploadPaper() {
      const formData = new FormData()
      formData.append("pdf", this.paper)

      axios
        .post("http://localhost:3000/papers/ungraded", formData)
        .then(res => {
          this.responseData = res.data
        })
        .catch(err => {
          this.responseData = err
        })
    }
  },
}
</script>
