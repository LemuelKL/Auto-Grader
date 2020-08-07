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
        {{`${this.graded?'Graded':'NOT Graded'}`}}
        <v-divider vertical class="mx-2"></v-divider>
        <v-btn elevation="0" small @click="previousCandidate">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div class="mx-1"></div>
        <v-btn elevation="0" small @click="nextCandidate">
          <v-icon>mdi-arrow-right</v-icon>
        </v-btn>
      </v-row>
      <v-divider class="my-1"></v-divider>
      <v-row no-gutters align="center">
        <v-chip-group
          :value="grading.score"
          @change="updateScore($event)"
          active-class="primary"
          mandatory
        >
          <v-chip v-for="score in scoreChips" :key="score" :value="score">{{ score }}</v-chip>
        </v-chip-group>
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
      <v-alert
        text
        dense
        :type="submissionResultType"
        transition="slide-x-transition"
        :value="submissionResultAlert"
        class="mb-0 ml-1"
      >{{submissionResultText}}</v-alert>
    </v-card-actions>
  </v-card>
</template>

<script>
import { axiosInstance } from './../../api/api.js'
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
      preventSubmission: false,

      submissionResultText: "",
      submissionResultAlert: false,
      submissionResultType: "success",
    };
  },
  computed: {
    scoreChips() {
      return [...Array(this.questionScore + 1).keys()];
    },
    defaultGrading() {
      return {
        presetRemark: [],
        candidate: this.candidate.pyccode,
        paperId: this.paperId,
        questionName: this.questionName,
        customRemark: "",
        score: 0,
      };
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
      this.candidate = _.cloneDeep(this.candidates[this.candidateIndex]);
      this.$emit("candidate-updated", this.candidates[this.candidateIndex]);
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
        axiosInstance
          .get(
            `/presets/paper/${this.paperId}/question/${this.questionName}`
          )
          .then((response) => response.data)
          .then((data) => {
            this.presets = _.cloneDeep(data);
          });
      }
    },
    fetchGrading() {
      if (!!this.paperId && !!this.questionName && !!this.candidate.pyccode) {
        axiosInstance
          .get(
            `/gradings/${this.paperId}/${this.questionName}/${this.candidate.pyccode}`
          )
          .then((response) => response.data)
          .then((data) => {
            this.preventSubmission = true;
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
    debounceSubmitGrading: _.debounce(function () {
      this.submitGrading();
    }, 500),
    submitGrading() {
      if (this.preventSubmission) return (this.preventSubmission = false);
      // Called when Update as well
      axiosInstance
        .put("/gradings", this.grading)
        .then(() => {
          const drawingBase64 = this.$parent.$refs.tuiImageEditor.invoke(
            "toDataURL"
          );
          axiosInstance
            .put(
              `/gradingImages/${this.grading.paperId}/${this.grading.questionName}/${this.grading.candidate}`,
              { image: drawingBase64 }
            )
            .then((res) => {
              if (res.status == 200) {
                this.submissionResultAlert = "success";
                this.submissionResultText = "Grading saved on DB.";
                this.submissionResultAlert = true;
                setTimeout(() => {
                  this.submissionResultAlert = false;
                }, 1000);
                if (
                  _.isEqual(res.data, JSON.parse(JSON.stringify(this.grading)))
                ) {
                  this.graded = true;
                }
              }
            });
        })
        .catch((err) => {
          console.error(err);
          this.submissionResultAlert = "error";
          this.submissionResultText = "Error occured.";
          this.submissionResultAlert = true;
          setTimeout(() => {
            this.submissionResultAlert = false;
          }, 1000);
        });
    },
  },

  watch: {
    candidate: "fetchGrading",
    questionName: ["fetchGrading", "fetchPresets"],
    candidateIndex() {
      this.updateCandidate();
    },
    grading: { handler: "debounceSubmitGrading", deep: true },
  },
};
</script>