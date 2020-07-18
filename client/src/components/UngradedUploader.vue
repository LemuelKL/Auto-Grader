<template>
  <div class="file-upload">
    <v-card outlined class="pa-3">
      <v-card-title>Import Ungraded Paper</v-card-title>
      <v-card-text>
        <v-form v-model="valid">
          <v-row no-gutters class="pa-3">
            <v-file-input
              outlined
              v-model="paper"
              accept=".pdf"
              type="file"
              label="PDF Input"
              hide-details
            ></v-file-input>
            <v-btn @click="uploadPaper" class="ml-5" :disabled="!this.paper || !valid">Import Paper</v-btn>
          </v-row>

          <v-row v-if="responseData" no-gutters class="px-3">
            <v-alert dense text type="success">{{ responseData.msg }}</v-alert>
          </v-row>

          <v-row v-if="responseData" no-gutters class="pa-0">
            <v-card outlined class="ma-3">
              <v-card-title>Paper Info</v-card-title>
              <v-divider></v-divider>

              <v-card-text>
                <div>
                  {{responseData.paperInfo.name}}
                  <v-divider class="mx-2" vertical style="display: inline;"></v-divider>
                  {{responseData.paperInfo.id}}
                </div>
                <div>{{responseData.paperInfo.numPages}} pages</div>
                <div>{{responseData.paperInfo.questions.length}} questions</div>
              </v-card-text>
            </v-card>

            <v-card outlined class="ma-3">
              <v-card-title>Questions</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-row
                  no-gutters
                  v-for="question in responseData.paperInfo.questions"
                  :key="question.name"
                >
                  <span>{{question.name}}</span>
                  <v-spacer></v-spacer>
                  <span>{{question.score}}</span>
                </v-row>
              </v-card-text>
            </v-card>

            <v-card outlined class="ma-3">
              <v-card-title>Candidates</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <div
                  v-for="candidate in responseData.paperInfo.expectedCandidates"
                  :key="candidate"
                  :class="`${candidateColor(candidate)}--text`"
                >{{candidate}}</div>
              </v-card-text>
            </v-card>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      paper: null,
      rules: {
        required: value => !!value || "Required",
        counter2: value => value.length == 2 || "Exactly 2 characters",
        counter4: value => value.length == 4 || "Exactly 4 characters",
        numerical: value => !isNaN(value) || "Only numbers"
      },
      valid: false,

      responseData: null
    };
  },
  methods: {
    uploadPaper() {
      const formData = new FormData();
      formData.append("pdf", this.paper);

      axios
        .post("http://localhost:3000/papers/ungraded", formData)
        .then(res => {
          this.responseData = res.data;
        })
        .catch(err => {
          this.responseData = err;
        });
    },
    candidateColor(candidate) {
      if (
        this.responseData.paperInfo.thisLackedCandidates.indexOf(candidate) ==
        -1
      ) {
        // Green
        return "green";
      } else {
        // Red
        return "red";
      }
    }
  }
};
</script>
