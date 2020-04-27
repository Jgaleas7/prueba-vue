const { Router } = require('express')
const env = require('../config').default
let superagent= require('superagent')
const router = Router()

router.get('/darksky/:coords', async(req, res, next)=>{
   console.log(req.params.coords)
  let coords=req.params.coords.split(",")
    let url= env.endpoints.darksky
    let lat=coords[1]
    let long=coords[0]

        try{
                const response = await superagent.get(url+`/${lat}, ${long}`);
                const data = response.body;
                let minutely=data && data.minutely && data.minutely.data
                let {  currently, hourly, daily, timezone } =response.body

                currently.timezone=timezone
                res.type('application/json')
                res.status(200).json({
                            hourly,
                            currently,
                            daily,
                            minutely
                        });
    }
    catch (error) {
         res.status(400).json({message: error});

      }

})
router.get('/cities/:city', async (req, res, next)=>{
   const city= req.params.city
   const mapbox=env.endpoints.mapbox
   const token=env.endpoints.token
   let url= mapbox+`${city}.json?`+token
        try{
                const response = await superagent.get(url);
                const data = response.body;
                res.status(200).json({ data });
        }
        catch (error) {
          res.status(400).json({message: error});
          console.error(error)
        }

})
router.get('/', async(req, res, next)=>{
  let url= env.endpoints.darksky
  let lat='-33.8686'
  let long='151.2094'

  try{
    const response = await superagent.get(url+`/${lat}, ${long}`);
    const data = response.body;
    let minutely=data && data.minutely && data.minutely.data
    let {  currently, hourly, daily, timezone } =response.body

    currently.timezone=timezone
    res.type('application/json')
    res.status(200).json({
      hourly,
      currently,
      daily,
      minutely
    });
  }
  catch (error) {
    res.status(400).json({message: error});
    console.error(error)
  }

})


module.exports = router
