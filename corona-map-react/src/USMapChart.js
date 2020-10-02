import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { csv } from "d3-fetch";

const geoUrl = "/counties-10m.json";

const colorScale = scaleLinear()
  .domain([50, 1000])
  .range(["#ffedea", "#ff5233"]);

const USMapChart = ({setTooltipContent}) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    csv(`/time_series_covid19_confirmed_US.csv`).then(data => {
      setData(data);
    });
  }, []);

  var caseByCounty = {};
  var coordinateByCounty = {};

  data.map(row => {
    const latest = Object.keys(row)[Object.keys(row).length-1];
    if (row['Admin2'].includes("Out of") ||  row['Admin2'].includes("Unassigned")){

    } else {
      caseByCounty[row['Admin2']] =
      row['Admin2'] in caseByCounty ?
        caseByCounty[row['Admin2']] + (+row[latest]) :
        +row[latest];
      coordinateByCounty[row['Admin2']] = [+row["Long_"], +row["Lat"]];
    }
  });

  return (
      <ComposableMap
        data-tip=""
        projection="geoAlbersUsa"
        projectionConfig={{
          rotate: [-10, 0, 0],
          scale: 1000
        }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                const d = data.find(s => s.Admin2 === geo.properties.name);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    stroke="#FFF"
                    fill={"#ededed"}
                    onMouseEnter={() => {
                      const NAME = geo.properties.name;
                      const CASE = caseByCounty[NAME];
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

        </ZoomableGroup>
      </ComposableMap>
  );
};

export default USMapChart;
