<template>
  <div>
    <v-col cols="4" >
      <v-text-field
        v-model="city"
        label="State — Cities"
        persistent-hint
        prepend-icon="mdi-city"
      >
        <template v-slot:append-outer>
          <v-slide-x-reverse-transition
            mode="out-in"
          >
            <v-btn @click="getCity">
              <v-icon
                color="success"

              >mdi-check-outline</v-icon>
            </v-btn>

          </v-slide-x-reverse-transition>
        </template>
      </v-text-field>
    </v-col>

  <v-row class="fill-height">
    <v-card
      class="mx-auto"
      max-width="400"
    >
      <v-list-item two-line>
        <v-list-item-content>
          <v-list-item-title class="headline">{{currently.timezone}}</v-list-item-title>
          <v-list-item-subtitle>{{formatDateLL(currently.time, currently.timezone, 'LL')}}, {{currently.summary}}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-card-text>
        <v-row align="center">
          <v-col class="display-3" cols="6">
            {{fixIt(currently.temperature) }}&deg;F
          </v-col>
          <v-col cols="6">

           <v-img
            :src="`https://darksky.net/images/weather-icons/${currently.icon}.png`"
            alt="Sunny image"
            width="92"
          ></v-img>
          </v-col>
        </v-row>
      </v-card-text>

      <v-list-item>
        <v-list-item-icon>
          <v-icon>mdi-send</v-icon>
        </v-list-item-icon>
        <v-list-item-subtitle>{{currently.windSpeed}} mph</v-list-item-subtitle>
      </v-list-item>

      <v-list-item>
        <v-list-item-icon>
          <v-icon>mdi-cloud-download</v-icon>
        </v-list-item-icon>
        <v-list-item-subtitle>{{currently.precipProbability}}%</v-list-item-subtitle>
      </v-list-item>

     <v-divider></v-divider>

      <v-list class="transparent">
        <v-list-item
          v-for="item in daily"
          :key="item.time"
        >
          <v-list-item-title>{{ formatDateLL(item.time, currently.timezone, 'dddd') }}</v-list-item-title>

          <v-list-item-icon>

            <v-img width="32" height="15" :src="`https://darksky.net/images/weather-icons/${item.icon}.png`"></v-img>
          </v-list-item-icon>

          <v-list-item-subtitle class="text-right">
            {{fixIt(item.temperatureLow) }} &deg;F
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>



    </v-card>
    <v-col>
      <v-sheet height="64">
        <v-toolbar flat >
          <v-btn outlined class="mr-4" color="grey darken-2" @click="setToday">
            Today
          </v-btn>
          <v-btn fab text small color="grey darken-2" @click="prev">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn fab text small color="grey darken-2" @click="next">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-toolbar-title>{{ today }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-select
            v-model="type"
            :items="typeToLabel"
            label="Type"
            @change="onChangeType"
            dark
          ></v-select>
         <!-- <v-menu bottom right>
            <template v-slot:activator="{ on }">
              <v-btn
                outlined
                color="grey darken-2"
                v-on="on"
              >
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list @change="onChangeType">
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Day</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Week</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Month</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 days</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu> -->
        </v-toolbar>
      </v-sheet>
      <v-sheet height="600">
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          :events="events"
          :event-color="getEventColor"
          :now="today"
          :type="type"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @change="onChangeType"
        ></v-calendar>
        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
        >
          <v-card
            color="#385F73"
            min-width="350px"
            flat
            dark
          >
            <v-toolbar
              :color="selectedEvent.color"
              dark
            >
                <div v-html="selectedEvent.img"></div>
              <v-toolbar-title v-html="selectedEvent.name"></v-toolbar-title>
              <v-spacer></v-spacer>

            </v-toolbar>
            <v-card-text>

              <div>Temperatura Min</div>
              <v-col class="display-3" cols="5" v-html="selectedEvent.temperaturalow">
              </v-col>&deg;F
              <div>Temperatura Max</div>
              <v-col class="display-3" cols="5" v-html="selectedEvent.temperaturamax">
              </v-col>&deg;F
            </v-card-text>
            <v-card-actions>
              <v-btn
                text
                color="secondary"
                @click="selectedOpen = false"
              >
                Cancel
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>
    </v-col>
  </v-row>
  </div>
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
      currently:[],
      hourly:[],
      daily:[],
      focus: '',
      type: 'month',
      today:'',
      typeToLabel: [
        {  text: 'Day', value: 'day' },
        { text: '4 Day', value: '4day' },
        { text: 'Week', value: 'week' },
        { text: 'Month', value: 'month' }],
      start: null,
      end: null,
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      events: [],
      //variables for autocomplete
      city:'',
      coordsCity:''

    }),
    computed: {
      title () {
        const { start, end } = this
        if (!start || !end) {
          return ''
        }

        const startMonth = this.monthFormatter(start)
        const endMonth = this.monthFormatter(end)
        const suffixMonth = startMonth === endMonth ? '' : endMonth

        const startYear = start.year
        const endYear = end.year
        const suffixYear = startYear === endYear ? '' : endYear

        const startDay = start.day + this.nth(start.day)
        const endDay = end.day + this.nth(end.day)

        switch (this.type) {
          case 'month':
            return `${startMonth} ${startYear}`
          case 'week':
          case '4day':
            return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`
          case 'day':
            return `${startMonth} ${startDay} ${startYear}`
        }
        return ''
      },
      monthFormatter () {
        return this.$refs.calendar.getFormatter({
          timeZone: 'UTC', month: 'long',
        })
      },

    },

    mounted () {
      this.$refs.calendar.checkChange()
      this.fillCurrently()
    },
    methods: {
        onChangeType(){
          if(this.type==='day'){
            let events = [];
              console.log(this.hourly)
            this.hourly.forEach(element => {
                  events.push({
                    name: element.summary+' '+element.temperature,
                    start: this.formatDate(element.time, this.currently.timezone),
                    temperaturalow: element.temperature.toFixed(),
                    color: 'indigo'
                  })
                });
           // console.log(events)
            this.events=[]
            this.events=events
            this.$refs.calendar.checkChange()
          }
          if(this.type==='week'){
                this.updateRange()
               this.$refs.calendar.checkChange()
          }
          if(this.type==='month'){
            this.updateRange()
            this.$refs.calendar.checkChange()
          }
        },
        getCity() {
                if(this.city===''){
                  return
                }
                axios.get('/api/cities/' + this.city).then(resp => {
                   console.log(resp.data.data.features[0].center)
                     this.getDataFromDarksky(resp.data.data.features[0].center)
                      this.coordsCity = resp.data.data.features[0].center
                })
        },
        getDataFromDarksky(coordinates){
          axios.get('/api/darksky/'+coordinates).then(resp => {
            this.data=resp.data
            this.$refs.calendar.checkChange()
            this.fillCurrently()
          })
        },
        fillCurrently(){
          let { currently, daily, hourly }=this.data
          this.currently=currently
          this.daily=daily.data
          this.hourly=hourly.data
         // console.log(daily.data)
        },
      fixIt(numero){
          if(numero=== undefined || numero==='' || numero===null){
            return
          }
          return numero.toFixed()
      },
      viewDay ({ date }) {
        this.focus = date
        this.type = 'day'
      },
      getEventColor (event) {
        return event.color
      },
      setToday () {
        this.focus = this.today
      },
      prev () {
        this.$refs.calendar.prev()
      },
      next () {
        this.$refs.calendar.next()
      },
      showEvent ({ nativeEvent, event }) {
        const open = () => {
          this.selectedEvent = event
          this.selectedElement = nativeEvent.target
          setTimeout(() => this.selectedOpen = true, 10)
        }

        if (this.selectedOpen) {
          this.selectedOpen = false
          setTimeout(open, 10)
        } else {
          open()
        }

        nativeEvent.stopPropagation()
      },
      updateRange () {
        const events = [];
        let {currently, daily }=this.data;

        daily.data.forEach(element => {
          events.push({
            name: element.summary+' '+element.temperatureLow,
            start: this.formatDate(element.time, currently.timezone),
            temperaturalow: element.temperatureLow.toFixed(),
            temperaturamax: element.temperatureMax.toFixed(),
            img:  `<img width="40" height="20" src="https://darksky.net/images/weather-icons/${element.icon}.png"></img> `,
            color: 'indigo'

          })
        });
        this.today=this.formatDate(currently.time, currently.timezone)
        this.start = moment.unix(currently.time).tz(currently.timezone).format("YYYY-MM-DD  hh:mm")
        this.end =moment.unix(currently.time).tz(currently.timezone).add(7, 'day').format("YYYY-MM-DD  hh:mm")
        this.events = events
      },

      formatDate(time, timezone){
        return moment.unix(time).tz(timezone).format("YYYY-MM-DD hh:mm:ss")
      },
      formatDateLL(time, timezone, typeFormat){
        if(time===undefined || timezone===undefined){
          return
        }
        if(typeFormat==='LL'){
              return moment.unix(time).tz(timezone).format("LL")
        }
        return moment.unix(time).tz(timezone).format("dddd")

      },
      nth (d) {
        return d > 3 && d < 21
          ? 'th'
          : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][d % 10]
      },
    },
  }
</script>
