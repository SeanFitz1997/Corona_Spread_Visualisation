import React from "react";

import Header from "./Components/Header";
import Footer from "./Components/Footer";
import WorldMap from "./Components/Map";
import "./App.css";

class App extends React.Component {
	render() {
		return (
			<div>
				<div className="container text-light">
					<Header />
					<WorldMap />
					<Footer />
				</div>
			</div>
		);
	}
}
export default App;
