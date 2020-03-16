import Papa from "papaparse";

async function get_corona_data() {
	const BASE_DATA_URL =
		"https://api.github.com/repos/CSSEGISandData/COVID-19/contents/csse_covid_19_data/csse_covid_19_time_series/";
	const INFECTED_URL = BASE_DATA_URL + "time_series_19-covid-Confirmed.csv";
	const DEATHS_URL = BASE_DATA_URL + "time_series_19-covid-Deaths.csv";
	const CURED_URL = BASE_DATA_URL + "time_series_19-covid-Recovered.csv";

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

	let infections_data = Papa.parse(infections_content, { header: true }).data;
	let deaths_data = Papa.parse(deaths_content, { header: true }).data;
	let cured_data = Papa.parse(cured_content, { header: true }).data;

	let corona_data = _format_corona_data(infections_data, deaths_data, cured_data);

	return corona_data;
}

function _format_corona_data(infections_data, deaths_data, cured_data) {
	let corona_data = [];

	// Create records for each date
	let dates = Object.keys(infections_data[0]).slice(4);
	dates.forEach(date => {
		// Format date
		let pattern = /(?<month>[0-9]{1,2})\/(?<day>[0-9]{1,2})\/(?<year>[0-9]{2})$/;
		let match = date.match(pattern);
		let { year, month, day } = match.groups;
		[year, month, day] = [parseInt(year), parseInt(month), parseInt(day)];

		date = new Date(`20${year}`, month, day);

		// Add entry
		corona_data.push({ date: date, data: [] });
	});

	infections_data.forEach((row, row_index) => {
		// Get area data
		const title = {
			state: row["Province/State"],
			country: row["Country/Region"]
		};
		const location = {
			longitude: parseFloat(row["Long"]),
			latitude: parseFloat(row["Lat"])
		};

		// Add values into each entry
		Object.keys(row)
			.slice(4)
			.forEach((date, date_index) =>
				corona_data[date_index].data.push({
					title: title,
					location: location,
					counts: {
						infected: parseInt(row[date]),
						deaths: parseInt(deaths_data[row_index][date]),
						cured: parseInt(cured_data[row_index][date])
					}
				})
			);
	});

	return corona_data;
}

export default get_corona_data;
