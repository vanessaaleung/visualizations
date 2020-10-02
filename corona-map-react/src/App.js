import React, { useEffect, useState } from "react";
import ReactTooltip from "react-tooltip";
import { csv } from "d3-fetch";

import "./styles.css";

import CaseMap from "./CaseMap";
import DeathMap from "./DeathMap";
import PerCapitaMap from "./PerCapitaMap";

function App() {
	const [content, setContent] = useState("");
	const [view, setView] = useState("case");
	const [caseData, setCaseData] = useState([]);
	const [deathData, setDeathData] = useState([]);

	var todayDate = Date().split(' ').splice(1,3).join(' ');

	useEffect(() => {
	    csv(`https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv`).then(caseData => {
	      setCaseData(caseData);
	    });
	    csv(`https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv`).then(deathData => {
	      setDeathData(deathData);
	  	});
	  }, []);

	return (
		<div>
			<div className="title">
				<h1>The New York Times Coronavirus Map Recreation</h1>
				<p>By Vanessa Liang&nbsp;&nbsp;&nbsp;&nbsp;<span>Updated {todayDate}</span></p>
			</div>
			<div className="btn-group">
	    		<button
	    			autoFocus
	    			onClick={() =>  setView("case")}>
    			Total cases</button>
	    		<button
	    			onClick={() =>  setView("deaths")}>
	    		Deaths</button>
	    		<button
	    			onClick={ () =>  setView("percapita")}>
	    		Per capita</button>
	    	</div>
	    	<div className="description">
	    		<p>Hover map for more details</p>
	    	</div>
	    	
	    	{
	    		view === "case" ? 
	    		<div className="map-group">
		    		<CaseMap setTooltipContent={setContent} data={caseData}/>
		    		<ReactTooltip className="tool-tip">{content}</ReactTooltip>
				</div>
				    :
				view === "deaths" ?
				<div className="map-group"> 
					<DeathMap setTooltipContent={setContent} data={deathData}/>
					<ReactTooltip className="tool-tip">{content}</ReactTooltip>
				</div>
				    :
				view === "percapita" ? 
				<div className="map-group">
					<PerCapitaMap setTooltipContent={setContent} data={caseData}/>
					<ReactTooltip className="tool-tip">{content}</ReactTooltip>
				</div>
				  	: null
			}

	    </div>
  );
}

export default App;
