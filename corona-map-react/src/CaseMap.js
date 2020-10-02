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

const CaseMap = ({setTooltipContent, data}) => {

  var caseByCountry = {};
  var coordinateByCountry = {};

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

  const sizeScale = scaleLinear()
  .domain([100, 5000, 10000, 3000000])
  .range([1, 4, 10, 18]);

  const notShowCountries = ["Denmark", "Estonia", "Austria", "Ireland", "Norway", "Finland", "Portugal", "Lithuania", "Greece", "Germany", "Luxembourg", "Poland", "Belarus", "Romania", "Belgium", "Switzerland", "Czechia", "Bosnia and Herzegovina", "Slovakia", "Serbia", "Hungary", "Slovenia", "Croatia", "Moldova", "Armenia", "Egypt", "Saudi Arabia", "Lebanon", "Bahrain", "Qatar", "United Arab Emirates", "Iraq", "Singapore", "Indonesia", "Japan", "Argentina"]

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
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill = '#ededed'
                    stroke = "white"
                    strokeWidth = "0.5"
                    outline = "none"
                  />
                );
              })
            }
          </Geographies>
        )}
        {Object.keys(coordinateByCountry).map((key, index) => (
          <Marker key={index}
                  coordinates={[coordinateByCountry[key][0], coordinateByCountry[key][1]]}>
              <circle className="caseCircle"
                r={sizeScale(caseByCountry[key])}
                onMouseEnter={() => {
                  setTooltipContent(`${key} - ${caseByCountry[key]}`);
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
                {caseByCountry[key] > 500 && notShowCountries.indexOf(key) < 0 ? key : null}
              </text>
          </Marker>
      ))}
        {Object.keys(coordinateByCountry).map((key, index) => (
          <Marker key={index}
                  coordinates={[coordinateByCountry[key][0], coordinateByCountry[key][1]-3]}>
              <text className="num-text">
                {caseByCountry[key] > 500 && notShowCountries.indexOf(key) < 0 ? caseByCountry[key].toLocaleString() : null}
              </text>
          </Marker>
      ))}
    </ComposableMap>
  );
};

export default CaseMap;
