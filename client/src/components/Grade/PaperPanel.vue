<template>
  <v-card outlined>
    <v-card-title>Paper Info</v-card-title>
    <v-card-text>
      <v-row no-gutters align="center">
        <v-select
          @input="handlePaperChanged($event)"
          hide-details
          outlined
          :menu-props="{ top: false, offsetY: true }"
          :items="papers"
          item-value="id"
          item-text="name"
          :return-object="false"
        ></v-select>
      </v-row>

      <v-row no-gutters align="start" class="mt-2">
        <v-col cols="12">
          <v-card outlined>
            <v-card-text v-if="paperId" class="font-weight-bold">
              <v-row no-gutters justify="center">
                <v-col cols="4">
                  <v-row no-guttes class="pl-2 pt-2 pr-2 pb-0 font-weight-bold">
                    ID:
                    <v-spacer></v-spacer>
                    {{ paperId }}
                  </v-row>
                  <v-row no-guttes class="pl-2 pt-2 pr-2 pb-0 font-weight-bold">
                    Candidates:
                    <v-spacer></v-spacer>
                    {{ numCandidates }}
                  </v-row>
                  <v-row no-guttes class="pl-2 pt-2 pr-2 pb-0 font-weight-bold">
                    Pages:
                    <v-spacer></v-spacer>
                    {{ numPages }}
                  </v-row>
                  <v-row no-guttes class="pl-2 pt-2 pr-2 pb-2 font-weight-bold">
                    Questions:
                    <v-spacer></v-spacer>
                    {{ numQuestions }}
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions>
              <v-row no-gutters align="center">
                <v-btn elevation="0" class="ma-2" @click="previousPage()">
                  <v-icon>mdi-arrow-left-thick</v-icon>
                </v-btn>
                <v-card outlined width="64" height="36">
                  <v-card-title class="pa-0 justify-center">{{page}}</v-card-title>
                </v-card>
                <v-btn elevation="0" class="ma-2" @click="nextPage()">
                  <v-icon>mdi-arrow-right-thick</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn elevation="0" class="ma-2" @click="zoomIn()">
                  <v-icon>mdi-magnify-plus</v-icon>
                </v-btn>
                <v-card outlined width="64" height="36">
                  <v-card-title class="pa-0 justify-center">{{`${zoom}%`}}</v-card-title>
                </v-card>
                <v-btn elevation="0" class="ma-2" @click="zoomOut()">
                  <v-icon>mdi-magnify-minus</v-icon>
                </v-btn>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";
export default {
  props: {
    page: Number,
    zoom: Number,
  },
  data() {
    return {
      papers: [],
      paperId: "",

      candidates: [],
      numPages: 0,
      questions: [],
    };
  },

  computed: {
    numCandidates: function () {
      return this.candidates.length;
    },
    numQuestions: function () {
      return this.questions.length;
    },
  },

  methods: {
    previousPage() {
      if (this.page > 1) {
        this.$emit("update:page", this.page - 1);
      }
    },
    nextPage() {
      if (this.page < this.numPages) {
        this.$emit("update:page", this.page + 1);
      }
    },
    zoomIn() {
      if (this.zoom < 250) this.zoom = this.zoom + 10;
      this.$emit("update:zoom", this.zoom);
    },
    zoomOut() {
      if (this.zoom > 10) this.zoom = this.zoom - 10;
      this.$emit("update:zoom", this.zoom);
    },

    handlePaperChanged(paperId) {
      this.paperId = paperId;
      this.$emit("paperChanged", this.paperId);
      this.fetchPaperDetails();
      this.fetchCandidates();
    },

    fetchPapers() {
      axios
        .get("http://localhost:3000/papers/ungraded")
        .then((response) => response.data)
        .then((data) => {
          for (let d of data) {
            axios
              .get(`http://localhost:3000/papers/${d}`)
              .then((response) => response.data)
              .then((data) => {
                this.papers.push(data);
              });
          }
        });
    },

    fetchPaperDetails() {
      axios
        .get(`http://localhost:3000/papers/${this.paperId}`)
        .then((response) => response.data)
        .then((data) => {
          this.candidates = data.candidates;
          this.numPages = data.numPages;
          this.questions = data.questions;
          this.$emit("questionsArrived", data.questions);
          this.$emit("updatePaperWidth", data.width);
        });
    },

    fetchCandidates() {
      axios
        .get(`http://localhost:3000/papers/ungraded/${this.paperId}/students`)
        .then((response) => response.data)
        .then((data) => {
          this.$emit("updateCandidates", data);
        });
    },
  },

  created() {
    this.fetchPapers();
  },
};
</script>