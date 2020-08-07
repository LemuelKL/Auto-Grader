<template>
  <v-container>
    <v-row no-gutters>
      <v-col cols="12">
        <v-card outlined>
          <v-card-text>
            <v-row>
              <v-col>
                <v-treeview
                  v-model="candidates"
                  :items="students"
                  item-key="_id"
                  item-children="data"
                  item-text="label"
                  selection-type="leaf"
                  selectable
                  return-object
                ></v-treeview>
              </v-col>
              <v-divider vertical></v-divider>
              <v-col class="pa-6" cols="6">
                <template v-if="!candidates.length"><span class="font-weight-bold">No students selected.</span></template>
                <template v-else>
                  <span class="font-weight-bold">{{ candidates.length }} candidates.</span>
                  <div v-for="node in candidates" :key="node._id">{{ node.label }}</div>
                </template>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { axiosInstance } from './../api/api.js'
export default {
  data() {
    return {
      candidates: [],
      students: [
        {
          _id: "",
          data: [
            {
              _id: "",
              pyccode: "",
              ename: "",
              cname: "",
              class: "",
              classNo: "",
              __v: 0
            }
          ]
        }
      ]
    };
  },

  watch: {
    candidates: function (val) {
      this.$emit('candidatesChanged', val)
    }
  },

  created () {
    axiosInstance.get('/students/grouped/class').then(response => response.data).then(data => {
      var raw = data
      raw.forEach(el => {
        el.label = el._id
        el.data.forEach(el => {
          el.label = `${el.class} (${el.classNo}) - ${el.pyccode} - ${el.cname} ${el.ename}`
        })
      });
      this.students = raw
    })
  }
};
</script>