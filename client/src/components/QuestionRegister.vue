<template>
  <v-container>
    <v-row no-gutters justify="center" align="center">
      <v-col cols="8">
        <v-card outlined>
          <v-card-text>
            <v-row no-gutters>
              <v-btn
                fab
                small
                class="ma-1"
                @click.stop="previousQuestion"
                v-hotkey="{ left: this.previousQuestion }"
              >
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <v-btn
                fab
                small
                class="ma-1"
                @click.stop="nextQuestion"
                v-hotkey="{ right: this.nextQuestion }"
              >
                <v-icon>mdi-arrow-right</v-icon>
              </v-btn>
              <v-btn fab small class="ma-1" @click.stop="createDialog = true">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
              <span class="ma-1">Total: {{ numQuestions }}</span>

              <v-chip
                class="ma-1"
                v-for="(name, i) in questionNames"
                :key="name"
                :value="name"
                :color="i == questionIndex ? 'yellow' : ''"
              >{{ name }}</v-chip>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="3" offset="1">
        <v-card outlined>
          <v-card-text>
            <v-row no-gutters>
              <v-btn fab small class="ma-1" @click="reqeustPreviousPage">
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <v-btn fab small class="ma-1" @click="reqeustNextPage">
                <v-icon>mdi-arrow-right</v-icon>
              </v-btn>
              <span>P. {{page}}</span>
              <v-spacer></v-spacer>
              <v-divider vertical></v-divider>
              <v-spacer></v-spacer>
              <span>{{maxWidth}}%</span>
              <v-btn fab small class="ma-1" @click="zoom('+')">
                <v-icon>mdi-magnify-plus</v-icon>
              </v-btn>
              <v-btn fab small class="ma-1" @click="zoom('-')">
                <v-icon>mdi-magnify-minus</v-icon>
              </v-btn>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    Capturing clipper: {{!lockQuestion}}
    <v-row no-gutters justify="center" align="center">
      <v-col cols="12">
        <clipper-basic
          class="my-clipper"
          ref="clipper"
          :src="src"
          :style="`maxWidth: ${maxWidth}%`"
          @load="loadClipper"
        >
          <div class="placeholder" slot="placeholder">Awaiting input</div>
        </clipper-basic>
      </v-col>
    </v-row>

    <question-create-dialog
      :show.sync="createDialog"
      :existingQuestions="questions"
      @questionAdded="newQuestion"
    ></question-create-dialog>
  </v-container>
</template>

<script>
import _ from "lodash";
import QuestionCreateDialog from "./QuestionCreateDialog";
export default {
  components: {
    "question-create-dialog": QuestionCreateDialog
  },
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

      createDialog: false,

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
      this.questions.push({
        order: this.numQuestions + 1, // Starts at 1
        score: score,
        name: name,
        pos: {},
        page: this.page
      });
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
      if (mode == "-") if (this.maxWidth > 10) this.maxWidth -= 10;
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
    createDialog: function(val) {
      if (!val) {
        this.createDialogMsg = "";
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
