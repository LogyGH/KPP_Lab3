<template>
  <div id="app">
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
    />
    <!-- Шрифты картинок (fa-close, fa-plus)-->

    <h2>Список групп</h2>

    <div class="row">
      <div class="column" v-for="(group, key) in groups" :key="key">
        <div class="card">
          <h3>
            {{ group.name }}
            <button class="btn" @click="deleteGroup(key)">
              <i class="fa fa-close"></i>
            </button>
          </h3>

          <p v-for="(student, studentKey) in group.students" :key="studentKey">
            {{ student.name }}
            <button class="btn" @click="deleteStudent(key, studentKey)">
              <i class="fa fa-close"></i>
            </button>
          </p>

          <p>
            <input type="text" size="10" v-model="group.newStudent" />
            <button
              class="btnCreate"
              @click="createStudent(key, group.newStudent)"
            >
              <i class="fa fa-plus"></i>
            </button>
          </p>
        </div>
      </div>

      <div class="column">
        <div class="card">
          <input type="text" size="10" v-model="newGroupName" />
          <button class="btnCreate" @click="createGroup(newGroupName)">
            <i class="fa fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"; // Библиотека; Чтобы отправлять API запросы серверу
export default {
  name: "App",

  // Создание переменных в VUE
  data() {
    return {
      groups: [],
      newGroupName: "",
    };
  },

  // Создание функций в VUE
  methods: {
    deleteGroup(groupKey) {
      axios.delete("/group/" + this.groups[groupKey]._id).then(() => {
        this.$delete(this.groups, groupKey);
      });
    },
    deleteStudent(groupKey, studentKey) {
      let group = this.groups[groupKey];

      axios.delete("/student/" + group.students[studentKey]._id).then(() => {
        this.$delete(group.students, studentKey);
      });
    },
    createStudent(groupKey, name) {
      let group = this.groups[groupKey];
      axios
        .post("/student/", {
          name,
          groupID: group._id,
        })
        .then((response) => {
          group.students.push({
            name: name,
            _id: response.data,
          });
        });
    },
    createGroup(name) {
      axios.post("/group", { name }).then((response) => {
        this.groups.push({
          name,
          _id: response.data,
          students: [],
        });
      });
    },
  },

  // Запускается когда сайт полностью открылся
  created() {
    // Берём полный список групп
    axios.get("/group").then((response) => {
      this.groups = response.data;
    });
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
* {
  box-sizing: border-box;
}

body {
  font-family: Arial, Helvetica, sans-serif;
}

.btn {
  background-color: crimson;
  border: none;
  color: white;
  padding: 6px 8px;
  font-size: 12px;
  cursor: pointer;
}

.btn:hover {
  background-color: red;
}

.btnCreate {
  cursor: pointer;
}

.column {
  float: left;
  width: 25%;
  padding: 0 10px;
}

.row {
  margin: 0 -5px;
}

.row:after {
  content: "";
  display: table;
  clear: both;
}

@media screen and (max-width: 600px) {
  .column {
    width: 100%;
    display: block;
    margin-bottom: 20px;
  }
}

.card {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  padding: 16px;
  text-align: center;
  background-color: #f1f1f1;
}
</style>
