/*
 * The main component for PolicyEngine-[Country]
 */

import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { CountryContext, UK, US } from "../countries";
import { Header } from "./header";
import { Footer } from "./footer";
import { BodyWrapper, PolicyEngineWrapper } from "./layout/general";
import { Policy } from "./pages/policy";
import { policyToURL, urlToPolicy } from "./tools/url";
import { PopulationImpact } from "./pages/populationImpact";
import FAQ from "./pages/markdown";
import { Household } from "./pages/household";


export default class PolicyEngine extends React.Component {
    constructor(props) {
        super(props);
        this.prepareData = this.prepareData.bind(this);
        let country = { uk: new UK(), us: new US() }[props.country];
        country.stateHolder = this;
        country.analytics = props.analytics;
        this.state = { country: country };
    }

    setCountryState(data, callback) {
        let country = this.state.country;
        for (let key of Object.keys(data)) {
            country[key] = data[key];
        }
        this.setState({ country: country }, callback);
    }

    prepareData() {
        // Once data is fetched, apply some adjustments to the OpenFisca data
        // (that we don't want to apply in OpenFisca-[Country] because they're not
        // legislative)
        let { policy } = this.state.country.validatePolicy(urlToPolicy(this.state.country.parameters), this.state.country.parameters);
        for (let parameter of Object.keys(policy)) {
            if (Object.keys(this.state.country.extraParameterMetadata).includes(parameter)) {
                policy[parameter] = Object.assign(policy[parameter], this.state.country.extraParameterMetadata[parameter]);
            }
        }
        const situation = this.state.country.validateSituation(this.state.country.situation).situation;
        this.setCountryState({ situation: situation, parameters: policy, policy: JSON.parse(JSON.stringify(policy)), fullyLoaded: true });
    }

    componentDidMount() {
        // When the page loads, fetch parameter, variables and entities, and
        // then mark as done.
        const checkAllFetchesComplete = () => {
            if (
                (this.state.country.parameters !== null)
                && (this.state.country.variables !== null)
                && (this.state.country.entities !== null)
            ) {
                this.prepareData();
            }
        }
        const fetchEndpoint = name => {
            let url;
            if (name === "parameters") {
                const { searchParams } = new URL(document.location);
                let date = searchParams.get("policy_date");
                if (date) {
                    date = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
                }
                url = this.state.country.apiURL + "/" + name + (date ? "?policy_date=" + date : "")
            } else {
                url = this.state.country.apiURL + "/" + name;
            }
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    this.setCountryState({ [name]: data }, checkAllFetchesComplete);
                });
        }
        ["parameters", "variables", "entities"].forEach(fetchEndpoint);
    }

    render() {
        // Once fully loaded, direct onto individual pages
        if (!this.state.country.fullyLoaded) {
            return <></>;
        }
        const countryName = this.state.country.name;
        return (
            <PolicyEngineWrapper>
                <CountryContext.Provider value={this.state.country}>
                    <Header />
                    <BodyWrapper>
                        <Switch>
                            <Route path={`/${countryName}/policy`}>
                                <Policy />
                            </Route>
                            <Route path={`/${countryName}/population-impact`}>
                                <PopulationImpact />
                            </Route>
                            <Route path={`/${countryName}/household`}>
                                <Household />
                            </Route>
                            <Route path={`/${countryName}/faq`}>
                                <FAQ />
                            </Route>
                            {/* Redirects from legacy URLs */}
                            <Route path={`/${countryName}/population-results`}>
                                <Redirect to={policyToURL("population-impact", urlToPolicy(this.state.country.policy))} />
                            </Route>
                            <Route path={`/${countryName}/household-impact`}>
                                <Redirect to={policyToURL("household", urlToPolicy(this.state.country.policy))} />
                            </Route>
                            <Route path={`/${countryName}/situation`}>
                                <Redirect to={policyToURL("household", urlToPolicy(this.state.country.policy))} />
                            </Route>
                            <Route path={`/${countryName}/situation-results`}>
                                <Redirect to={policyToURL("household", urlToPolicy(this.state.country.policy))} />
                            </Route>
                        </Switch>
                    </BodyWrapper>
                    <Footer />
                </CountryContext.Provider>
            </PolicyEngineWrapper>
        );
    }
};