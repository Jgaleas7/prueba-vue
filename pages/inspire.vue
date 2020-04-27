<template>
  <section class="container">

      <h1>{{now}}</h1>
       <v-select
        v-model="type"
        :items="typeToLabel"
        label="Type"
        @change="set_events"
      ></v-select>
    <v-sheet height="600">
      <v-calendar
        ref="calendar"
        v-model="start"
        :events="events"
        :value="value"
        :now="now"
        :type="type"
        :start="start"
      ></v-calendar>
       </v-sheet>

  </section>
</template>


<script>
import axios from '~/plugins/axios'
import moment from 'moment-timezone'
export default {
  async asyncData () {
    let { data } = await axios.get('/api/');

    return { data }
  },
  data: () => ({
      events: [],
      value:'',
      now:'',
      start:'2020-04-26',
      type: 'month',
      typeToLabel: ['month','week','day','4day'],
      hourly:[],
      currently:[],
      daily:[],
      minutely:[]

  }),
 methods:{
   fillEvents(){
     let events = [];

      let {daily}=this.data
      let {currently, dayly}=this.data
          daily.data.forEach(element => {
                    events.push({
                            name: element.summary,
                            start: this.formatDate(element.time, currently.timezone)
                  })
          });

     this.now=this.formatDate(currently.time, currently.timezone)
     this.start= moment.unix(currently.time).tz(currently.timezone).format("YYYY-MM-DD  hh:mm")


     this.events=events
   },

   formatDate(time, timezone){
         return moment.unix(time).tz(timezone).format("YYYY-MM-DD hh:mm:ss")
   },

   set_events() {
              if(this.type==='day'){
              let events=[]
              let {hourly, currently} =this.data
                hourly.data.forEach(element => {
                    events.push({
                            name: element.summary,
                            start: this.formatDate(element.time, currently.timezone)
                    })
                });
              this.events=[]
                this.events=events
                this.$refs.calendar.checkChange()
              }


    }

 },
  mounted(){
      this.fillEvents()
  },
  head () {
    return {
      title: 'Wheather'
    }
  }
}
</script>

<style scoped>
.title
{
  margin: 30px 0;
}
.users
{
  list-style: none;
  margin: 0;
  padding: 0;
}
.user
{
  margin: 10px 0;
}
</style>
