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

const sizeScale = scaleLinear()
  .domain([10, 250, 5000, 100000])
  .range([1, 4, 10, 18]);

const DeathMap = ({setTooltipContent, data}) => {

  var deathByCountry = {};
  var coordinateByCountry = {};

data.map(row => {
  const latest = Object.keys(row)[Object.keys(row).length-1];
  if (row['Country/Region'] === 'US') {
    row['Country/Region'] = 'United States of America';
  }
  if (row['Country/Region'] === 'Taiwan*') {
    row['Country/Region'] = 'Taiwan';
  }
  deathByCountry[row['Country/Region']] =
    row['Country/Region'] in deathByCountry ?
      deathByCountry[row['Country/Region']] + (+row[latest]) :
      +row[latest]
  if (row['Country/Region'] === 'United Kingdom') {
    coordinateByCountry[row['Country/Region']] = [3.4360, 55.3781]
  }
  else{
    coordinateByCountry[row['Country/Region']] = [+row["Long"], +row["Lat"]]
  }
});

  const notShowCountries = ["Denmark", "Estonia", "Ireland", "Norway", "Finland", "Portugal", "Lithuania", "Greece", "Germany", "Luxembourg", "Poland", "Belarus", "Romania", "Belgium", "Switzerland", "Czechia", "Bosnia and Herzegovina", "Slovakia", "Serbia", "Hungary", "Slovenia", "Croatia", "Moldova", "Egypt", "Saudi Arabia", "Lebanon", "Bahrain", "Qatar", "United Arab Emirates", "Singapore", "Japan", "Argentina"]

  return (
    <div>
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
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill = '#ededed'
                      stroke = "white"
                      strokeWidth = "0.5"
                    />
                  );
                })
              }
            </Geographies>
          )}
          {Object.keys(coordinateByCountry).map((key, index) => (
            <Marker key={index}
                    coordinates={[coordinateByCountry[key][0], coordinateByCountry[key][1]]}>
                <circle
                  className="deathCircle"
                  r={sizeScale(deathByCountry[key])}
                  onMouseEnter={() => {
                    setTooltipContent(`${key} - ${deathByCountry[key]}`);
                  }}
                  onMouseLeave={() => {
                    setTooltipContent("");
                  }}
                   />
            </Marker>
        ))}
          {Object.keys(coordinateByCountry).map((key, index) => (
            <Marker key={index}
                    coordinates={[coordinateByCountry[key][0], coordinateByCountry[key][1]]}>
                <text className="country-text">
                  {deathByCountry[key] > 100 && notShowCountries.indexOf(key)  < 0 ? key : null}
                </text>
            </Marker>
        ))}
          {Object.keys(coordinateByCountry).map((key, index) => (
            <Marker key={index}
                    coordinates={[coordinateByCountry[key][0], coordinateByCountry[key][1]-3]}>
                <text className="num-text">
                  {deathByCountry[key] > 100 && notShowCountries.indexOf(key)  < 0 ? deathByCountry[key].toLocaleString() : null}
                </text>
            </Marker>
        ))}
      </ComposableMap>
      </div>
  );
};

export default DeathMap;
