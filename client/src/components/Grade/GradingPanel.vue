<template>
  <v-card outlined>
    <v-card-text>
      <v-row no-gutters class="font-weight-bold text--primary" align="center">
        <div>{{ candidate.class }}</div>
        <div class="ml-1">({{ candidate.classNo }})</div>
        <v-divider vertical class="mx-2"></v-divider>
        <div>{{ candidate.ename }}</div>
        <v-divider vertical class="mx-2"></v-divider>
        <div>{{ candidate.cname }}</div>
        <v-spacer></v-spacer>
        <v-btn elevation="0" small @click="previousCandidate">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div class="mx-1"></div>
        <v-btn elevation="0" small @click="nextCandidate">
          <v-icon>mdi-arrow-right</v-icon>
        </v-btn>
      </v-row>
      <v-divider class="my-1"></v-divider>
      <v-row no-gutters>
        <v-chip-group
          v-if="graded"
          :value="grading.score"
          @change="updateScore($event)"
          active-class="primary"
          mandatory
        >
          <v-chip v-for="score in scoreChips" :key="score" :value="score">{{ score }}</v-chip>
        </v-chip-group>
        <v-chip v-else>?</v-chip>
        <v-spacer></v-spacer>
      </v-row>
      <v-divider class="my-1"></v-divider>
      <v-row no-gutters>
        <v-col cols="6" class="pr-1">
          <v-select
            filled
            label="Tags"
            hide-details
            chips
            :items="presets"
            item-text="name"
            item-value="_id"
            :value="grading.presetRemark"
            @input="updateTags($event)"
            :return-object="false"
            multiple
            deletable-chips
            :menu-props="{ top: false, offsetY: true }"
          ></v-select>
        </v-col>
        <v-col cols="6" class="pl-1">
          <v-textarea
            filled
            label="Comments"
            hide-details
            :value="grading.customRemark"
            @input="updateComment($event)"
          ></v-textarea>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-btn
        elevation="0"
        dark
        :color="`${graded?'light-green':'green '}`"
        @click="submitGrading"
      >{{graded?'Update':'Submit'}}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import axios from "axios";
import _ from "lodash";
export default {
  props: {
    candidates: Array,
    paperId: String,
    questionName: String,
    questionScore: Number,
  },
  data() {
    return {
      candidateIndex: 0,
      candidate: { pyccode: "", name: "", class: "", classNo: "" },
      defaultGrading: {
        presetRemark: [],
        candidate: "",
        paperId: "",
        questionName: "",
        customRemark: "",
        score: 0,
      },
      grading: {
        presetRemark: [],
        candidate: "",
        paperId: "",
        questionName: "",
        customRemark: "",
        score: 0,
      },

      graded: false,

      presets: [],
    };
  },
  computed: {
    scoreChips() {
      return [...Array(this.questionScore + 1).keys()];
    },
  },
  methods: {
    previousCandidate() {
      if (this.candidateIndex > 0) {
        this.candidateIndex--;
      }
    },
    nextCandidate() {
      if (this.candidateIndex < this.candidates.length - 1) {
        this.candidateIndex++;
      }
    },
    updateCandidate() {
      this.candidate = this.candidates[this.candidateIndex];
      this.$emit('candidate-updated', this.candidates[this.candidateIndex])
    },
    updateTags(tags) {
      this.grading.presetRemark = _.cloneDeep(tags);
    },
    updateComment(comment) {
      this.$set(this.grading, "customRemark", comment);
    },
    updateScore(score) {
      this.$set(this.grading, "score", score);
    },

    fetchPresets() {
      if (!!this.paperId && !!this.questionName) {
        axios
        .get(`http://localhost:3000/presets/paper/${this.paperId}/question/${this.questionName}`)
        .then((response) => response.data)
        .then((data) => {
          this.presets = _.cloneDeep(data);
        });
      }
      
    },
    fetchGrading() {
      if (!!this.paperId && !!this.questionName && this.candidate.pyccode) {
        axios
          .get(
            `http://localhost:3000/gradings/${this.paperId}/${this.questionName}/${this.candidate.pyccode}`
          )
          .then((response) => response.data)
          .then((data) => {
            if (data != null) {
              this.grading = _.cloneDeep(data);
              this.graded = true;
            } else {
              this.grading = _.cloneDeep(this.defaultGrading);
              this.graded = false;
            }
          });
      }
    },
    submitGrading() {
      // Called when Update as well
      axios.put("http://localhost:3000/gradings", this.grading).catch((err) => {
        console.error(err);
      });
    },
  },

  watch: {
    candidate: "fetchGrading",
    questionName: ["fetchGrading","fetchPresets"],
    candidateIndex() {
      this.updateCandidate();
    },
    grading: { handler: "submitGrading", deep: true }, // TODO: add debounce
  },
};
</script>