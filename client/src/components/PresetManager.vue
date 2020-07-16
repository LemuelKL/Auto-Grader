<template>
  <v-container fluid>
    <v-data-iterator
      :items="remarks"
      :items-per-page.sync="itemsPerPage"
      :page="page"
      :search="search"
      :sort-by="sortBy.toLowerCase()"
      :sort-desc="sortDesc"
      hide-default-footer
    >
      <template v-slot:header>
        <v-toolbar dark color="blue darken-3" class="mb-1">
          <v-text-field
            v-model="search"
            clearable
            flat
            solo-inverted
            hide-details
            prepend-inner-icon="mdi-magnify"
            label="Search"
          ></v-text-field>
          <template v-if="$vuetify.breakpoint.mdAndUp">
            <v-spacer></v-spacer>
            <v-select
              v-model="sortBy"
              flat
              solo-inverted
              hide-details
              :items="keys"
              prepend-inner-icon="mdi-magnify"
              label="Sort by"
            ></v-select>
            <v-spacer></v-spacer>
            <v-btn-toggle v-model="sortDesc" mandatory>
              <v-btn large depressed color="blue" :value="false">
                <v-icon>mdi-arrow-up</v-icon>
              </v-btn>
              <v-btn large depressed color="blue" :value="true">
                <v-icon>mdi-arrow-down</v-icon>
              </v-btn>
            </v-btn-toggle>
          </template>
        </v-toolbar>
      </template>

      <template v-slot:default="props">
        <v-row>
          <v-col v-for="(item, index) in props.items" :key="index" cols="12" sm="6" md="4" lg="3">
            <v-card>
              <v-card-title class="subheading font-weight-bold">{{ item.name }}</v-card-title>

              <v-divider></v-divider>

              <v-list dense>
                <v-list-item v-for="(key, index) in filteredKeys" :key="index">
                  <v-list-item-content :class="{ 'blue--text': sortBy === key }">{{ key }}:</v-list-item-content>
                  <v-list-item-content
                    class="align-end"
                    :class="{ 'blue--text': sortBy === key }"
                  >{{ item[key.toLowerCase()] }}</v-list-item-content>
                </v-list-item>
              </v-list>
              <v-card-actions>
                <v-btn text @click="editRemark(item._id)">Edit</v-btn>
                <v-btn text @click="deleteRemark(item._id)">Delete</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <template v-slot:footer>
        <v-row class="mt-2" align="center" justify="center">
          <span class="grey--text">Items per page</span>
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn dark text color="primary" class="ml-2" v-bind="attrs" v-on="on">
                {{ itemsPerPage }}
                <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(number, index) in itemsPerPageArray"
                :key="index"
                @click="updateItemsPerPage(number)"
              >
                <v-list-item-title>{{ number }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-spacer></v-spacer>

          <span class="mr-4 grey--text">Page {{ page }} of {{ numberOfPages }}</span>
          <v-btn fab dark color="blue darken-3" class="mr-1" @click="formerPage">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab dark color="blue darken-3" class="ml-1" @click="nextPage">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-row>
      </template>
    </v-data-iterator>
    <v-dialog v-model="editDialog" max-width="30%">
      <v-card>
        <v-card-title>Edit</v-card-title>
        <v-card-text>
          <v-text-field outlined label="Name" v-model="editedRemark.name"></v-text-field>
          <v-text-field outlined label="Description" v-model="editedRemark.description"></v-text-field>
          <v-row align="center" no-gutters>
            <v-checkbox v-model="paperSpecific" hide-details class="shrink mr-2 mt-0"></v-checkbox>
            <v-combobox
              :disabled="!paperSpecific"
              :label="`Paper Specific${paperSpecific?` - ${selectedPaper.id}`:''}`"
              :items="papers"
              item-text="name"
              item-value="id"
              v-model="selectedPaper"
            ></v-combobox>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn text @click="submitEditedRemark">Submit</v-btn>
          <v-spacer></v-spacer>
          <v-btn text @click="editDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>v

<script>
import axios from "axios";
export default {
  props: {
    papers: Array
  },
  data() {
    return {
      itemsPerPageArray: [4, 8, 12],
      search: "",
      filter: {},
      sortDesc: false,
      page: 1,
      itemsPerPage: 4,
      sortBy: "name",
      keys: ["Name", "Description", "Paper"],
      remarks: [],

      // Data of Edit Dialog
      editDialog: false,
      editedRemark: {},
      paperSpecific: false,
      selectedPaper: { name: "", id: "" }
    };
  },
  computed: {
    numberOfPages() {
      return Math.ceil(this.remarks.length / this.itemsPerPage);
    },
    filteredKeys() {
      return this.keys.filter(key => key !== `Name`);
    }
  },
  methods: {
    nextPage() {
      if (this.page + 1 <= this.numberOfPages) this.page += 1;
    },
    formerPage() {
      if (this.page - 1 >= 1) this.page -= 1;
    },
    updateItemsPerPage(number) {
      this.itemsPerPage = number;
    },
    fetchPaperNameById(paperId) {
      return new Promise((resolve, reject) => {
        axios
          .get(`http://localhost:3000/papers/${paperId}`)
          .then(response => response.data)
          .then(data => {
            resolve(data.name);
          })
          .catch(err => {
            console.error(err);
            reject();
          });
      });
    },
    fetchRemarks() {
      axios
        .get("http://localhost:3000/presets")
        .then(response => response.data)
        .then(async data => {
          this.remarks = [];
          for (let d of data) {
            var r = {
              name: "",
              description: "",
              paper: "",
              paperId: "",
              _id: ""
            };
            r.name = d.name;
            r.description = d.description;
            r._id = d._id;
            r.paperId = d.paperId;
            if (d.paperId != "") {
              r.paper = `${await this.fetchPaperNameById(d.paperId)} - ${
                d.paperId
              }`;
            }
            this.remarks.push(r);
          }
        });
    },
    editRemark(_id) {
      this.editDialog = true;
      this.editedRemark = this.remarks.find(r => r._id == _id);
      if (this.editedRemark.paperId != "") {
        this.selectedPaper = this.papers.find(
          p => p.id == this.editedRemark.paperId
        );
        this.paperSpecific = true;
      } else {
        this.paperSpecific = false;
      }
    },
    submitEditedRemark() {
      var update = {};
      update.name = this.editedRemark.name;
      update.description = this.editedRemark.description;
      if (this.paperSpecific) update.paperId = this.selectedPaper.id;
      else update.paperId = "";
      axios
        .put(`http://localhost:3000/presets/${this.editedRemark._id}`, update)
        .then(response => {
          if (response.status == 200) console.log("Good");
          this.fetchRemarks();
          this.editDialog = false;
        });
    },
    deleteRemark(_id) {
      axios.delete(`http://localhost:3000/presets/${_id}`).then(response => {
        if (response.status == 200) console.log("Good");
        this.fetchRemarks();
      });
    }
  },
  created() {
    this.fetchRemarks();
  }
};
</script>