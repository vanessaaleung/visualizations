import React, { useState } from "react";
import { scaleLinear } from "d3-scale";
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Graticule,
  ZoomableGroup,
  Marker
} from "react-simple-maps";

const geoUrl =
  "/world-110m.json";

const colorScale = scaleLinear()
  .domain([500, 90000])
  .range(["#ffedea", "#ff5233"]);

const MapChart = ({setTooltipContent, data}) => {

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
    coordinateByCountry[row['Country/Region']] = [+row["Long"], +row["Lat"]]
  });


  return (
    <ComposableMap
      data-tip=""
      projectionConfig={{
        rotate: [-10, 0, 0],
        scale: 147
      }}
    >
      <ZoomableGroup >
        {/*
          <Sphere stroke="#E4E5E6" strokeWidth={0.5} />
          <Graticule stroke="#E4E5E6" strokeWidth={0.5} />
        */}

        {data.length > 0 && (
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                const d = data.find(s => s["Country/Region"] === geo.properties.NAME);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={d ? colorScale(caseByCountry[d["Country/Region"]]) : "#F5F4F6"}
                    onMouseEnter={() => {
                      const NAME = geo.properties.NAME;
                      const CASE = caseByCountry[NAME];
                      setTooltipContent(`${NAME} - ${CASE}`);
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
              <text
                textAnchor="middle"
                style={{ fontFamily: "system-ui", fontSize:  "4px", fill: "#5D5A6D" }}
              >
                {key}
              </text>
          </Marker>
      ))}
      </ZoomableGroup>
    </ComposableMap>
  );
};

export default MapChart;
