import React from "react";
import styled from "@emotion/styled";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as ObsFuncs from "../library/observable-functions";
import { colors } from "../constants";
import dayjs from "dayjs";

import {UserState, useUserState} from '../library/user-state-context'
import {UserStateActions, useUserStateActions} from '../library/user-state-actions-context'

import {
  TextBlock,
  SEO,
  Card,
  WarningBox,
  H2,
} from "../components";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import moment from 'moment';
import "react-datepicker/dist/react-datepicker.css";
import { SessionStore } from "../library/session-store";

const StyledDatePicker = styled(DatePicker)`
  border: 2px solid ${colors.purple};
  height: 60px;
  font-size: 25px;
  min-width: 230px;
  border-radius: 3px;
  padding-left: 10px;
  &::placeholder {
    font-size: 18px;
    font-family: 'Montserrat',sans-serif;
  }
`;

const H4 = styled.h4`
margin: 5px 0;
`

interface Prescreen1aProps {
  userState: UserState
  userStateActions: UserStateActions
}

class Prescreen1a extends React.Component<Prescreen1aProps, Prescreen1aState> {
  constructor(props, context){
    super(props, context)
    this.handleDateChange = this.handleDateChange.bind(this);
  }

  componentDidMount() {
  }

  async handleDateChange(name, value) {
    const {userStateActions} = this.props
    if (name === "birthDatePicked") {
      userStateActions.setBirthDate(value)

      var year62 = new Date(value).getFullYear() + 62;
      userStateActions.setYear62(year62)
      var fullRetirementAge = 0;

      fullRetirementAge = await ObsFuncs.getFullRetirementDateSimple(value)
      this.setRetireDate(value, fullRetirementAge)
    }
  }

  async setRetireDate(dateOfBirth, retireAge) {
    const {userStateActions} = this.props

    /* dayjs cannot .add() fractional years that we put into the tables
       but only months, so let us use rounded months. */
    const retireAgeInRoundedMonths = Math.round(await retireAge * 12)
    var retireDate = dayjs(dateOfBirth).add(retireAgeInRoundedMonths, 'month').toDate()

    userStateActions.setRetireDate(retireDate)
  }

  //TODO: remove the decimal years and display YY years and MM months.
  //this.friendlyRetirementAge(this.state.birthDate, this.state.retireDate, this.state.retireAge)
// friendlyRetirementAge(dobDayJS,retireDateString, retireAge) {
//     if (dobDayJS !== null && retireDateString && retireAge ) {
//       return dayjs(dobDayJS).diff(dayjs(retireDateString),'months') % Number(retireAge)
//     } else {
//       return
//     }
//   }

    render() {
        const {userState} = this.props
        const {birthDate, retireDate, fullRetirementAgeYearsOnly, fullRetirementAgeMonthsOnly} = userState
        const retireDateYear = retireDate ? retireDate.getFullYear() : null
        return (
            <div>
                <SEO title="Pre-Screen 1a" keywords={[`gatsby`, `application`, `react`]} />
                <H2>Step 1: Background Information</H2>
                <TextBlock>
                    To calculate your Social Security benefit, please input the following dates.
                </TextBlock>
                  <Card>
                    <H4>Birthdate</H4>
                    <StyledDatePicker
                    id="birthDatePicked"
                    placeholderText="Click to select a date"
<<<<<<< HEAD
                    selected={birthDate}
                    showYearDropdown
                    openToDate={birthDate || dayjs().subtract(64, 'year').toDate()}
                    onChange={(value) => this.handleDateChange("birthDatePicked", value)}
                    />
                  </Card>
                  { retireDateYear && 
                    <Card>
                    <H4>Retirement Age</H4>
                    <p>Your Full Retirement Age (FRA) to collect Social Security
                       Benefits is {fullRetirementAgeYearsOnly} years 
                       {fullRetirementAgeMonthsOnly ? " and " + 
                       fullRetirementAgeMonthsOnly+ " months ": ""} old<a href="https://www.ssa.gov/OACT/ProgData/ar_drc.html"><sup>1</sup></a>, 
                       which is in year {retireDateYear}.
                      { /* TODO remove this and replace with a function that
                       checks the tables' isActualValue's*/
                      retireDateYear>=2025 ? <WarningBox><label>This app may not
                         be able to accurately calculate your results because
                          it is still too many years away. Extrapolation based
                           on the economy and Social Security&apos;s Trustees 
                           Report may be added in a future version. 
                           </label></WarningBox> : ""
                      }</p>
                  </Card>
                  }
            </div>
=======
                    selected={this.state.birthDate}
                    onChange={this.handleDateChange}
                    showYearDropdown
                    openToDate={dayjs().subtract(65, 'years').toDate()}
                    onChange={(value) => this.handleDateChange("birthDatePicked", value)}
                    />
                    <label style={{marginLeft: '10px'}}>{this.state.birthDate !== null ? this.state.birthDate.toLocaleDateString("en-US") : null}</label>
                  </div>
                  <div>
                    <div>Retire Date</div>
                    <DatePicker
                    id="retireDatePicked"
                    placeholderText="Click to select a date"
                    selected={this.state.retireDate}
                    showYearDropdown
                    openToDate={dayjs().subtract(3, 'years').toDate()}
                    onChange={(value) => this.handleDateChange("retireDatePicked", value)}
                    />
                    <label style={{marginLeft: '10px'}}>{this.state.retireDate !== null ? this.state.retireDate.toLocaleDateString("en-US") : null}</label>
                  </div>
                </Card>
                <ButtonLinkRed to="/">Go back!</ButtonLinkRed>
                <ButtonLink to="/prescreen-1b/" style={{disabled: 'disabled-link'}}>Start</ButtonLink>
            </>
>>>>>>> Fix datepicker–better defaults, extra year mode
         )
    }
}

export default function Prescreen1aWrapper() {
  const userStateActions = useUserStateActions()
  const userState = useUserState()
  return (
    <Prescreen1a userState={userState} userStateActions={userStateActions} />
  )
}
