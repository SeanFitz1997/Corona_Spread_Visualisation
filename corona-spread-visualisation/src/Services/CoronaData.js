import Papa from "papaparse";

class CoronaData {
	/** CONSTANTS **/
	CONSTRUCTOR_INSTRUCTIONS_MESSAGE =
		"This class can not be constructed directly. Use CoronaData.build() instead. This will return a promise of the class instance.";
	INVALID_PARAM_ERROR_MESSAGE =
		"Must be in the form {infected: <int>, deaths: <int>, cured: <int>}. Values must be positive.";
	REQUIRED_ENTRIES = ["infected", "deaths", "cured"];

	/** BUILDER **/
	constructor(async_param) {
		if (typeof async_param === "undefined")
			throw this.CONSTRUCTOR_INSTRUCTIONS_MESSAGE;
		this._validate_constructor_params(async_param);

		this.infected_data = async_param.infected;
		this.deaths_data = async_param.deaths;
		this.cured_data = async_param.cured;
	}

	static async build() {
		let corona_data = await this._get_corona_data();
		return new CoronaData(corona_data);
	}

	/** DATA ACCESS FUNCTIONS **/
	get_size() {
		return this.infected_data.length;
	}

	get_totals(date_index) {
		this._validate_date_index(date_index);

		let totals = [
			this.infected_data,
			this.deaths_data,
			this.cured_data
		].map(data =>
			data[date_index].data.reduce((acc, x) => acc + x.count, 0)
		);

		return {
			infected: totals[0],
			deaths: totals[1],
			cured: totals[2]
		};
	}

	get_data(date_index, data_type) {
		this._validate_date_index();
		this._validate_data_type(data_type);

		if (data_type === "infected") return this.infected_data[date_index];
		else if (data_type === "deaths") return this.deaths_data[date_index];
		else return this.cured_data[date_index];
	}

	/** DATA RETRIEVAL HELPERS **/
	static async _get_corona_data() {
		const BASE_DATA_URL =
			"https://api.github.com/repos/CSSEGISandData/COVID-19/contents/csse_covid_19_data/csse_covid_19_time_series/";
		const INFECTED_URL =
			BASE_DATA_URL + "time_series_covid19_confirmed_global.csv";
		const DEATHS_URL =
			BASE_DATA_URL + "time_series_covid19_deaths_global.csv";
		const CURED_URL =
			BASE_DATA_URL + "time_series_covid19_recovered_global.csv";

		console.log("Making Request ");
		let [
			infected_response,
			deaths_response,
			cured_response
		] = await Promise.all([
			fetch(INFECTED_URL).then(response => response.json()),
			fetch(DEATHS_URL).then(response => response.json()),
			fetch(CURED_URL).then(response => response.json())
		]);

		let infections_content = window.atob(infected_response.content);
		let deaths_content = window.atob(deaths_response.content);
		let cured_content = window.atob(cured_response.content);

		let infections_csv = Papa.parse(infections_content, { header: true })
			.data;
		let deaths_csv = Papa.parse(deaths_content, { header: true }).data;
		let cured_csv = Papa.parse(cured_content, { header: true }).data;

		let infections_data = this._format_data(infections_csv);
		let deaths_data = this._format_data(deaths_csv);
		let cured_data = this._format_data(cured_csv);

		return {
			infected: infections_data,
			deaths: deaths_data,
			cured: cured_data
		};
	}

	static _format_data(data) {
		let formatted_data = [];

		// Create records for each date
		let dates = Object.keys(data[0]).slice(4);
		dates.forEach(date => {
			// Create Date object
			let pattern = /(?<month>[0-9]{1,2})\/(?<day>[0-9]{1,2})\/(?<year>[0-9]{2})$/;
			let match = date.match(pattern);
			let { year, month, day } = match.groups;
			[year, month, day] = [
				parseInt(year),
				parseInt(month - 1),
				parseInt(day)
			];
			date = new Date(`20${year}`, month, day);

			// Add entry
			formatted_data.push({ date: date, data: [] });
		});

		// Iterate over each row (location)
		data.forEach(row => {
			// Get area data
			const title = {
				state: row["Province/State"],
				country: row["Country/Region"]
			};
			const location = {
				longitude: parseFloat(row["Long"]),
				latitude: parseFloat(row["Lat"])
			};

			// Add count for reach date
			Object.keys(row)
				.slice(4)
				.forEach((date, date_index) => {
					// Get Counts
					let count = parseInt(row[date]);

					// Validate counts
					if (!Number.isSafeInteger(count))
						console.error(
							`Invalid counts data for ${title.state}-${
								title.country
							}: ${JSON.stringify(row)}`
						);
					else
						formatted_data[date_index].data.push({
							title,
							location,
							count
						});
				});
		});

		return formatted_data;
	}

	/** VALIDATION HELPERS **/
	_validate_constructor_params(constructor_params) {
		this.REQUIRED_ENTRIES.forEach(entry => {
			if (!(entry in constructor_params))
				throw new Error(
					`Error: Missing entry ${entry}, constructor_params= ${JSON.stringify(
						constructor_params
					)}. \n${this.INVALID_PARAM_ERROR_MESSAGE}\n${
						this.CONSTRUCTOR_INSTRUCTIONS_MESSAGE
					}`
				);
		});
	}

	_validate_date_index(date_index) {
		if (date_index < 0 || date_index >= this.get_size())
			throw new Error(
				`Error: Invalid data_index. date_index must be between 0 and ${this.get_size() -
					1} (inclusive)`
			);
	}

	_validate_data_type(data_type) {
		if (!this.REQUIRED_ENTRIES.includes(data_type))
			throw new Error(
				`Error: Invalid data_type ${data_type}. Value must be in ${this.REQUIRED_ENTRIES}`
			);
	}
}


export default CoronaData;
