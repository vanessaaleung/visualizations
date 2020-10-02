import React from "react";
import { scaleLinear } from "d3-scale";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from "react-simple-maps";

const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

const colorScale = scaleLinear()
  .domain([0, 10, 100, 200])
  .range(["#fff2e6", "#ffcc99", "#ff8000", "#ff6600"]);

const PerCapitaMap = ({setTooltipContent, data}) => {

  const mapData = require('./world-110m.json');

  var caseByCountry = {};
  var coordinateByCountry = {};
  var casePerCapita = {};

  data.map(row => {
    const latest = Object.keys(row)[Object.keys(row).length-1];
    if (row['Country/Region'] === 'US') {
      row['Country/Region'] = 'United States of America';
    }
    if (row['Country/Region'] === 'Taiwan*') {
      row['Country/Region'] = 'Taiwan';
    }
    caseByCountry[row['Country/Region']] =
      row['Country/Region'] in caseByCountry ?
        caseByCountry[row['Country/Region']] + (+row[latest]) :
        +row[latest]
    if (row['Country/Region'] === 'United Kingdom') {
      coordinateByCountry[row['Country/Region']] = [3.4360, 55.3781]
    }
    else{
      coordinateByCountry[row['Country/Region']] = [+row["Long"], +row["Lat"]]
    }
  });

  for (const [key, value] of Object.entries(caseByCountry)) {
    const d = mapData.objects.ne_110m_admin_0_countries.geometries.filter(s => s.properties.NAME === key);
    const population = d[0] ? d[0].properties.POP_EST :  null
    casePerCapita[key] = population ? value / population * 100000 : null
  }

  const notShowCountries = ["Denmark", "Estonia", "Austria", "Ireland", "Norway", "Finland", "Portugal", "Lithuania", "Luxembourg", "Poland", "Belarus", "Romania", "Belgium", "Switzerland", "Czechia", "Bosnia and Herzegovina", "Slovakia", "Serbia", "Hungary", "Slovenia", "Croatia", "Moldova", "Egypt", "Saudi Arabia", "Lebanon", "Bahrain", "Qatar", "United Arab Emirates", "Iraq", "Singapore", "Indonesia", "Japan", "Argentina", "Albania", "Bulgaria", "Montenegro", "Kosovo", "Georgia", "Azerbaijan", "Kuwait", "Syria", "Kyrgyzstan", "Bhutan", "Jordan", "Vietnam", "Guinea-Bissau", "Guinea","Togo", "Ghana", "Gambia", "Benin", "Botswana", "Mozambique", "Uganda", "Burundi", "Nicaragua", "El Salvador", "Guyana", "Belieze", "Netherlands", "Costa Rica", "Guatemala", "Haiti", "Sierra Leone"]

  return (
    <ComposableMap
      data-tip=""
      projectionConfig={{
        rotate: [-20, 0, 0]
      }}
    >
        {data.length > 0 && (
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                casePerCapita[geo.properties.NAME] = caseByCountry[geo.properties.NAME] / geo.properties.POP_EST * 100000;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill = {casePerCapita[geo.properties.NAME] ? colorScale(casePerCapita[geo.properties.NAME]): "#F5F4F6"}
                    strokeWidth = "0.5"
                    style={{
                      default :{
                        stroke: "white"
                      },
                      hover: {
                        stroke: "black"
                      }
                    }}
                    onMouseEnter={() => {
                      setTooltipContent(`${geo.properties.NAME} - ${casePerCapita[geo.properties.NAME].toFixed(1)}`);
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                  />
                );
              })
            }
          </Geographies>
        )}
        {Object.keys(coordinateByCountry).map((key, index) => (
          <Marker key={index}
                  coordinates={[coordinateByCountry[key][0], coordinateByCountry[key][1]]}>
              <text className="country-text">
                { casePerCapita[key] > 0 && notShowCountries.indexOf(key) < 0 ? key : null}
              </text>
          </Marker>
      ))}
    </ComposableMap>
  );
};

export default PerCapitaMap;
