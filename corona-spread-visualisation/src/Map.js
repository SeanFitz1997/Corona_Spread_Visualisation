import React from "react";
import { Map, TileLayer } from "react-leaflet";
import HeatmapLayer from "react-leaflet-heatmap-layer";
import CountUp from "react-countup";
import { isMobile } from "react-device-detect";

import get_corona_data from "./data";

class WorldMap extends React.Component {
	//*** STATE SETUP FUNCTIONS ***/

	constructor(props) {
		// Set initial state
		super(props);
		this.state = {
			corona_data: null,
			date_index: 0,
			plot_type: "infected",
			playing: false
		};
	}

	componentDidMount() {
		//Retrieve corona data
		get_corona_data().then(corona_data => {
			// Update state
			let date_index = corona_data.length - 1;
			this.setState({ corona_data, date_index });

			// Update slider
			let slider = document.getElementById("date-slider");
			slider.max = date_index;
			slider.value = date_index;
		});
	}

	//*** UTILS ***/

	get_totals(date_index, corona_data) {
		const default_value = {
			infected: 0,
			deaths: 0,
			cured: 0
		};
		if (!date_index || !corona_data) return default_value;

		let data = corona_data[date_index].data;
		let totals = data.reduce((acc, x) => {
			acc.infected += x.counts.infected;
			acc.deaths += x.counts.deaths;
			acc.cured += x.counts.cured;
			return acc;
		}, default_value);

		return totals;
	}

	get_date_string(date_time_string) {
		let date = new Date(date_time_string);
		const date_format = new Intl.DateTimeFormat("en", {
			year: "numeric",
			month: "short",
			day: "2-digit"
		});
		const [
			{ value: mo },
			,
			{ value: da },
			,
			{ value: ye }
		] = date_format.formatToParts(date);

		return `${da}/${mo}/${ye}`;
	}

	//*** EVENT HANDLERS ***/

	on_date_change() {
		let input = document.getElementById("date-slider");
		this.setState({ date_index: input.value });
	}

	on_chart_type_change(event) {
		if (event.currentTarget.id === "cured-count")
			this.setState({ plot_type: "cured" });
		else if (event.currentTarget.id === "deaths-count")
			this.setState({ plot_type: "deaths" });
		else this.setState({ plot_type: "infected" });
	}

	play_button_handler() {
		let { playing } = this.state;
		if (!playing) this.start_play();
		else this.stop_play();
	}

	start_play() {
		// Update map state and reset date index
		this.setState({ playing: true, date_index: 0 });
		// Create Update to run every sec
		this.interval = setInterval(() => {
			let { date_index, corona_data } = this.state;
			// Increment date or stop play at end
			if (date_index < corona_data.length - 1)
				this.setState({ date_index: ++date_index });
			else this.stop_play();
		}, 1000);
	}

	stop_play() {
		// Update state
		this.setState({ playing: false });
		// Stop update step
		clearInterval(this.interval);
	}

	//*** RENDER HELPERS ***/

	render_heat_map() {
		let { corona_data, date_index, plot_type } = this.state;
		const gradients = {
			infected: {
				0.2: "#FFFF66",
				0.4: "#FFCC00",
				0.6: "#FF9900",
				0.8: "#FF0000"
			},
			deaths: {
				0.2: "#D2B4DE",
				0.4: "#A569BD",
				0.6: "#A569BD",
				0.8: "#512E5F"
			},
			cured: {
				0.2: "#82E0AA",
				0.4: "#2ECC71",
				0.6: "#239B56",
				0.8: "#145A32"
			}
		};
		if (corona_data)
			return (
				<HeatmapLayer
					points={corona_data[date_index].data}
					longitudeExtractor={point => point.location.longitude}
					latitudeExtractor={point => point.location.latitude}
					intensityExtractor={point => point.counts[plot_type]}
					gradient={gradients[plot_type]}
				/>
			);
		else return null;
	}

	render_play_button() {
		let { playing } = this.state;
		return (
			<button
				onClick={this.play_button_handler.bind(this)}
				type="button"
				className="play-button"
			>
				{!playing ? (
					<>
						Watch Over Time
						<i className="ml-2 fas fa-play play-icon"></i>
					</>
				) : (
					<>
						Stop <i className="ml-2 fas fa-stop"></i>
					</>
				)}
			</button>
		);
	}

	render_date_slider() {
		let { plot_type, playing, date_index } = this.state;
		return (
			<div className="slidecontainer">
				<input
					id="date-slider"
					className={`slider ${plot_type}`}
					type="range"
					min="0"
					max="0"
					step="1"
					value={date_index}
					onInput={this.on_date_change.bind(this)}
					disabled={playing}
				/>
			</div>
		);
	}

	render_date() {
		let { corona_data, date_index } = this.state;
		return (
			<p className="lead mt-1 text-center">
				{corona_data
					? this.get_date_string(corona_data[date_index].date)
					: null}
			</p>
		);
	}

	render_count(count_type) {
		let { plot_type, date_index, corona_data } = this.state;
		const icons_class = {
			deaths: "fas fa-skull-crossbones",
			infected: "fas fa-biohazard",
			cured: "fas fa-medkit"
		};

		return (
			<div
				id={`${count_type}-count`}
				className={`col count${
					plot_type === count_type ? " count_active" : ""
				}`}
				onClick={this.on_chart_type_change.bind(this)}
			>
				<i className={`${icons_class[count_type]} count-icon`}></i>
				<CountUp
					end={this.get_totals(date_index, corona_data)[count_type]}
					separator=","
					delay={0}
					duration={0.7}
				>
					{({ countUpRef }) => (
						<h4>
							<span ref={countUpRef} />
						</h4>
					)}
				</CountUp>
				<p className="lead-1">
					{count_type[0].toUpperCase() + count_type.substr(1)}
				</p>
			</div>
		);
	}

	render() {
		let map_config = {
			center: [10, 0],
			zoom: isMobile? 0.75: 2,
			mixZoom: isMobile? 0.75: 2,
			maxBounds: [[-100, -200], [100, 200]]
		}
		return (
			<div className="map">
				<Map
					center={map_config.center}
					zoom={map_config.zoom}
					attributionControl={false}
					minZoom={map_config.minZoom}
					maxBounds={map_config.maxBounds}
				>
					{this.render_heat_map()}
					<TileLayer
						url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
						attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
					/>
				</Map>

				<div className="row">
					<div className="col my-auto">
						{this.render_play_button()}
					</div>

					<div className="col">{this.render_date()}</div>

					<div className="col"></div>
				</div>

				{this.render_date_slider()}

				<div className="row text-center">
					{["deaths", "infected", "cured"].map(count_type =>
						this.render_count(count_type)
					)}
				</div>
			</div>
		);
	}
}

export default WorldMap;
