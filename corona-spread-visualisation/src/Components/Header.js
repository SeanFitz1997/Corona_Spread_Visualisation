import React from "react";

import Footer from "./Footer";

function Header(props) {
	return (
		<>
			<header className="container text-light text-center">
				<div className="row align-items-center">
					<div className="col-2"></div>
					<div className="col">
						<h3 className="display-4 title">Corona Count</h3>
						<p className="lead-lg sub-title">
							Track the global spread of Coronavirus (COVID-19)
						</p>
					</div>
					<div
						className="col-2"
						data-toggle="modal"
						data-target="#info-modal"
					>
						<i className="fas fa-info-circle fa-2x info"></i>
					</div>
				</div>
			</header>

			<div
				className="modal fade"
				id="info-modal"
				tabIndex="-1"
				role="dialog"
				aria-labelledby="info-modalLabel"
				aria-hidden="true"
			>
				<div className="modal-dialog" role="document">
					<div className="modal-content bg-dark">
						<div className="modal-header">
							<h5 className="modal-title" id="info-modalLabel">
								Info
							</h5>
							<button
								type="button"
								className="close"
								data-dismiss="modal"
								aria-label="Close"
							>
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="modal-body">
							<p>
								This interactive map lets you track reported
								cases of the coronavirus around the world.
							</p>
							<div>
								This application allows you to:
								<ul>
									<li key={0}>
										View the spread at a set date by
										selecting a point on the slider.
									</li>
									<li key={1}>
										Watch the spread of coronavirus over
										time.
									</li>
									<li key={2}>
										Zoom into a specific area on the map.
									</li>
									<li key={3}>
										View the deaths and cured data by
										selecting their counter.
									</li>
								</ul>
							</div>
							<p>
								Information on reported infection, deaths and
								cured patients are based to the data published
								by{" "}
								<a
									href="https://coronavirus.jhu.edu/"
									target="_blank"
									rel="noopener noreferrer"
								>
									Johns Hopkins University
								</a>{" "}
								which can be accessed{" "}
								<a
									href="https://github.com/CSSEGISandData/COVID-19"
									target="_blank"
									rel="noopener noreferrer"
								>
									here
								</a>
								.
							</p>
							<p>
								The source code for this application can be
								accessed on my github.
								<a
									href="https://github.com/SeanFitz1997/Corona_Spread_Visualisation"
									target="_blank"
									rel="noopener noreferrer"
									className="float-right"
								>
									<i className="fab fa-github-square fa-2x"></i>
								</a>
							</p>

							<Footer />
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default Header;
