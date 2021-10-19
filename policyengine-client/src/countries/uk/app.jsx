import React from "react";
import { urlToPolicy } from "../../common/url";
import { PolicyEngineWrapper, BodyWrapper } from "../../common/layout";
import { Header } from "../../common/header";
import { Footer } from "../../common/footer";
import { Switch, Route, Redirect } from "react-router-dom";

import { ORGANISATIONS, PARAMETER_MENU } from "./data/policy_controls";

import FAQ from "./components/faq";
import Policy from "../../common/pages/policy";
import PopulationImpact from "../../common/pages/populationImpact";
import AutoUBI from "./components/autoUBI";
import Household from "../../common/pages/household";

export class PolicyEngineUK extends React.Component {
    constructor(props) {
        super(props);
        this.setPolicy = this.setPolicy.bind(this);
        this.validatePolicy = this.validatePolicy.bind(this);
        this.validateHousehold = this.validateHousehold.bind(this);
        this.fetchPolicy = this.fetchPolicy.bind(this);
        this.fetchHousehold = this.fetchHousehold.bind(this);
        this.fetchEntities = this.fetchEntities.bind(this);
        this.fetchVariables = this.fetchVariables.bind(this);
        this.state = {
            policy: {},
            household: {},
            variables: {},
            entities: {},
            householdVisited: false,
            currentPage: "policy",
            invalid: false,
        }
    }

    componentDidMount() {
        this.fetchPolicy();
        this.fetchHousehold();
        this.fetchEntities();
        this.fetchVariables();
    }

    fetchPolicy() {
        fetch(this.props.api_url + "/parameters").then(res => res.json()).then(data => {this.setState({policy: urlToPolicy(data)});});
    }

    fetchHousehold() {
        fetch(this.props.api_url + "/default-household").then(res => res.json()).then(data => {this.setState({household: data});});
    }

    fetchEntities() {
        fetch(this.props.api_url + "/entities").then(res => res.json()).then(data => {this.setState({entities: data});});
    }

    fetchVariables() {
        fetch(this.props.api_url + "/variables").then(res => res.json()).then(data => {this.setState({variables: data});});
    }

    setPolicy(name, value) {
        let oldPolicy = this.state.policy;
		oldPolicy[name].value = value;
		const { policy, invalid } = (this.state.validator || (policy => {return {policy: policy, invalid: false};}))(oldPolicy);
		this.setState({policy: policy, invalid: invalid});
    }

    validatePolicy(policy) {
        if(policy.higher_threshold.value === policy.add_threshold.value) {
			policy.higher_threshold.error = "The higher rate threshold must be different than the additional rate threshold.";
			policy.add_threshold.error = "The additional rate threshold must be different than the higher rate threshold.";
			return {policy: policy, invalid: true};
		}
		return {policy: policy, invalid: false};
    }

    validateHousehold() {
        console.log(this.state.household);
        let householdData = this.state.household;
        // First, check for any empty families - remove them
        let household = householdData.household["Your household"];
        for(let benunit in household.benunit) {
            if(Object.keys(household.benunit[benunit].adult || {}).length + Object.keys(household.benunit[benunit].child || {}).length === 0) {
                delete householdData.household["Your household"].benunit[benunit];
            }
        }
        // Next, apply default names
        const benunitDefaultNames = ["Your immediate family", "Another family in your household"];
        const firstBenunitAdultNames = ["You", "Your partner"];
        const firstBenunitChildNames = ["Your first child", "Your second child", "Your third child", "Your fourth child", "Your fifth child"];
        const secondBenunitAdultNames = ["Another adult", "Their partner"];
        const secondBenunitChildNames = ["Their first child", "Their second child", "Their third child", "Their fourth child", "Their fifth child"];
        const benunitNames = Object.keys(household.benunit);
        let adultNames;
        let childNames;
        for(let i = 0; i < benunitNames.length; i++) {
            household.benunit[benunitNames[i]].label = benunitDefaultNames[i];
        }
        console.log(household);
        if(benunitNames.length > 0) {
            adultNames = Object.keys(household.benunit[benunitNames[0]].adult);
            for(let i = 0; i < adultNames.length; i++) {
                household.benunit[benunitNames[0]].adult[adultNames[i]].label = firstBenunitAdultNames[i];
            }
            childNames = Object.keys(household.benunit[benunitNames[0]].child);
            for(let i = 0; i < childNames.length; i++) {
                household.benunit[benunitNames[0]].child[childNames[i]].label = firstBenunitChildNames[i];
            }
        }
        if(benunitNames.length > 1) {
            adultNames = Object.keys(household.benunit[benunitNames[1]].adult);
            for(let i = 0; i < adultNames.length; i++) {
                household.benunit[benunitNames[1]].adult[adultNames[i]].label = secondBenunitAdultNames[i];
            }
            childNames = Object.keys(household.benunit[benunitNames[1]].child);
            for(let i = 0; i < childNames.length; i++) {
                household.benunit[benunitNames[1]].child[childNames[i]].label = secondBenunitChildNames[i];
            }
        }
        this.setState({household: householdData});
    }

    render() {
        const setPage = page => {this.setState({page: page});};
        return (
            <PolicyEngineWrapper>
                <Route path="/uk" exact>
                    <Redirect to="/uk/policy" />
                </Route>
                <Header country="uk" policy={this.state.policy} household={this.state.householdVisited}/>
                <BodyWrapper>
                    <Switch>
                        <Route path="/uk/faq">
                            <FAQ analytics={this.props.analytics} />
                        </Route>
                        <Route path="/uk/policy">
                            <Policy 
                                api_url={this.props.api_url}
                                policy={this.state.policy}
                                menuStructure={PARAMETER_MENU}
                                organisations={ORGANISATIONS}
                                selected={"/Tax/Income Tax/Labour income"}
                                open={["/Tax", "/Tax/Income Tax", "/Benefit", "/UBI Center"]}
                                currency="£"
                                setPolicy={this.setPolicy}
                                overrides={{autoUBI: <AutoUBI />}}
                                setPage={setPage}
                                invalid={this.state.invalid}
                                baseURL="/uk"
                            />
                        </Route>
                        <Route path="/uk/population-impact">
                            <PopulationImpact 
                                api_url={this.props.api_url}
                                policy={this.state.policy}
                                currency="£"
                                country="uk"
                                setPage={setPage}
                                baseURL="/uk"
                            />
                        </Route>
                        <Route path="/uk/household">
                            <Household
                                api_url={this.props.api_url}
                                policy={this.state.policy}
                                defaultOpenKeys={["Your household_", "Your immediate family_"]}
                                variables={this.state.variables}
                                currency="£"
								household={this.state.household}
                                entities={this.state.entities}
								selected="You"
								setHousehold={household => {this.setState({household: household, householdEntered: true}, () => this.validateHousehold())}}
								setPage={setPage}
                                baseURL="/uk"
                            />
                        </Route>
                    </Switch>
                </BodyWrapper>
                <Footer country="uk" />
            </PolicyEngineWrapper>
        );
    }
}