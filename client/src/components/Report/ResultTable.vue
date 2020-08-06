<template>
  <v-card outlined>
    <v-row no-gutters align="center">
      <v-col cols="2">
        <v-card-title>Result</v-card-title>
      </v-col>
      <v-col offset="4" cols="4" class="pr-5">
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="auto">
        <v-select v-model="paperId" :items="papers" item-value="id" item-text="name" hide-details></v-select>
      </v-col>
    </v-row>

    <v-divider></v-divider>
    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="result"
        :items-per-page="35"
        :search="search"
        class="elevation-1"
        dense
        hide-default-footer
      ></v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      papers: [],
      paperId: "",
      search: "",
      headers: [
        // To be dynamically loaded
      ],
      result: [
        // Row by row, one candidate per row
      ],
    };
  },
  watch: {
    paperId(val) {
      // Populate table headers
      const paper = this.papers.find((p) => {
        return p.id === val;
      });

      this.headers = [];
      this.headers.push({
        text: "Candidate",
        align: "start",
        sortable: false,
        value: "candidateId",
        divider: true,
      });

      paper.questions.forEach((q) => {
        this.headers.push({
          text: `${q.name} --- [ ${q.score} ]`,
          value: q.name,
          divider: true,
        });
      });

      this.result = [];
      paper.candidates.forEach((c) => {
        this.result.push({ candidateId: c });
      });

      // Fetch grading scores and populate this.result
      axios
        .get(`http://localhost:3000/gradings/${this.paperId}`)
        .then((res) => res.data)
        .then((data) => {
          data.forEach((d) => {
            this.$set(
              this.result.find((r) => {
                return r.candidateId === d.candidate;
              }),
              d.questionName,
              d.score
            );
            this.$emit('report-changed', this.headers, this.result)
          });
        });

      this.$emit('paper-changed', paper.name)
    },

  },
  created() {
    axios
      .get("http://localhost:3000/papers")
      .then((res) => res.data)
      .then((data) => {
        this.papers = data;
      });
  },
};
</script>