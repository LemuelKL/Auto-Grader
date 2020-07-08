<template>
  <v-container>
    <v-row justify="center" align="center">
      <v-col cols="4">
        <v-card outlined width="auto" class="ml-5">
          <v-card-text class="pa-0">
            <v-row>
              <v-dialog v-model="createDialog" max-width="290">
                <v-card>
                  <v-card-title>New Question</v-card-title>
                  <v-card-text class="pb-0">
                    <v-text-field class="ma-2" hide-details dense outlined label="Name" v-model="newQuestionName" :placeholder="`${numQuestions + 1}`"></v-text-field>
                    <v-text-field class="ma-2" hide-details dense outlined label="Score" v-model="newQuestionScore"></v-text-field>
                  </v-card-text>
                  <v-card-actions>
                    <p>{{ createDialogMsg }}</p>
                    <v-spacer></v-spacer>
                    <v-btn text class="mr-3" @click="newQuestion(newQuestionName, newQuestionScore)">Submit</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-row>
            <v-row no-gutters>
              <v-card outlined class="ma-1 pa-0" width="100%">
                <v-card-text class="text-center">
                  <v-btn icon large @click.stop="createDialog = true">
                    <v-icon>mdi-plus-box</v-icon>
                  </v-btn>
                  Number of questions: {{ numQuestions }}
                </v-card-text>
              </v-card>
            </v-row>
            <v-row justify="center" align="center">
              <v-btn
                fab
                small
                class="ma-1"
                @click.stop="previousQuestion"
                v-hotkey="{ left: this.previousQuestion }"
              >
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <v-card-title class="justify-center" v-if="questionIndex >= 0">
                {{
                questions[questionIndex].name
                }}
              </v-card-title>
              <v-card-title class="justify-center" v-else>-</v-card-title>
              <v-btn
                fab
                small
                class="ma-1"
                @click.stop="nextQuestion"
                v-hotkey="{ right: this.nextQuestion }"
              >
                <v-icon>mdi-arrow-right</v-icon>
              </v-btn>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="8">
        <v-card outlined>
          <v-card-text>
            <v-row no-gutters>
              <v-chip
                class="ml-1"
                v-for="(name, i) in questionNames"
                :key="name"
                :value="name"
                :color="i == questionIndex ? 'yellow' : ''"
              >{{ name }}</v-chip>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row no-gutters class="pa-4">
      <v-col cols="6">
        <v-btn tile small class="ma-1" @click="reqeustPreviousPage">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        P. {{page}}
        <v-btn tile small class="ma-1" @click="reqeustNextPage">
          <v-icon>mdi-arrow-right</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="6" class="justify-end">
        <div class="zoomers">
          <v-btn tile small class="ma-1" @click="zoom('+')">
            <v-icon>mdi-magnify-plus</v-icon>
          </v-btn>
          <v-btn tile small class="ma-1" @click="zoom('-')">
            <v-icon>mdi-magnify-minus</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>
    {{lockQuestion}}
    <v-row no-gutters class="pl-5 pt-0" justify="center" align="center">
      <v-col cols="12">
        <clipper-basic
          class="my-clipper"
          ref="clipper"
          :src="src"
          :style="`maxWidth: ${maxWidth}%`"
          @load="loadClipper"
        >
          <div class="placeholder" slot="placeholder">No image</div>
        </clipper-basic>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import _ from "lodash";
export default {
  props: {
    src: String,
    page: Number,
    numPages: Number,
    imgW: Number,
    imgH: Number,
    questions: Array
  },
  data() {
    return {
      maxWidth: 100,

      questionIndex: -1,
      //questions: [],

      createDialog: false,
      newQuestionName: "",  // tmp holder
      newQuestionScore: 0, // tmp holder
      createDialogMsg: "",

      lockQuestion: false
    };
  },
  computed: {
    numQuestions: function() {
      return this.questions.length;
    },
    questionNames: function() {
      return this.questions.map(el => el.name);
    }
  },
  methods: {
    updateQuestion() {
      const pos = this.$refs.clipper.getDrawPos().pos;
      this.questions[this.questionIndex].pos = pos;
      this.questions[this.questionIndex].page = this.page;
    },
    throttledUpdateQuestion: _.throttle(function() {
      this.updateQuestion();
    }, 30),
    newQuestion(name, score) {
      const res = this.questions.find(el => el.name == name);
      if (res != undefined) {
        this.createDialogMsg = "Question with identical name already exists";
        return;
      }
      this.questions.push({
        order: this.numQuestions + 1, // Starts at 1
        score: score,
        name: name,
        pos: {},
        page: this.page
      });
      this.createDialogMsg = "";
      this.newQuestionName = "";
      this.createDialog = false;
      this.questionIndex++;
    },

    previousQuestion() {
      if (this.questionIndex > 0) {
        this.questionIndex--;
      }
    },
    nextQuestion() {
      if (this.questionIndex < this.numQuestions - 1) {
        this.questionIndex++;
      }
    },
    setClipper() {
      const pos = this.questions[this.questionIndex].pos;
      this.$refs.clipper.setTL$.next({
        left: (pos.sx / this.imgW) * 100,
        top: (pos.sy / this.imgH) * 100
      });
      this.$refs.clipper.setWH$.next({
        width: (pos.swidth / this.imgW) * 100,
        height: (pos.sheight / this.imgH) * 100
      });
    },
    zoom(mode) {
      if (mode == "+") if (this.maxWidth < 100) this.maxWidth += 10;
      if (mode == "-") if (this.maxWidth > 0) this.maxWidth -= 10;
    },
    // Do range validation in parent, not here.
    reqeustPreviousPage() {
      if (this.page != 1) {
        this.lockQuestion = true;
        this.$emit("requestPage", "-");
      }
    },
    reqeustNextPage() {
      if (this.page != this.numPages) {
        this.lockQuestion = true;
        this.$emit("requestPage", "+");
      }
    },
    loadClipper() {
      this.setClipper();
      this.lockQuestion = false;
    }
  },
  watch: {
    questionIndex: function(newValue, oldValue) {
      if (!(oldValue == -1 && newValue == 0))
        // Special case
        this.lockQuestion = true;
      const page = this.questions[this.questionIndex].page;
      if (page != this.page) {
        this.$emit("requestPage", page);
        // When parent finishes updating page to prop, loadClipper () executes
      } else {
        // Otherwise, manually calling required.
        this.loadClipper();
      }
    },
    createDialog: function (val) {
      if (!val) {
        this.createDialogMsg = ''
      }
    }
  },
  mounted() {
    // This subscribe event got fired when page changes,
    // we don't want this, so the lockQuestion is implemented.
    this.$refs.clipper.onChange$.subscribe(() => {
      if (!this.lockQuestion) {
        if (this.questionIndex >= 0) {
          this.throttledUpdateQuestion();
        }
      }
    });
  }
};
</script>

<style scoped>
.my-clipper {
  width: 100%;
}

.placeholder {
  text-align: center;
  padding: 20px;
  background-color: lightgray;
}
.zoomers {
  text-align: right;
}
</style>
