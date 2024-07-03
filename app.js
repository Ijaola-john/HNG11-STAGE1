import express from 'express';
import "dotenv/config"; 
//require('dotenv').config();
//const ip_api_key = process.env.IP_API_KEY;
const Weather_api_key = process.env.WEATHER_API_KEY;
//const opw_api_key = process.env.OPW_API_KEY;
const port = process.env.PORT || 3001;
import axios from 'axios';  
const app = express();


async function getLocation(ip) {
    console.log(Weather_api_key);
    try {
        const response = await axios.get('http://api.weatherapi.com/v1/ip.json', {
            params: {
                key: Weather_api_key,
                q: ip
            }
        });
        
        const data = response.data;
        return data;
    } catch (error) {
        console.error("Error in getting Location", error.message);
    }
    return null;
    
}

async function getTemperature(city) {
    try {
        const response = await axios.get('http://api.weatherapi.com/v1/current.json', {
            params: {
                key: Weather_api_key,
                q: city
            }
        });
        return response.data.current.temp_c;
    } catch (error) {
        console.error("Error in getting Temperature", error.message);
    }
    return null;
}

app.get('/api/hello', async (req, res) => {
    try {
        console.log(req.ip);
        const client_ip = req.ip;
       const locationData = await getLocation(client_ip);
       console.log(locationData.city);
        if (!locationData) {
            res.status(500).send('Internal Server Error');
            return;
        }
        const location = locationData.city;
        const temperature = await getTemperature(location);
        if (temperature === null) {
            res.status(500).send('Internal Server Error');
            return;
        }
        const visitorName = req.query.visitor_name;
        if (!visitorName) {
            res.status(400).send('Bad Request: visitor_name is required');
            return;
        }
        const responseData = {
            client_ip: client_ip,
            location: location,
            greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${location}`
        };
        res.json(responseData);
    } catch (error) {
        console.error("Error in /api/hello", error.message);
        res.status(500).send('Internal Server Error');
        return;
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
